import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ExternalLink, UtensilsCrossed, Clock, Users, BookOpen, Star, Flame } from 'lucide-react';
import { useDish, useIngredients, useSteps, deleteDish, setRating } from '../hooks/useDishes';
import { useToast } from '../context/ToastContext';
import IngredientList from '../components/IngredientList';

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
}

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dishId = id ? parseInt(id) : undefined;
  const dish = useDish(dishId);
  const ingredients = useIngredients(dishId);
  const steps = useSteps(dishId);
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
          </div>
        </div>
      </div>
    );
  }

  const ytId = extractYouTubeId(dish.videoUrl);
  const totalTime = (dish.prepTime || 0) + (dish.cookTime || 0);

  const handleDelete = async () => {
    if (dish.id && await confirm('Delete this dish and all its ingredients?')) {
      await deleteDish(dish.id);
      toast('Dish deleted', 'success');
      navigate('/');
    }
  };

  const handleRate = async (r: number) => {
    if (dish.id) { await setRating(dish.id, r); toast(`Rated ${r} stars`, 'success'); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-muted-dark hover:text-primary transition-colors mb-4 no-underline">
        <ArrowLeft size={14} /> Back to dishes
      </Link>

      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden shadow-sm">
        {/* Header */}
        <div className="aspect-video bg-bg dark:bg-bg-dark relative">
          {ytId ? (
            <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`} title={`${dish.name} video`}
              className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          ) : dish.imageUrl ? (
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
              <UtensilsCrossed size={56} className="text-muted/20" />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {/* Title + actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">{dish.category}</span>
                {dish.difficulty && <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent">{dish.difficulty}</span>}
                {(dish.dietary || []).map((t) => (
                  <span key={t} className="px-2 py-0.5 text-xs rounded-full border border-border dark:border-border-dark text-muted">{t}</span>
                ))}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text dark:text-text-dark m-0 font-[family-name:var(--font-heading)]">{dish.name}</h2>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link to={`/dish/${dish.id}/edit`}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all no-underline">
                <Pencil size={14} /> Edit
              </Link>
              <button onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-danger/30 text-danger hover:bg-danger hover:text-white transition-all cursor-pointer">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted dark:text-muted-dark mb-4">
            {totalTime > 0 && <span className="flex items-center gap-1"><Clock size={14} /> {totalTime} min</span>}
            {dish.servings > 0 && <span className="flex items-center gap-1"><Users size={14} /> {dish.servings} servings</span>}
            {dish.source && <span className="flex items-center gap-1"><BookOpen size={14} /> {dish.source}</span>}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => handleRate(s)}
                className={`p-0.5 transition-colors cursor-pointer ${s <= (dish.rating || 0) ? 'text-amber-400' : 'text-muted/30 hover:text-amber-300'}`}>
                <Star size={18} fill={s <= (dish.rating || 0) ? 'currentColor' : 'none'} />
              </button>
            ))}
            <span className="text-xs text-muted ml-1">{dish.rating > 0 ? `${dish.rating}/5` : 'Not rated'}</span>
          </div>

          {/* Description */}
          {dish.description && <p className="text-text dark:text-text-dark leading-relaxed mb-6">{dish.description}</p>}

          {/* Nutrition */}
          {dish.nutrition && (dish.nutrition.calories > 0 || dish.nutrition.protein > 0) && (
            <div className="grid grid-cols-4 gap-3 mb-6 p-3 rounded-xl bg-bg dark:bg-bg-dark border border-border dark:border-border-dark">
              <div className="text-center">
                <Flame size={16} className="mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-text dark:text-text-dark">{dish.nutrition.calories}</p>
                <p className="text-xs text-muted">cal</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text dark:text-text-dark">{dish.nutrition.protein}g</p>
                <p className="text-xs text-muted">protein</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text dark:text-text-dark">{dish.nutrition.carbs}g</p>
                <p className="text-xs text-muted">carbs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text dark:text-text-dark">{dish.nutrition.fat}g</p>
                <p className="text-xs text-muted">fat</p>
              </div>
            </div>
          )}

          {/* Cooking Steps */}
          {steps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-3">Instructions</h3>
              <ol className="space-y-3">
                {steps.map((step) => (
                  <li key={step.id} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{step.order}</span>
                    <p className="text-text dark:text-text-dark leading-relaxed">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {dish.videoUrl && !ytId && (
            <a href={dish.videoUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-light transition-colors mb-4 no-underline">
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
