import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Type, FileText, Tag, Image, Video, Search, X, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../types';
import type { Dish } from '../types';
import { addDish, updateDish } from '../hooks/useDishes';

interface Props {
  existing?: Dish;
}

interface RecipeResult {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strInstructions: string;
  strYoutube: string;
}

export default function DishForm({ existing }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0] as string,
    imageUrl: '',
    videoUrl: '',
  });

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description,
        category: existing.category,
        imageUrl: existing.imageUrl,
        videoUrl: existing.videoUrl,
      });
    }
  }, [existing]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search against TheMealDB
  useEffect(() => {
    if (existing) return; // Don't search when editing
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        const data = await res.json();
        const meals: RecipeResult[] = data.meals ?? [];
        setResults(meals.slice(0, 8));
        setShowDropdown(meals.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query, existing]);

  const handleSelect = (recipe: RecipeResult) => {
    setForm({
      name: recipe.strMeal,
      description: recipe.strInstructions.slice(0, 300) + (recipe.strInstructions.length > 300 ? '...' : ''),
      category: mapCategory(recipe.strCategory),
      imageUrl: recipe.strMealThumb,
      videoUrl: recipe.strYoutube || '',
    });
    setQuery(recipe.strMeal);
    setResults([]);
    setShowDropdown(false);
  };

  const mapCategory = (apiCat: string): string => {
    const lower = apiCat.toLowerCase();
    const match = CATEGORIES.find((c) => c.toLowerCase() === lower);
    if (match) return match;
    if (['seafood', 'chicken', 'beef', 'lamb', 'pork', 'vegetarian', 'vegan'].includes(lower)) return 'Lunch';
    if (['starter', 'side'].includes(lower)) return 'Appetizer';
    if (['breakfast'].includes(lower)) return 'Breakfast';
    return CATEGORIES[0] as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existing?.id) {
      await updateDish(existing.id, form);
    } else {
      await addDish(form);
    }
    navigate('/');
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] ?? null;
  };

  const videoId = extractYouTubeId(form.videoUrl);

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-6 font-[family-name:var(--font-heading)]">
        {existing ? 'Edit Dish' : 'Add New Dish'}
      </h2>

      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-6 space-y-5">
        {/* Dish Name with autocomplete */}
        <div ref={dropdownRef} className="relative">
          <label className="flex items-center gap-2 text-sm font-medium text-text dark:text-text-dark mb-1.5">
            <Type size={14} className="text-muted" /> Dish Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              required
              value={query || form.name}
              onChange={(e) => {
                setQuery(e.target.value);
                setForm((f) => ({ ...f, name: e.target.value }));
              }}
              onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
              placeholder="Search recipes online..."
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
            />
            {loading && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />
            )}
          </div>

          {/* Search results dropdown */}
          {showDropdown && (
            <div className="absolute z-40 w-full mt-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.idMeal}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/10 transition-colors cursor-pointer border-b border-border/50 dark:border-border-dark/50 last:border-0"
                >
                  <img src={r.strMealThumb} alt={r.strMeal} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text dark:text-text-dark truncate">{r.strMeal}</p>
                    <p className="text-xs text-muted dark:text-muted-dark">{r.strCategory}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text dark:text-text-dark mb-1.5">
            <FileText size={14} className="text-muted" /> Description
          </label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={3}
            placeholder="Brief description of the dish..."
            className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text dark:text-text-dark mb-1.5">
            <Tag size={14} className="text-muted" /> Category
          </label>
          <select
            value={form.category}
            onChange={set('category')}
            className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Image URL */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text dark:text-text-dark mb-1.5">
            <Image size={14} className="text-muted" /> Image URL
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={set('imageUrl')}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
          />
          {form.imageUrl && (
            <div className="mt-2 relative group">
              <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-border dark:border-border-dark" />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* YouTube Video */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text dark:text-text-dark mb-1.5">
            <Video size={14} className="text-muted" /> YouTube Video
          </label>
          <input
            type="url"
            value={form.videoUrl}
            onChange={set('videoUrl')}
            placeholder="Paste YouTube URL here..."
            className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
          />
          {videoId && (
            <div className="mt-3 relative group">
              <div className="aspect-video rounded-xl overflow-hidden border border-border dark:border-border-dark bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video preview"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, videoUrl: '' }))}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all cursor-pointer"
                title="Remove video"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        >
          <Save size={16} /> {existing ? 'Update Dish' : 'Add Dish'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-bg dark:hover:bg-bg-dark transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft size={16} /> Cancel
        </button>
      </div>
    </form>
  );
}
