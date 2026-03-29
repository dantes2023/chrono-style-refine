import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  method: z.enum(["pix", "credit_card"]),
  amount: z.number().positive(),
  order_id: z.string().uuid(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
  }),
  card: z
    .object({
      number: z.string().min(13).max(19),
      holder_name: z.string().min(2),
      exp_month: z.string().length(2),
      exp_year: z.string().min(2).max(4),
      cvv: z.string().min(3).max(4),
    })
    .optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { method, amount, order_id, customer, card } = parsed.data;

    if (method === "credit_card" && !card) {
      return new Response(
        JSON.stringify({ error: "Dados do cartão são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get payment settings
    const { data: settings, error: settingsError } = await supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Configuração de pagamento não encontrada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.is_active || settings.gateway === "none") {
      return new Response(
        JSON.stringify({ error: "Pagamento online não está ativo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = settings.config as Record<string, string>;
    let result: any;

    switch (settings.gateway) {
      case "mercadopago":
        result = await processMercadoPago(config, method, amount, order_id, customer, card);
        break;
      case "stripe":
        result = await processStripe(config, method, amount, order_id, customer, card);
        break;
      case "asaas":
        result = await processAsaas(config, method, amount, order_id, customer, card);
        break;
      case "gerencianet":
        result = await processGerencianet(config, method, amount, order_id, customer, card);
        break;
      case "pagseguro":
        result = await processPagSeguro(config, method, amount, order_id, customer, card);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Gateway '${settings.gateway}' não suportado` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: result.status === "approved" ? "paid" : "awaiting_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Payment error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── Mercado Pago ────────────────────────────────────────
async function processMercadoPago(
  config: Record<string, string>,
  method: string,
  amount: number,
  orderId: string,
  customer: any,
  card?: any
) {
  const accessToken = config.access_token;
  if (!accessToken) throw new Error("Mercado Pago: access_token não configurado");

  if (method === "pix") {
    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": orderId,
      },
      body: JSON.stringify({
        transaction_amount: amount,
        payment_method_id: "pix",
        payer: { email: customer.email || "cliente@email.com" },
        description: `Pedido ${orderId.slice(0, 8)}`,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Mercado Pago PIX error [${res.status}]: ${JSON.stringify(data)}`);

    return {
      gateway: "mercadopago",
      method: "pix",
      status: data.status,
      pix_qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      pix_qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      pix_copy_paste: data.point_of_interaction?.transaction_data?.qr_code,
      payment_id: data.id,
      expires_at: data.date_of_expiration,
    };
  }

  // Credit card
  const res = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": orderId + "-card",
    },
    body: JSON.stringify({
      transaction_amount: amount,
      payment_method_id: "visa",
      installments: 1,
      payer: { email: customer.email || "cliente@email.com" },
      description: `Pedido ${orderId.slice(0, 8)}`,
      card: {
        card_number: card!.number.replace(/\s/g, ""),
        cardholder: { name: card!.holder_name },
        expiration_month: parseInt(card!.exp_month),
        expiration_year: parseInt(card!.exp_year.length === 2 ? `20${card!.exp_year}` : card!.exp_year),
        security_code: card!.cvv,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Mercado Pago Card error [${res.status}]: ${JSON.stringify(data)}`);

  return {
    gateway: "mercadopago",
    method: "credit_card",
    status: data.status,
    payment_id: data.id,
  };
}

// ─── Stripe ──────────────────────────────────────────────
async function processStripe(
  config: Record<string, string>,
  method: string,
  amount: number,
  orderId: string,
  customer: any,
  card?: any
) {
  const secretKey = config.secret_key;
  if (!secretKey) throw new Error("Stripe: secret_key não configurado");

  const amountCents = Math.round(amount * 100);

  if (method === "pix") {
    // Create PaymentIntent with PIX
    const params = new URLSearchParams({
      amount: amountCents.toString(),
      currency: "brl",
      "payment_method_types[]": "pix",
      "metadata[order_id]": orderId,
    });

    const res = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(secretKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Stripe PIX error [${res.status}]: ${JSON.stringify(data)}`);

    // Confirm with PIX
    const confirmRes = await fetch(
      `https://api.stripe.com/v1/payment_intents/${data.id}/confirm`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(secretKey + ":")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          payment_method: "pix",
          return_url: "https://renovar-agr.lovable.app/loja/checkout",
        }).toString(),
      }
    );
    const confirmData = await confirmRes.json();

    return {
      gateway: "stripe",
      method: "pix",
      status: confirmData.status === "succeeded" ? "approved" : "pending",
      client_secret: data.client_secret,
      payment_id: data.id,
      pix_qr_code: confirmData.next_action?.pix_display_qr_code?.data,
      pix_qr_code_base64: confirmData.next_action?.pix_display_qr_code?.image_url_png,
      pix_copy_paste: confirmData.next_action?.pix_display_qr_code?.data,
      expires_at: confirmData.next_action?.pix_display_qr_code?.expires_at,
    };
  }

  // Credit card via PaymentIntent
  const params = new URLSearchParams({
    amount: amountCents.toString(),
    currency: "brl",
    "payment_method_types[]": "card",
    "metadata[order_id]": orderId,
    "payment_method_data[type]": "card",
    "payment_method_data[card][number]": card!.number.replace(/\s/g, ""),
    "payment_method_data[card][exp_month]": card!.exp_month,
    "payment_method_data[card][exp_year]": card!.exp_year.length === 2 ? `20${card!.exp_year}` : card!.exp_year,
    "payment_method_data[card][cvc]": card!.cvv,
    confirm: "true",
  });

  const res = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(secretKey + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe Card error [${res.status}]: ${JSON.stringify(data)}`);

  return {
    gateway: "stripe",
    method: "credit_card",
    status: data.status === "succeeded" ? "approved" : "pending",
    payment_id: data.id,
  };
}

// ─── Asaas ───────────────────────────────────────────────
async function processAsaas(
  config: Record<string, string>,
  method: string,
  amount: number,
  orderId: string,
  customer: any,
  card?: any
) {
  const apiKey = config.api_key;
  if (!apiKey) throw new Error("Asaas: api_key não configurado");
  const baseUrl = "https://api.asaas.com/v3";

  // Create or find customer
  const custRes = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: { access_token: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      externalReference: orderId,
    }),
  });
  const custData = await custRes.json();
  const customerId = custData.id;

  const billingType = method === "pix" ? "PIX" : "CREDIT_CARD";
  const paymentBody: any = {
    customer: customerId,
    billingType,
    value: amount,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    externalReference: orderId,
    description: `Pedido ${orderId.slice(0, 8)}`,
  };

  if (method === "credit_card" && card) {
    paymentBody.creditCard = {
      holderName: card.holder_name,
      number: card.number.replace(/\s/g, ""),
      expiryMonth: card.exp_month,
      expiryYear: card.exp_year.length === 2 ? `20${card.exp_year}` : card.exp_year,
      ccv: card.cvv,
    };
    paymentBody.creditCardHolderInfo = {
      name: customer.name,
      email: customer.email || "cliente@email.com",
      phone: customer.phone || "",
    };
  }

  const payRes = await fetch(`${baseUrl}/payments`, {
    method: "POST",
    headers: { access_token: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(paymentBody),
  });
  const payData = await payRes.json();
  if (!payRes.ok) throw new Error(`Asaas error [${payRes.status}]: ${JSON.stringify(payData)}`);

  if (method === "pix") {
    // Get PIX QR Code
    const qrRes = await fetch(`${baseUrl}/payments/${payData.id}/pixQrCode`, {
      headers: { access_token: apiKey },
    });
    const qrData = await qrRes.json();

    return {
      gateway: "asaas",
      method: "pix",
      status: payData.status === "RECEIVED" ? "approved" : "pending",
      pix_qr_code: qrData.payload,
      pix_qr_code_base64: qrData.encodedImage ? `data:image/png;base64,${qrData.encodedImage}` : null,
      pix_copy_paste: qrData.payload,
      payment_id: payData.id,
      expires_at: qrData.expirationDate,
    };
  }

  return {
    gateway: "asaas",
    method: "credit_card",
    status: payData.status === "CONFIRMED" ? "approved" : "pending",
    payment_id: payData.id,
  };
}

// ─── Gerencianet / Efí ───────────────────────────────────
async function processGerencianet(
  config: Record<string, string>,
  method: string,
  amount: number,
  orderId: string,
  customer: any,
  card?: any
) {
  const clientId = config.client_id;
  const clientSecret = config.client_secret;
  if (!clientId || !clientSecret) throw new Error("Gerencianet: credenciais não configuradas");

  // Get OAuth token
  const authRes = await fetch("https://pix.api.efipay.com.br/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ grant_type: "client_credentials" }),
  });
  const authData = await authRes.json();
  if (!authRes.ok) throw new Error(`Gerencianet auth error [${authRes.status}]: ${JSON.stringify(authData)}`);
  const token = authData.access_token;

  if (method === "pix") {
    const pixKey = config.pix_key;
    if (!pixKey) throw new Error("Gerencianet: chave PIX não configurada");

    const amountCents = amount.toFixed(2);
    const txid = orderId.replace(/-/g, "").slice(0, 35);

    const cobRes = await fetch(`https://pix.api.efipay.com.br/v2/cob/${txid}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        calendario: { expiracao: 3600 },
        devedor: { nome: customer.name },
        valor: { original: amountCents },
        chave: pixKey,
        infoAdicionais: [{ nome: "Pedido", valor: orderId.slice(0, 8) }],
      }),
    });
    const cobData = await cobRes.json();
    if (!cobRes.ok) throw new Error(`Gerencianet COB error [${cobRes.status}]: ${JSON.stringify(cobData)}`);

    // Get QR Code
    const qrRes = await fetch(`https://pix.api.efipay.com.br/v2/loc/${cobData.loc.id}/qrcode`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const qrData = await qrRes.json();

    return {
      gateway: "gerencianet",
      method: "pix",
      status: "pending",
      pix_qr_code: qrData.qrcode,
      pix_qr_code_base64: qrData.imagemQrcode,
      pix_copy_paste: qrData.qrcode,
      payment_id: cobData.txid,
    };
  }

  // Card via Gerencianet charge API
  const chargeRes = await fetch("https://api.gerencianet.com.br/v1/charge", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ name: `Pedido ${orderId.slice(0, 8)}`, value: Math.round(amount * 100), amount: 1 }],
    }),
  });
  const chargeData = await chargeRes.json();
  if (!chargeRes.ok) throw new Error(`Gerencianet charge error [${chargeRes.status}]: ${JSON.stringify(chargeData)}`);

  const payRes = await fetch(`https://api.gerencianet.com.br/v1/charge/${chargeData.data.charge_id}/pay`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      payment: {
        credit_card: {
          customer: { name: customer.name, email: customer.email || "cliente@email.com", phone_number: customer.phone },
          installments: 1,
          payment_token: card!.number, // Note: Gerencianet requires client-side tokenization
        },
      },
    }),
  });
  const payData = await payRes.json();

  return {
    gateway: "gerencianet",
    method: "credit_card",
    status: payData.data?.status === "paid" ? "approved" : "pending",
    payment_id: chargeData.data?.charge_id,
  };
}

// ─── PagSeguro ───────────────────────────────────────────
async function processPagSeguro(
  config: Record<string, string>,
  method: string,
  amount: number,
  orderId: string,
  customer: any,
  card?: any
) {
  const token = config.token;
  if (!token) throw new Error("PagSeguro: token não configurado");

  const amountCents = Math.round(amount * 100);

  if (method === "pix") {
    const res = await fetch("https://api.pagseguro.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference_id: orderId,
        customer: {
          name: customer.name,
          email: customer.email || "cliente@email.com",
          phones: customer.phone
            ? [{ country: "55", area: customer.phone.slice(0, 2), number: customer.phone.slice(2) }]
            : [],
        },
        qr_codes: [{ amount: { value: amountCents }, expiration_date: new Date(Date.now() + 3600000).toISOString() }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`PagSeguro PIX error [${res.status}]: ${JSON.stringify(data)}`);

    const qr = data.qr_codes?.[0];
    return {
      gateway: "pagseguro",
      method: "pix",
      status: "pending",
      pix_qr_code: qr?.text,
      pix_qr_code_base64: qr?.links?.[0]?.href ? qr.links[0].href : null,
      pix_copy_paste: qr?.text,
      payment_id: data.id,
    };
  }

  // Credit card
  const res = await fetch("https://api.pagseguro.com/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference_id: orderId,
      customer: {
        name: customer.name,
        email: customer.email || "cliente@email.com",
      },
      charges: [
        {
          reference_id: orderId,
          amount: { value: amountCents, currency: "BRL" },
          payment_method: {
            type: "CREDIT_CARD",
            installments: 1,
            card: {
              number: card!.number.replace(/\s/g, ""),
              exp_month: card!.exp_month,
              exp_year: card!.exp_year.length === 2 ? `20${card!.exp_year}` : card!.exp_year,
              security_code: card!.cvv,
              holder: { name: card!.holder_name },
            },
          },
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PagSeguro Card error [${res.status}]: ${JSON.stringify(data)}`);

  return {
    gateway: "pagseguro",
    method: "credit_card",
    status: data.charges?.[0]?.status === "PAID" ? "approved" : "pending",
    payment_id: data.id,
  };
}
