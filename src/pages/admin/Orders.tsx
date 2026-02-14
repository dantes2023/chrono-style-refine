import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_notes: string | null;
  status: string;
  total: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_title: string;
  quantity: number;
  unit_price: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  delivered: { label: "Entregue", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    setOrderItems(data || []);
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status } : null);
      toast({ title: "Status atualizado" });
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">Nenhum pedido recebido ainda.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-heading">Data</th>
                <th className="text-left p-3 font-heading">Cliente</th>
                <th className="text-left p-3 font-heading">Telefone</th>
                <th className="text-right p-3 font-heading">Total</th>
                <th className="text-center p-3 font-heading">Status</th>
                <th className="text-center p-3 font-heading">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const s = statusMap[order.status] || statusMap.pending;
                return (
                  <tr key={order.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">{new Date(order.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3 font-medium">{order.customer_name}</td>
                    <td className="p-3">{order.customer_phone}</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(order.total)}</td>
                    <td className="p-3 text-center"><Badge variant={s.variant}>{s.label}</Badge></td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="icon" onClick={() => viewOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Cliente:</strong> {selectedOrder.customer_name}</div>
                <div><strong>Telefone:</strong> {selectedOrder.customer_phone}</div>
                {selectedOrder.customer_email && <div><strong>Email:</strong> {selectedOrder.customer_email}</div>}
                {selectedOrder.customer_city && <div><strong>Cidade:</strong> {selectedOrder.customer_city}</div>}
                {selectedOrder.customer_address && <div className="col-span-2"><strong>Endereço:</strong> {selectedOrder.customer_address}</div>}
                {selectedOrder.customer_notes && <div className="col-span-2"><strong>Obs:</strong> {selectedOrder.customer_notes}</div>}
              </div>

              <div className="border-t pt-3">
                <h4 className="font-heading font-semibold mb-2">Itens</h4>
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.product_title} x{item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Select value={selectedOrder.status} onValueChange={(v) => updateStatus(selectedOrder.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
