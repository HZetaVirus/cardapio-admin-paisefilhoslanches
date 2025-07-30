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
      className={`relative flex items-center gap-2 transition-all duration-300 hover:scale-105 overflow-hidden group border-2 shadow-sm font-medium ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white' 
          : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900'
      }`}
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