import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, UtensilsCrossed, Heart } from 'lucide-react';
import { DIETARY_TAGS } from '../types';
import type { DietaryTag } from '../types';
import { useDishes, deleteDish } from '../hooks/useDishes';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/SearchBar';
import DishCard from '../components/DishCard';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState<DietaryTag | ''>('');
  const dishes = useDishes(search, category);
  const { toast, confirm } = useToast();

  const filtered = dishes.filter((d) => {
    if (showFavorites && !d.favorite) return false;
    if (dietaryFilter && !(d.dietary || []).includes(dietaryFilter)) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    if (await confirm('Delete this dish and all its ingredients?')) {
      await deleteDish(id);
      toast('Dish deleted', 'success');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text dark:text-text-dark m-0 font-[family-name:var(--font-heading)]">
          My Dishes
          {filtered.length > 0 && (
            <span className="text-sm font-normal text-muted dark:text-muted-dark ml-2 font-[family-name:var(--font-body)]">
              ({filtered.length})
            </span>
          )}
        </h2>
        <Link to="/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark shadow-sm hover:shadow transition-all duration-200 no-underline text-sm cursor-pointer">
          <Plus size={16} /> Add Dish
        </Link>
      </div>

      <SearchBar search={search} onSearchChange={setSearch} category={category} onCategoryChange={setCategory} />

      {/* Extra filters row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button onClick={() => setShowFavorites(!showFavorites)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${showFavorites ? 'bg-red-500 text-white border-red-500' : 'border-border dark:border-border-dark text-muted hover:border-red-400 hover:text-red-400'}`}>
          <Heart size={12} fill={showFavorites ? 'currentColor' : 'none'} /> Favorites
        </button>
        {DIETARY_TAGS.map((tag) => (
          <button key={tag} onClick={() => setDietaryFilter(dietaryFilter === tag ? '' : tag)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${dietaryFilter === tag ? 'bg-primary text-white border-primary' : 'border-border dark:border-border-dark text-muted hover:border-primary hover:text-primary'}`}>
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={28} className="text-primary/50" />
          </div>
          <p className="text-muted dark:text-muted-dark text-lg mb-2">
            {search || category || showFavorites || dietaryFilter ? 'No dishes match your filters.' : 'No dishes yet.'}
          </p>
          {!search && !category && !showFavorites && !dietaryFilter && (
            <Link to="/add" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-light font-medium text-sm transition-colors no-underline">
              <Plus size={14} /> Add your first dish
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((dish) => (
            <DishCard key={dish.id} dish={dish} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
