
import { useState } from 'react';
import { useApp } from "@/contexts/AppContext";
import { Categoria, ItemCardapio } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Plus } from "lucide-react";
import ImageUpload from "./admin/ImageUpload";
import { useInputValidation } from "@/hooks/useInputValidation";
import { sanitizationService } from "@/services/sanitizationService";
import * as supabaseService from "@/services/supabaseService";

export default function AdminProductsForm() {
  const { categorias, adicionarItemCardapio } = useApp();
  const { validateRequired, validatePrice, validateImageUrl, validateTextLength, sanitizeText } = useInputValidation();
  
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [showNewCategoryField, setShowNewCategoryField] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const handleImageSelect = (file: File | null) => {
    // Apenas para manter compatibilidade, o upload real acontece no handleImageUpload
  };

  const handleImageUpload = (url: string | null) => {
    // Validar URL da imagem
    if (url && !validateImageUrl(url)) {
      toast.error("URL de imagem inválida");
      return;
    }
    setImagemUrl(url);
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'nova-categoria') {
      setShowNewCategoryField(true);
      setCategoriaId('');
    } else {
      setShowNewCategoryField(false);
      setNewCategoryName('');
      setCategoriaId(value);
    }
  };

  const createNewCategory = async (categoryName: string): Promise<number | null> => {
    try {
      const sanitizedName = sanitizeText(categoryName);
      const novaCategoria = await supabaseService.insertCategoria({ nome_categoria: sanitizedName });
      if (novaCategoria) {
        // Atualizar a lista de categorias no contexto
        window.location.reload(); // Recarregar para atualizar as categorias
        return novaCategoria.id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error("Erro ao criar nova categoria");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitizar inputs
    const nomeClean = sanitizeText(nome);
    const descricaoClean = sanitizationService.sanitizeAddress(descricao);
    const precoClean = preco.replace(',', '.');
    const newCategoryClean = sanitizeText(newCategoryName);
    
    // Validações
    if (!validateRequired(nomeClean)) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    
    if (!validateTextLength(nomeClean, 100)) {
      toast.error("Nome muito longo (máximo 100 caracteres)");
      return;
    }
    
    if (!validateRequired(descricaoClean)) {
      toast.error("Descrição é obrigatória");
      return;
    }
    
    if (!validateTextLength(descricaoClean, 500)) {
      toast.error("Descrição muito longa (máximo 500 caracteres)");
      return;
    }
    
    if (!validatePrice(precoClean)) {
      toast.error("Preço inválido (formato: 0.00)");
      return;
    }

    // Verificar se precisa criar nova categoria
    if (showNewCategoryField) {
      if (!validateRequired(newCategoryClean)) {
        toast.error("Digite o nome da nova categoria");
        return;
      }
      if (!validateTextLength(newCategoryClean, 50)) {
        toast.error("Nome da categoria muito longo (máximo 50 caracteres)");
        return;
      }
    } else if (!categoriaId) {
      toast.error("Selecione uma categoria");
      return;
    }
    
    const precoNum = parseFloat(precoClean);

    // Validar URL da imagem se fornecida
    if (imagemUrl && !validateImageUrl(imagemUrl)) {
      toast.error("URL de imagem inválida");
      return;
    }

    try {
      let finalCategoriaId = categoriaId;

      // Se está criando nova categoria, criar primeiro
      if (showNewCategoryField && newCategoryClean) {
        const novaCategoriaId = await createNewCategory(newCategoryClean);
        if (!novaCategoriaId) {
          return; // Erro já foi mostrado na função createNewCategory
        }
        finalCategoriaId = novaCategoriaId.toString();
      }

      const novoItem: Omit<ItemCardapio, 'id'> = {
        nome_item: nomeClean,
        descricao: descricaoClean,
        preco: precoNum,
        categoria_id: parseInt(finalCategoriaId),
        imagem: imagemUrl
      };
      
      adicionarItemCardapio(novoItem);
      
      // Limpar formulário
      setNome('');
      setDescricao('');
      setPreco('');
      setCategoriaId('');
      setImagemUrl(null);
      setShowNewCategoryField(false);
      setNewCategoryName('');
      
      toast.success("Produto cadastrado com sucesso!");
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      toast.error("Erro ao cadastrar produto");
    }
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateTextLength(value, 100)) {
      setNome(value);
    }
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (validateTextLength(value, 500)) {
      setDescricao(value);
    }
  };

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir apenas números, ponto e vírgula
    if (/^[\d.,]*$/.test(value) && validateTextLength(value, 10)) {
      setPreco(value);
    }
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateTextLength(value, 50)) {
      setNewCategoryName(value);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Cadastrar Novo Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto * (máximo 100 caracteres)</Label>
            <Input 
              id="nome" 
              value={nome} 
              onChange={handleNomeChange}
              placeholder="Ex: X-Burger"
              required
              maxLength={100}
            />
            <div className="text-xs text-gray-500 text-right">
              {nome.length}/100
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição * (máximo 500 caracteres)</Label>
            <Textarea 
              id="descricao" 
              value={descricao} 
              onChange={handleDescricaoChange}
              placeholder="Ex: Hambúrguer com queijo, alface e tomate"
              className="resize-none"
              rows={3}
              required
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {descricao.length}/500
            </div>
          </div>

          <ImageUpload 
            onImageSelect={handleImageSelect} 
            onImageUpload={handleImageUpload}
          />
          
          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$) * (formato: 0.00)</Label>
            <Input 
              id="preco" 
              value={preco} 
              onChange={handlePrecoChange}
              placeholder="Ex: 29.90"
              type="text"
              inputMode="decimal"
              required
              maxLength={10}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={showNewCategoryField ? 'nova-categoria' : categoriaId} onValueChange={handleCategoryChange} required>
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {sanitizationService.escapeHtml(categoria.nome_categoria)}
                  </SelectItem>
                ))}
                <SelectItem value="nova-categoria">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Criar nova categoria</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showNewCategoryField && (
            <div className="space-y-2">
              <Label htmlFor="nova-categoria-nome">Nome da Nova Categoria * (máximo 50 caracteres)</Label>
              <Input 
                id="nova-categoria-nome" 
                value={newCategoryName} 
                onChange={handleNewCategoryChange}
                placeholder="Ex: Sobremesas"
                required
                maxLength={50}
              />
              <div className="text-xs text-gray-500 text-right">
                {newCategoryName.length}/50
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar Produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
