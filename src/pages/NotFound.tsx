import { Link } from 'react-router-dom';
import { Home, UtensilsCrossed } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <UtensilsCrossed size={36} className="text-primary/40" />
      </div>
      <h2 className="text-3xl font-bold text-text dark:text-text-dark mb-2 font-[family-name:var(--font-heading)]">404</h2>
      <p className="text-muted dark:text-muted-dark text-lg mb-6">This recipe seems to have gone missing...</p>
      <Link to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark shadow-sm transition-all no-underline">
        <Home size={16} /> Back to dishes
      </Link>
    </div>
  );
}
