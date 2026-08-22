import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColors[type]}`}>
        {icons[type]}
        <p className="font-bold text-sm">{message}</p>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
