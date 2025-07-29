import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useInputValidation } from "@/hooks/useInputValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginForm() {
  // Estado para admin login
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const { loginAdmin, setCurrentView } = useApp();
  const { validateEmail, validateTextLength } = useInputValidation();
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Sanitizar inputs
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPassword = adminSenha.trim();
    
    if (!cleanEmail || !cleanPassword) {
      toast.error("Por favor, digite o email e senha de administrador");
      setIsLoading(false);
      return;
    }
    
    // Validate email format
    if (!validateEmail(cleanEmail)) {
      toast.error("Email inválido");
      setIsLoading(false);
      return;
    }
    
    // Validar comprimento da senha
    if (!validateTextLength(cleanPassword, 100) || cleanPassword.length < 8) {
      toast.error("Senha deve ter pelo menos 8 caracteres");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Tentando login admin no formulário...');
      const sucesso = await loginAdmin(cleanEmail, cleanPassword);
      if (sucesso) {
        console.log('Login admin realizado, redirecionando...');
        setCurrentView('admin');
      }
    } catch (error) {
      console.error("Erro no login do admin:", error);
      toast.error("Erro inesperado no login do administrador");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateTextLength(value, 254)) {
      setAdminEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateTextLength(value, 100)) {
      setAdminSenha(value);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-[80vh] p-3 w-full max-w-md mx-auto relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes wave {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes bubble {
            0% { transform: translateY(100vh) scale(0); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-100vh) scale(1); opacity: 0; }
          }
        `
      }} />
      
      {/* Fundo animado com gradiente escuro para admin */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(45deg, rgba(30, 41, 59, 0.03) 0%, rgba(51, 65, 85, 0.05) 25%, rgba(30, 41, 59, 0.03) 50%, rgba(51, 65, 85, 0.05) 75%, rgba(30, 41, 59, 0.03) 100%)',
          animation: 'wave 8s ease-in-out infinite'
        }}
      />
      
      {/* Círculos de fundo pulsantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-slate-200/10 rounded-full animate-pulse"
          style={{animationDuration: '3s'}}
        />
        <div 
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-slate-300/10 rounded-full animate-pulse" 
          style={{animationDelay: '1s', animationDuration: '4s'}}
        />
        <div 
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-slate-100/10 rounded-full animate-pulse" 
          style={{animationDelay: '2s', animationDuration: '5s'}}
        />
      </div>
      
      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-slate-200/20 rounded-full"
            style={{
              left: `${10 + i * 15}%`,
              width: `${15 + i * 2}px`,
              height: `${15 + i * 2}px`,
              animation: `bubble ${12 + i * 2}s infinite linear`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>
      
      <Card 
        className={`w-full border-0 relative overflow-hidden transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          boxShadow: `
            0 20px 40px -12px rgba(0, 0, 0, 0.15),
            0 8px 16px -8px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
          transform: isPressed ? 'translateY(-2px) scale(0.98)' : 'translateY(-2px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        <CardHeader className="text-center p-4 space-y-2 relative z-10">
          <CardTitle className="text-xl md:text-2xl font-bold" style={{ color: '#FF5722' }}>Bem-vindo ao Cardápio Digital</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Faça login para acessar o dashboard</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleAdminLogin}>
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm">Email do Administrador</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="Digite o email do administrador"
                value={adminEmail}
                onChange={handleEmailChange}
                className="text-sm"
                disabled={isLoading}
                autoComplete="username"
                maxLength={254}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-senha" className="text-sm">Senha de Administrador</Label>
              <Input
                id="admin-senha"
                type="password"
                placeholder="Digite a senha de administrador (min. 8 caracteres)"
                value={adminSenha}
                onChange={handlePasswordChange}
                className="text-sm"
                disabled={isLoading}
                autoComplete="current-password"
                maxLength={100}
                minLength={8}
              />
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0">
            <Button 
              type="submit" 
              className="w-full text-white hover:opacity-90"
              style={{ backgroundColor: '#FF5722' }}
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}