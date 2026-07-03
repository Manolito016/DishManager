import { Link } from 'react-router-dom';
import { Pencil, Trash2, Play, UtensilsCrossed } from 'lucide-react';
import type { Dish } from '../types';

interface Props {
  dish: Dish;
  onDelete: (id: number) => void;
}

export default function DishCard({ dish, onDelete }: Props) {
  const ytId = extractYouTubeId(dish.videoUrl);

  return (
    <div className="group bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-200">
      <div className="aspect-video bg-bg dark:bg-bg-dark overflow-hidden relative">
        {ytId ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
              alt={dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play size={16} className="text-primary ml-0.5" fill="currentColor" />
              </div>
            </div>
          </>
        ) : dish.imageUrl ? (
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            <UtensilsCrossed size={40} className="text-muted/30" />
          </div>
        )}
        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-primary text-white shadow-sm">
          {dish.category}
        </span>
      </div>

      <div className="p-4">
        <Link to={`/dish/${dish.id}`} className="block no-underline">
          <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1 group-hover:text-primary transition-colors duration-200 leading-snug">
            {dish.name}
          </h3>
        </Link>
        <div className="flex gap-2 mt-3">
          <Link
            to={`/dish/${dish.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 no-underline cursor-pointer"
          >
            <Pencil size={13} /> Edit
          </Link>
          <button
            onClick={() => dish.id && onDelete(dish.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl border border-danger/30 text-danger hover:bg-danger hover:text-white transition-all duration-200 cursor-pointer"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}
