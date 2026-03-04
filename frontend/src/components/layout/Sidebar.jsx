import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, PlusCircle, Camera, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/sessions', label: 'Sessions', icon: Users },
  { path: '/planner', label: 'Planner', icon: Calendar },
  { path: '/camera', label: 'Camera', icon: Camera },
  { path: '/ask', label: 'Ask Question', icon: PlusCircle },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 glass-strong z-20 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-semibold text-slate-600">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
