import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={toggleTheme}
      className="relative flex items-center gap-2 transition-all duration-300 hover:scale-105 overflow-hidden group"
      title={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      <div className="relative flex items-center gap-2">
        {theme === 'dark' ? (
          <>
            <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            <span className="hidden sm:inline font-medium">Claro</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
            <span className="hidden sm:inline font-medium">Escuro</span>
          </>
        )}
      </div>
      
      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </Button>
  );
}