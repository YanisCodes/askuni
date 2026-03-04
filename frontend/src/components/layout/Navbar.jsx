import { Link } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-strong z-30 flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-white/50 text-slate-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="text-xl font-bold text-slate-800 no-underline tracking-tight">
          AskUni
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/60">
          <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center text-sm font-medium">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-600">
            {user?.name}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-xl hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
