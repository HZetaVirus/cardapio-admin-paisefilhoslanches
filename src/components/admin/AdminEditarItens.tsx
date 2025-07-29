import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { ItemCardapio, Categoria } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Edit, Trash2, Package, Star, Filter, Eye, EyeOff } from "lucide-react";
import { toggleFeaturedStatus, updateItemCardapio, deleteItemCardapio } from "@/services/cardapioService";
import { toggleCategoriaVisibilidade } from "@/services/categoriaService";

export default function AdminEditarItens() {
  const { cardapio, categorias } = useApp();
  const [selectedItem, setSelectedItem] = useState<ItemCardapio | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>('todas');
  const [formData, setFormData] = useState({
    nome_item: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    imagem: '',
    is_featured: false
  });

  // Organizar itens por categoria
  const itemsPorCategoria = categorias
    .map(categoria => ({
      categoria,
      itens: cardapio.filter(item => item.categoria_id === categoria.id)
    }))
    .filter(grupo => {
      // Se "todas" estiver selecionado, mostrar todas as categorias
      // Caso contrário, mostrar apenas a categoria selecionada
      if (selectedCategoriaId === 'todas') {
        return grupo.itens.length > 0;
      }
      return grupo.categoria.id.toString() === selectedCategoriaId && grupo.itens.length > 0;
    });

  const handleEditItem = (item: ItemCardapio) => {
    setSelectedItem(item);
    setFormData({
      nome_item: item.nome_item,
      descricao: item.descricao,
      preco: item.preco.toString(),
      categoria_id: item.categoria_id.toString(),
      imagem: item.imagem || '',
      is_featured: item.is_featured || false
    });
    setIsEditDialogOpen(true);
  };

  // Função para alternar a visibilidade da categoria
  const handleToggleCategoriaVisibilidade = async (categoria: Categoria) => {
    try {
      const novoStatus = !categoria.visivel;
      const success = await toggleCategoriaVisibilidade(categoria.id, novoStatus);
      
      if (success) {
        toast.success(novoStatus ? "Categoria agora está visível no cardápio!" : "Categoria agora está oculta no cardápio!");
        // Atualizar o estado local em vez de recarregar a página
        setCategorias(prevCategorias => 
          prevCategorias.map(cat => 
            cat.id === categoria.id ? { ...cat, visivel: novoStatus } : cat
          )
        );
      } else {
        toast.error("Erro ao alterar visibilidade da categoria.");
      }
    } catch (error) {
      console.error('Erro ao alterar visibilidade da categoria:', error);
      toast.error("Erro ao alterar visibilidade da categoria. Tente novamente.");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    try {
      const updatedItem: ItemCardapio = {
        ...selectedItem,
        nome_item: formData.nome_item,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        categoria_id: parseInt(formData.categoria_id),
        imagem: formData.imagem,
        is_featured: formData.is_featured
      };

      const success = await updateItemCardapio(updatedItem);
      
      if (success) {
        toast.success("Item atualizado com sucesso!");
        setIsEditDialogOpen(false);
        setSelectedItem(null);
        // Recarregar dados do cardápio
        window.location.reload();
      } else {
        toast.error("Erro ao atualizar item.");
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      if (error instanceof Error && error.message.includes('Máximo de 6 produtos')) {
        toast.error("Máximo de 6 produtos em destaque permitidos");
      } else {
        toast.error("Erro ao atualizar item. Tente novamente.");
      }
    }
  };

  const handleDeleteItem = async (item: ItemCardapio) => {
    if (!confirm(`Tem certeza que deseja excluir "${item.nome_item}"?`)) {
      return;
    }

    try {
      const success = await deleteItemCardapio(item.id);
      
      if (success) {
        toast.success("Item excluído com sucesso!");
        // Recarregar dados do cardápio
        window.location.reload();
      } else {
        toast.error("Erro ao excluir item. Tente novamente.");
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error("Erro ao excluir item. Tente novamente.");
    }
  };

  const handleToggleFeatured = async (item: ItemCardapio) => {
    try {
      const newFeaturedStatus = !item.is_featured;
      const success = await toggleFeaturedStatus(item.id, newFeaturedStatus);
      
      if (success) {
        toast.success(newFeaturedStatus ? "Produto adicionado aos destaques!" : "Produto removido dos destaques!");
        // Recarregar dados do cardápio
        window.location.reload();
      } else {
        toast.error("Erro ao alterar status de destaque.");
      }
    } catch (error) {
      console.error('Erro ao alterar destaque:', error);
      if (error instanceof Error && error.message.includes('Máximo de 6 produtos')) {
        toast.error("Máximo de 6 produtos em destaque permitidos");
      } else {
        toast.error("Erro ao alterar destaque. Tente novamente.");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Editar Itens do Cardápio
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Seletor de Categoria */}
        <div className="mb-6">
          <Label htmlFor="filtro-categoria" className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4" />
            Filtrar por Categoria
          </Label>
          <Select value={selectedCategoriaId} onValueChange={setSelectedCategoriaId}>
            <SelectTrigger id="filtro-categoria" className="w-full md:w-72">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Categorias</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id.toString()}>
                  {categoria.nome_categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-8">
          {cardapio.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum item cadastrado no cardápio.
            </div>
          ) : itemsPorCategoria.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum item encontrado para a categoria selecionada.
            </div>
          ) : (
            itemsPorCategoria.map(({ categoria, itens }) => (
              <div key={categoria.id} className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {categoria.nome_categoria} ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
                  </h3>
                  <Button
                    variant={categoria.visivel ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleCategoriaVisibilidade(categoria)}
                    className="flex items-center gap-1"
                  >
                    {categoria.visivel ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Visível
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Oculta
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itens.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800 shadow-sm">
                      {item.imagem && (
                        <img 
                          src={item.imagem} 
                          alt={item.nome_item}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-lg">{item.nome_item}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.descricao}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Produto em destaque:</span>
                          <Button
                            variant={item.is_featured ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleFeatured(item)}
                            className="flex items-center gap-1"
                          >
                            <Star className={`h-3 w-3 ${item.is_featured ? 'fill-current' : ''}`} />
                            {item.is_featured ? 'Destacado' : 'Destacar'}
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome_item">Nome do Item</Label>
                <Input
                  id="nome_item"
                  value={formData.nome_item}
                  onChange={(e) => setFormData({...formData, nome_item: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({...formData, preco: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoria_id} 
                  onValueChange={(value) => setFormData({...formData, categoria_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.nome_categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="imagem">URL da Imagem</Label>
                <Input
                  id="imagem"
                  value={formData.imagem}
                  onChange={(e) => setFormData({...formData, imagem: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                />
                <Label htmlFor="is_featured" className="flex items-center gap-1">
                  <Star className={`h-4 w-4 ${formData.is_featured ? 'fill-current text-yellow-500' : ''}`} />
                  Produto em destaque
                </Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Salvar Alterações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
