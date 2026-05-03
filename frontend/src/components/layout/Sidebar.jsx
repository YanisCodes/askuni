import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, PlusCircle, Camera, BarChart3, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/sessions', label: 'Sessions', icon: Users },
  { path: '/planner', label: 'Planner', icon: Calendar },
  { path: '/camera', label: 'Camera', icon: Camera },
  { path: '/focus-history', label: 'Focus History', icon: BarChart3 },
  { path: '/ask', label: 'Ask Question', icon: PlusCircle },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary-900/25 backdrop-blur-[2px] z-20 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 glass-strong z-20 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-[13px] font-medium uppercase tracking-wider text-primary-400">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-primary-200/40 text-primary-400 hover:text-primary-700 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="px-3 py-5 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-150 no-underline group ${
                  isActive
                    ? 'text-primary-800 bg-primary-200/40'
                    : 'text-primary-500 hover:bg-primary-200/30 hover:text-primary-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-colors ${
                      isActive ? 'bg-accent-500' : 'bg-transparent group-hover:bg-primary-300'
                    }`}
                  />
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className={isActive ? 'text-accent-600' : ''}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
