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
    <div className="min-h-screen flex flex-col bg-slate-800 text-white">
      <main className="flex-1">
        {!isAdmin && <LoginForm />}
        {isAdmin && <AdminView />}
      </main>
      
      <footer className="bg-slate-900 shadow-md py-3 border-t border-slate-700">
        <div className="container mx-auto px-3 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Admin - Cardápio Digital
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Index;