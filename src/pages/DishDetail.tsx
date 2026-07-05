import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ExternalLink, UtensilsCrossed, Play } from 'lucide-react';
import { useDish, useIngredients, deleteDish } from '../hooks/useDishes';
import { useToast } from '../context/ToastContext';
import IngredientList from '../components/IngredientList';

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dishId = id ? parseInt(id) : undefined;
  const dish = useDish(dishId);
  const ingredients = useIngredients(dishId);
  const { toast, confirm } = useToast();

  if (!dish) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="skeleton h-4 w-24 mb-4 text-muted" />
        <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden">
          <div className="skeleton aspect-video w-full text-muted" />
          <div className="p-4 sm:p-6 space-y-4">
            <div className="skeleton h-5 w-20 rounded-full text-muted" />
            <div className="skeleton h-8 w-64 text-muted" />
            <div className="skeleton h-4 w-full text-muted" />
            <div className="skeleton h-4 w-3/4 text-muted" />
          </div>
        </div>
      </div>
    );
  }

  const ytId = extractYouTubeId(dish.videoUrl);

  const handleDelete = async () => {
    if (dish.id && await confirm('Delete this dish and all its ingredients?')) {
      await deleteDish(dish.id);
      toast('Dish deleted', 'success');
      navigate('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-muted-dark hover:text-primary transition-colors mb-4 no-underline">
        <ArrowLeft size={14} /> Back to dishes
      </Link>

      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden shadow-sm">
        {/* Header image / video */}
        <div className="aspect-video bg-bg dark:bg-bg-dark relative">
          {ytId ? (
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative group cursor-pointer no-underline"
            >
              <img
                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={22} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium flex items-center gap-1">
                <ExternalLink size={11} /> YouTube
              </div>
            </a>
          ) : dish.imageUrl ? (
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
              <UtensilsCrossed size={56} className="text-muted/20" />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary mb-2">
                {dish.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text dark:text-text-dark m-0 font-[family-name:var(--font-heading)]">{dish.name}</h2>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to={`/dish/${dish.id}/edit`}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 no-underline"
              >
                <Pencil size={14} /> Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-danger/30 text-danger hover:bg-danger hover:text-white transition-all duration-200 cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {dish.description && (
            <p className="text-text dark:text-text-dark leading-relaxed mb-6">{dish.description}</p>
          )}

          {dish.videoUrl && !ytId && (
            <a
              href={dish.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-light transition-colors mb-4 no-underline"
            >
              <ExternalLink size={14} /> Watch video tutorial
            </a>
          )}

          <hr className="border-border dark:border-border-dark my-6" />

          <IngredientList dishId={dish.id!} ingredients={ingredients} />
        </div>
      </div>
    </div>
  );
}
