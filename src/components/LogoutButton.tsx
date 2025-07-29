import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function LogoutButton({ isMobile = false, onNavigate }: LogoutButtonProps) {
  const { logout } = useApp();
  
  const handleClick = () => {
    console.log('Botão de logout clicado');
    logout();
    if (onNavigate) onNavigate();
  };
  
  return (
    <Button 
      variant="ghost"
      onClick={handleClick}
      className={isMobile ? "justify-start h-[50px]" : "h-[50px]"}
    >
      <span className="text-3xl mr-2">🚪</span> Sair
    </Button>
  );
}