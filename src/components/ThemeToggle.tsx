import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      className="h-[50px] w-[50px] rounded-full"
    >
      {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </Button>
  );
}