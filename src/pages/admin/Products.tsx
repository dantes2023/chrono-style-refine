import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  icon_name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  subcategory_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
}

const iconOptions = [
  { value: "Sprout", label: "Broto" },
  { value: "FlaskConical", label: "Ciência" },
  { value: "TrendingUp", label: "Crescimento" },
  { value: "Handshake", label: "Parceria" },
  { value: "Leaf", label: "Folha" },
  { value: "Wheat", label: "Trigo" },
];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory_id: "" as string | null,
    icon_name: "Sprout",
    image_url: "",
    is_active: true,
  });

  const fetchData = async () => {
    const [prodRes, catRes, subRes] = await Promise.all([
      supabase.from("products").select("*").order("display_order"),
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("subcategories").select("*").order("display_order"),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setSubcategories(subRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredSubs = subcategories.filter(
    (s) => s.category_id === categories.find((c) => c.name === formData.category)?.id
  );

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "", subcategory_id: null, icon_name: "Sprout", image_url: "", is_active: true });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      category: product.category,
      subcategory_id: product.subcategory_id || null,
      icon_name: product.icon_name,
      image_url: product.image_url || "",
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir produto", variant: "destructive" }); return; }
    toast({ title: "Produto excluído com sucesso" });
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const productData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      subcategory_id: formData.subcategory_id || null,
      icon_name: formData.icon_name,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      display_order: editingProduct ? editingProduct.display_order : products.length,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
      if (error) { toast({ title: "Erro ao atualizar produto", variant: "destructive" }); setIsSaving(false); return; }
      toast({ title: "Produto atualizado com sucesso" });
    } else {
      const { error } = await supabase.from("products").insert(productData);
      if (error) { toast({ title: "Erro ao criar produto", variant: "destructive" }); setIsSaving(false); return; }
      toast({ title: "Produto criado com sucesso" });
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
    fetchData();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os produtos exibidos no site</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" />Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v, subcategory_id: null })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subcategoria</Label>
                  <Select value={formData.subcategory_id || ""} onValueChange={(v) => setFormData({ ...formData, subcategory_id: v || null })}>
                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    <SelectContent>
                      {filteredSubs.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select value={formData.icon_name} onValueChange={(v) => setFormData({ ...formData, icon_name: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((i) => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} label="Imagem do Produto (opcional)" />
              <div className="flex items-center space-x-2">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                <Label>Produto Ativo</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : editingProduct ? "Atualizar Produto" : "Criar Produto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista de Produtos</CardTitle></CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Subcategoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const sub = subcategories.find((s) => s.id === product.subcategory_id);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{sub?.name || "—"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
