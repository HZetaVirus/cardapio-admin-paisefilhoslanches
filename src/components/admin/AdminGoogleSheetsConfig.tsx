
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings2, FileSpreadsheet, Link, Save } from "lucide-react";

export default function AdminGoogleSheetsConfig() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSave = () => {
    if (!sheetUrl.trim()) {
      toast.error("Por favor, insira a URL do Google Sheets");
      return;
    }
    
    // Aqui você salvaria a configuração
    localStorage.setItem('googleSheetsUrl', sheetUrl);
    setIsConfigured(true);
    toast.success("Configuração do Google Sheets salva com sucesso!");
  };

  return (
    <Card className="w-full powerbi-card">
      <CardHeader className="powerbi-card-header">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl powerbi-title">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <span className="truncate">Configuração Google Sheets</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="powerbi-card-content">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheetUrl" className="flex items-center gap-2 text-sm font-medium">
              <FileSpreadsheet className="h-4 w-4" />
              URL do Google Sheets
            </Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="sheetUrl" 
                value={sheetUrl} 
                onChange={(e) => setSheetUrl(e.target.value)} 
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="pl-10 powerbi-input"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            className="w-full sm:w-auto powerbi-button"
            size="default"
          >
            <Save className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Salvar Configuração</span>
            <span className="xs:hidden">Salvar</span>
          </Button>
          
          {isConfigured && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent-foreground">
                ✅ Google Sheets configurado com sucesso!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
