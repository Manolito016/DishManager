import { Link } from 'react-router-dom';
import { Pencil, Trash2, Star, Clock, Heart } from 'lucide-react';
import type { Dish } from '../types';
import { toggleFavorite } from '../hooks/useDishes';

interface Props { dish: Dish; onDelete: (id: number) => void }

export default function DishCard({ dish, onDelete }: Props) {
  const ytId = extractYouTubeId(dish.videoUrl);
  const totalTime = (dish.prepTime || 0) + (dish.cookTime || 0);

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (dish.id) await toggleFavorite(dish.id, !dish.favorite);
  };

  return (
    <div className="group bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-200">
      <div className="aspect-video bg-bg dark:bg-bg-dark overflow-hidden relative">
        {ytId ? (
          <>
            <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs font-medium">Video</div>
          </>
        ) : dish.imageUrl ? (
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            <span className="text-40">🍽️</span>
          </div>
        )}
        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-primary text-white shadow-sm">{dish.category}</span>
        <button onClick={handleFav}
          className={`absolute bottom-2.5 right-2.5 p-1.5 rounded-full transition-all cursor-pointer ${dish.favorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white'}`}>
          <Heart size={14} fill={dish.favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/dish/${dish.id}`} className="block no-underline">
          <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1 group-hover:text-primary transition-colors duration-200 leading-snug">{dish.name}</h3>
        </Link>
        {dish.description && (
          <p className="text-sm text-muted dark:text-muted-dark line-clamp-2 mb-2 leading-relaxed">{dish.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted dark:text-muted-dark mb-3">
          {dish.rating > 0 && (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Star size={12} fill="currentColor" /> {dish.rating}
            </span>
          )}
          {totalTime > 0 && <span className="flex items-center gap-0.5"><Clock size={12} /> {totalTime}m</span>}
          {dish.difficulty && <span>{dish.difficulty}</span>}
        </div>
        <div className="flex gap-2">
          <Link to={`/dish/${dish.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 no-underline cursor-pointer">
            <Pencil size={13} /> Edit
          </Link>
          <button onClick={() => dish.id && onDelete(dish.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl border border-danger/30 text-danger hover:bg-danger hover:text-white transition-all duration-200 cursor-pointer">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
}
