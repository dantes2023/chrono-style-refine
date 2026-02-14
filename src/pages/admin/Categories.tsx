import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [catForm, setCatForm] = useState({ name: "", is_active: true });
  const [subForm, setSubForm] = useState({ name: "", category_id: "", is_active: true });

  const fetchData = async () => {
    const [catRes, subRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("subcategories").select("*").order("display_order"),
    ]);
    setCategories(catRes.data || []);
    setSubcategories(subRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Category CRUD
  const resetCatForm = () => { setCatForm({ name: "", is_active: true }); setEditingCat(null); };

  const handleEditCat = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, is_active: cat.is_active });
    setIsCatDialogOpen(true);
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Excluir esta categoria e todas as suas subcategorias?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", variant: "destructive" }); return; }
    toast({ title: "Categoria excluída" });
    fetchData();
  };

  const handleSubmitCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const data = { ...catForm, display_order: editingCat ? editingCat.display_order : categories.length };

    if (editingCat) {
      const { error } = await supabase.from("categories").update(data).eq("id", editingCat.id);
      if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); setIsSaving(false); return; }
      toast({ title: "Categoria atualizada" });
    } else {
      const { error } = await supabase.from("categories").insert(data);
      if (error) { toast({ title: "Erro ao criar", variant: "destructive" }); setIsSaving(false); return; }
      toast({ title: "Categoria criada" });
    }

    setIsSaving(false);
    setIsCatDialogOpen(false);
    resetCatForm();
    fetchData();
  };

  // Subcategory CRUD
  const resetSubForm = () => { setSubForm({ name: "", category_id: "", is_active: true }); setEditingSub(null); };

  const handleEditSub = (sub: Subcategory) => {
    setEditingSub(sub);
    setSubForm({ name: sub.name, category_id: sub.category_id, is_active: sub.is_active });
    setIsSubDialogOpen(true);
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Excluir esta subcategoria?")) return;
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", variant: "destructive" }); return; }
    toast({ title: "Subcategoria excluída" });
    fetchData();
  };

  const openNewSubDialog = (categoryId: string) => {
    resetSubForm();
    setSubForm((prev) => ({ ...prev, category_id: categoryId }));
    setIsSubDialogOpen(true);
  };

  const handleSubmitSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const subsInCat = subcategories.filter((s) => s.category_id === subForm.category_id);
    const data = { ...subForm, display_order: editingSub ? editingSub.display_order : subsInCat.length };

    if (editingSub) {
      const { error } = await supabase.from("subcategories").update(data).eq("id", editingSub.id);
      if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); setIsSaving(false); return; }
      toast({ title: "Subcategoria atualizada" });
    } else {
      const { error } = await supabase.from("subcategories").insert(data);
      if (error) { toast({ title: "Erro ao criar", variant: "destructive" }); setIsSaving(false); return; }
      toast({ title: "Subcategoria criada" });
    }

    setIsSaving(false);
    setIsSubDialogOpen(false);
    resetSubForm();
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground mt-1">Gerencie categorias e subcategorias de produtos</p>
        </div>
        <Dialog open={isCatDialogOpen} onOpenChange={(o) => { setIsCatDialogOpen(o); if (!o) resetCatForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCat ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCat} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={catForm.is_active} onCheckedChange={(c) => setCatForm({ ...catForm, is_active: c })} />
                <Label>Ativa</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : editingCat ? "Atualizar" : "Criar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subcategory dialog */}
      <Dialog open={isSubDialogOpen} onOpenChange={(o) => { setIsSubDialogOpen(o); if (!o) resetSubForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSub ? "Editar Subcategoria" : "Nova Subcategoria"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitSub} className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={subForm.category_id} onValueChange={(v) => setSubForm({ ...subForm, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} required />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={subForm.is_active} onCheckedChange={(c) => setSubForm({ ...subForm, is_active: c })} />
              <Label>Ativa</Label>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary" disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : editingSub ? "Atualizar" : "Criar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Categories list with subcategories */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias e Subcategorias</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma categoria cadastrada.</p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {categories.map((cat) => {
                const subs = subcategories.filter((s) => s.category_id === cat.id);
                return (
                  <AccordionItem key={cat.id} value={cat.id}>
                    <div className="flex items-center">
                      <AccordionTrigger className="flex-1 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="font-heading font-semibold">{cat.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${cat.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {cat.is_active ? "Ativa" : "Inativa"}
                          </span>
                          <span className="text-xs text-muted-foreground">{subs.length} subcategorias</span>
                        </div>
                      </AccordionTrigger>
                      <div className="flex items-center mr-4">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditCat(cat); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <AccordionContent>
                      <div className="pl-4 space-y-2">
                        {subs.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{sub.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${sub.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {sub.is_active ? "Ativa" : "Inativa"}
                              </span>
                            </div>
                            <div>
                              <Button variant="ghost" size="icon" onClick={() => handleEditSub(sub)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSub(sub.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => openNewSubDialog(cat.id)}>
                          <Plus className="mr-1 h-3 w-3" />
                          Adicionar Subcategoria
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage;
