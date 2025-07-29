
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import PWAInstallButton from "@/components/PWAInstallButton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminHeaderProps {
  onLogout?: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  const { logout, adminUser } = useApp();
  
  const handleLogout = () => {
    console.log('Logout admin iniciado');
    logout();
    if (onLogout) onLogout();
  };

  return (
    <div className="flex justify-between items-center mb-4 md:mb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Painel do Administrador</h2>
        {adminUser && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Logado como: {adminUser.email}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <PWAInstallButton />
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          Sair
        </Button>
      </div>
    </div>
  );
}
