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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Result {
  id: string;
  title: string;
  description: string;
  detailed_description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

const ResultsPage = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    detailed_description: "",
    image_url: "",
    is_active: true,
  });

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar resultados", variant: "destructive" });
      return;
    }
    setResults(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchResults(); }, []);

  const resetForm = () => {
    setFormData({ title: "", description: "", detailed_description: "", image_url: "", is_active: true });
    setEditingResult(null);
  };

  const handleEdit = (result: Result) => {
    setEditingResult(result);
    setFormData({
      title: result.title,
      description: result.description,
      detailed_description: result.detailed_description || "",
      image_url: result.image_url || "",
      is_active: result.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este resultado?")) return;
    const { error } = await supabase.from("results").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir resultado", variant: "destructive" });
      return;
    }
    toast({ title: "Resultado excluído com sucesso" });
    fetchResults();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      detailed_description: formData.detailed_description || null,
      image_url: formData.image_url || null,
      display_order: editingResult ? editingResult.display_order : results.length,
    };

    const { error } = editingResult
      ? await supabase.from("results").update(payload).eq("id", editingResult.id)
      : await supabase.from("results").insert(payload);

    if (error) {
      toast({ title: `Erro ao ${editingResult ? "atualizar" : "criar"} resultado`, variant: "destructive" });
      setIsSaving(false);
      return;
    }

    toast({ title: `Resultado ${editingResult ? "atualizado" : "criado"} com sucesso` });
    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
    fetchResults();
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
          <h1 className="font-heading text-3xl font-bold">Resultados</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a galeria de resultados do trabalho de campo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Resultado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResult ? "Editar Resultado" : "Novo Resultado"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Colheita de Milho 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do resultado..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailed_description">Descrição Detalhada</Label>
                <Textarea
                  id="detailed_description"
                  value={formData.detailed_description}
                  onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                  placeholder="Informações detalhadas exibidas ao clicar..."
                  rows={5}
                />
              </div>

              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Foto do Resultado"
              />

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>

              <Button type="submit" className="w-full bg-gradient-primary" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  editingResult ? "Atualizar Resultado" : "Criar Resultado"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum resultado cadastrado. Clique em "Novo Resultado" para começar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <img
                        src={result.image_url || "/placeholder.svg"}
                        alt={result.title}
                        className="w-20 h-14 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{result.title}</span>
                        <p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {result.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(result)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(result.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;
