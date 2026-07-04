import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { useDishes, deleteDish } from '../hooks/useDishes';
import SearchBar from '../components/SearchBar';
import DishCard from '../components/DishCard';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const dishes = useDishes(search, category);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this dish and all its ingredients?')) {
      await deleteDish(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text dark:text-text-dark m-0 font-[family-name:var(--font-heading)]">
          My Dishes
          {dishes.length > 0 && (
            <span className="text-sm font-normal text-muted dark:text-muted-dark ml-2 font-[family-name:var(--font-body)]">
              ({dishes.length})
            </span>
          )}
        </h2>
        <Link
          to="/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark shadow-sm hover:shadow transition-all duration-200 no-underline text-sm cursor-pointer"
        >
          <Plus size={16} /> Add Dish
        </Link>
      </div>

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
      />

      {dishes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={28} className="text-primary/50" />
          </div>
          <p className="text-muted dark:text-muted-dark text-lg mb-2">
            {search || category ? 'No dishes match your search.' : 'No dishes yet.'}
          </p>
          {!search && !category && (
            <Link
              to="/add"
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary-light font-medium text-sm transition-colors no-underline"
            >
              <Plus size={14} /> Add your first dish
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
