
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  onImageUpload: (url: string | null) => void;
  currentImage?: string;
}

export default function ImageUpload({ onImageSelect, onImageUpload, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      console.log('Uploading file:', filePath);

      // Upload do arquivo para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('produto-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Obter a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('produto-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setSelectedFile(file);
    onImageSelect(file);

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload automaticamente
    const uploadedUrl = await uploadImageToSupabase(file);
    if (uploadedUrl) {
      onImageUpload(uploadedUrl);
      toast.success('Imagem carregada com sucesso!');
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    onImageSelect(null);
    onImageUpload(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Imagem do Produto</Label>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative w-full max-w-xs">
          <img
            src={preview}
            alt="Preview do produto"
            className="w-full h-32 object-cover rounded-lg border"
          />
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              ) : (
                <Image className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {isUploading ? 'Carregando...' : 'Clique para enviar'}
              </span>
              {!isUploading && ' ou arraste uma imagem'}
            </div>
            <div className="text-xs text-gray-400">
              PNG, JPG, JPEG até 5MB
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={triggerFileInput}
        className="w-full"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {preview ? 'Trocar Imagem' : 'Selecionar Imagem'}
          </>
        )}
      </Button>
    </div>
  );
}
