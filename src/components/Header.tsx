import { useTheme } from '../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, ChefHat, Utensils, CalendarDays, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface Props {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ sidebarCollapsed, onToggleSidebar }: Props) {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const showSidebarToggle = location.pathname === '/meal-plan';

  const navItem = (to: string, label: string, Icon: typeof Utensils) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
          active
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted dark:text-muted-dark hover:text-text dark:hover:text-text-dark hover:bg-primary/10'
        }`}
      >
        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border dark:border-border-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all duration-200 cursor-pointer text-muted dark:text-muted-dark hover:text-primary"
              aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <ChefHat size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-text dark:text-text-dark m-0 font-[family-name:var(--font-heading)] tracking-wide">
              Dish Manager
            </h1>
          </Link>
        </div>

        <nav className="flex items-center gap-1.5">
          {navItem('/', 'Dishes', Utensils)}
          {navItem('/meal-plan', 'Meal Plan', CalendarDays)}
          <div className="w-px h-6 bg-border dark:bg-border-dark mx-1" />
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all duration-200 cursor-pointer text-muted dark:text-muted-dark hover:text-primary"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
