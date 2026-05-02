import { Link } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const initial = user?.name?.[0]?.toUpperCase() || '·';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-strong z-30 flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="lg:hidden p-2 rounded-lg hover:bg-primary-200/40 text-primary-500 transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-1.5 group">
          <span className="w-2 h-2 rounded-full bg-accent-500 group-hover:bg-accent-600 transition-colors" />
          <span className="text-[18px] font-semibold text-primary-800 tracking-tight">
            AskUni
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />

        <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-primary-200/70">
          <div className="w-8 h-8 rounded-lg bg-primary-700 text-white flex items-center justify-center text-[13px] font-medium select-none">
            {initial}
          </div>
          <span className="hidden sm:block text-[13px] font-medium text-primary-700 max-w-[140px] truncate">
            {user?.name}
          </span>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-lg text-primary-400 hover:text-accent-600 hover:bg-primary-200/40 transition-colors cursor-pointer"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
