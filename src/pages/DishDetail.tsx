import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ExternalLink, UtensilsCrossed } from 'lucide-react';
import { useDish, useIngredients, deleteDish } from '../hooks/useDishes';
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

  if (!dish) {
    return (
      <div className="text-center py-20">
        <p className="text-muted dark:text-muted-dark text-lg">Dish not found.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">← Back to dishes</Link>
      </div>
    );
  }

  const ytId = extractYouTubeId(dish.videoUrl);

  const handleDelete = async () => {
    if (dish.id && confirm('Delete this dish and all its ingredients?')) {
      await deleteDish(dish.id);
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
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={dish.name}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : dish.imageUrl ? (
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
              <UtensilsCrossed size={56} className="text-muted/20" />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary mb-2">
                {dish.category}
              </span>
              <h2 className="text-3xl font-bold text-text dark:text-text-dark m-0 font-[family-name:var(--font-heading)]">{dish.name}</h2>
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
