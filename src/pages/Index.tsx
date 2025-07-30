import { useApp } from "@/contexts/AppContext";
import AdminView from "@/components/AdminView";
import LoginForm from "@/components/LoginForm";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";

const Index = () => {
  const { currentView, isAdmin } = useApp();
  
  useRealtimeSubscriptions();
  
  // Debug log
  console.log('Current view:', currentView);
  console.log('Is admin:', isAdmin);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white">
      <main className="flex-1">
        {!isAdmin && <LoginForm />}
        {isAdmin && <AdminView />}
      </main>
      
      <footer className="bg-white dark:bg-slate-800 shadow-md py-3 border-t border-gray-200 dark:border-slate-600">
        <div className="container mx-auto px-3 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-300 font-medium">
            © {new Date().getFullYear()} Cardápio Digital - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Index;