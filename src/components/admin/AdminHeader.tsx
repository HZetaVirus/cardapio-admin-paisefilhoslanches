
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
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Painel do Administrador</h2>
        {adminUser && (
          <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">
            Logado como: {adminUser.email}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <PWAInstallButton />
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm"
        >
          <LogOut size={16} />
          <span className="font-medium">Sair</span>
        </Button>
      </div>
    </div>
  );
}
