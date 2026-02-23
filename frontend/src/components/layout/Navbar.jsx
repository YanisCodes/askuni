import { Link } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-secondary-200 z-30 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 text-gray-600"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="text-xl font-bold text-primary-700 no-underline">
          AskUni
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {user?.name}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-secondary-100 text-gray-600"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
