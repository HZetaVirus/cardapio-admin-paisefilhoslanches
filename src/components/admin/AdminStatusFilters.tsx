
import { StatusPedido } from "@/contexts/AppContext";

interface StatusOption {
  value: StatusPedido;
  label: string;
  count: number;
  color: string;
  emoji: string;
}

interface AdminStatusFiltersProps {
  statusOptions: StatusOption[];
  filtroStatus: StatusPedido;
  onStatusChange: (status: StatusPedido) => void;
}

export default function AdminStatusFilters({ 
  statusOptions, 
  filtroStatus, 
  onStatusChange 
}: AdminStatusFiltersProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
      {statusOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onStatusChange(option.value)}
          className={`${option.color} rounded-lg p-2 md:p-3 transition-all flex flex-col items-center justify-center h-20 md:h-24 border-2 ${
            filtroStatus === option.value ? 'border-primary shadow-lg' : 'border-transparent'
          }`}
        >
          <div className="text-2xl mb-1">{option.emoji}</div>
          <span className="font-medium text-xs md:text-sm">{option.label}</span>
          <span className="text-base md:text-lg font-bold mt-1">{option.count}</span>
        </button>
      ))}
    </div>
  );
}
