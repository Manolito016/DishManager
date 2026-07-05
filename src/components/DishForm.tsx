import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Type, FileText, Tag, Image, Video, Search, X, Loader2, Clock, Users, ChefHat, BarChart3, BookOpen, Plus } from 'lucide-react';
import { CATEGORIES, DIFFICULTIES, DIETARY_TAGS, EMPTY_NUTRITION } from '../types';
import type { Dish, Category, Difficulty, DietaryTag } from '../types';
import { addDish, updateDish, useSteps, saveSteps } from '../hooks/useDishes';
import { useToast } from '../context/ToastContext';

interface Props { existing?: Dish }

interface RecipeResult {
  idMeal: string; strMeal: string; strMealThumb: string;
  strCategory: string; strInstructions: string; strYoutube: string;
}

export default function DishForm({ existing }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const steps = useSteps(existing?.id);

  const [form, setForm] = useState({
    name: '', description: '', category: CATEGORIES[0] as Category,
    imageUrl: '', videoUrl: '', source: '', servings: 4,
    prepTime: 0, cookTime: 0, difficulty: 'Easy' as Difficulty,
    rating: 0, favorite: false, dietary: [] as DietaryTag[],
    nutrition: { ...EMPTY_NUTRITION },
  });
  const [stepList, setStepList] = useState<{ text: string }[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name, description: existing.description, category: existing.category,
        imageUrl: existing.imageUrl, videoUrl: existing.videoUrl, source: existing.source || '',
        servings: existing.servings || 4, prepTime: existing.prepTime || 0,
        cookTime: existing.cookTime || 0, difficulty: existing.difficulty || 'Easy',
        rating: existing.rating || 0, favorite: existing.favorite || false,
        dietary: existing.dietary || [], nutrition: existing.nutrition || { ...EMPTY_NUTRITION },
      });
      setStepList(steps.map((s) => ({ text: s.text })));
    }
  }, [existing, steps]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (existing) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.length < 2) { setResults([]); setShowDropdown(false); return; }
    setLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        const data = await res.json();
        const meals: RecipeResult[] = data.meals ?? [];
        setResults(meals.slice(0, 8));
        setShowDropdown(meals.length > 0);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query, existing]);

  const handleSelect = (recipe: RecipeResult) => {
    const parsedSteps = recipe.strInstructions
      .split(/\r?\n/)
      .map((s) => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(Boolean)
      .map((text) => ({ text }));
    setForm({
      ...form, name: recipe.strMeal,
      description: recipe.strInstructions.slice(0, 300) + (recipe.strInstructions.length > 300 ? '...' : ''),
      category: mapCategory(recipe.strCategory), imageUrl: recipe.strMealThumb,
      videoUrl: recipe.strYoutube || '',
    });
    setStepList(parsedSteps.length > 0 ? parsedSteps : []);
    setQuery(recipe.strMeal); setResults([]); setShowDropdown(false);
  };

  const mapCategory = (apiCat: string): Category => {
    const lower = apiCat.toLowerCase();
    const match = CATEGORIES.find((c) => c.toLowerCase() === lower);
    if (match) return match;
    if (['dessert', 'sweet'].some(k => lower.includes(k))) return 'Dessert';
    if (['starter', 'appetizer'].some(k => lower.includes(k))) return 'Starter';
    if (['side', 'salad'].some(k => lower.includes(k))) return 'Side Dish';
    return 'Main Course';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dishData = { ...form };
    if (existing?.id) {
      await updateDish(existing.id, dishData);
      await saveSteps(existing.id, stepList);
      toast('Dish updated!', 'success');
    } else {
      const id = await addDish(dishData);
      if (id) await saveSteps(id as number, stepList);
      toast('Dish added!', 'success');
    }
    navigate('/');
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const setNum = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: parseFloat(e.target.value) || 0 }));

  const extractYouTubeId = (url: string): string | null =>
    url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;

  const handleVideoKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && form.videoUrl.trim()) {
      e.preventDefault();
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(form.videoUrl)}`, '_blank');
    }
  };

  const videoId = extractYouTubeId(form.videoUrl);
  const toggleDietary = (tag: DietaryTag) => {
    setForm((f) => ({
      ...f, dietary: f.dietary.includes(tag) ? f.dietary.filter((t) => t !== tag) : [...f.dietary, tag],
    }));
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200";
  const labelCls = "flex items-center gap-2 text-sm font-medium text-text dark:text-text-dark mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-text dark:text-text-dark mb-4 sm:mb-6 font-[family-name:var(--font-heading)]">
        {existing ? 'Edit Dish' : 'Add New Dish'}
      </h2>
      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Dish Name */}
        <div ref={dropdownRef} className="relative">
          <label className={labelCls}><Type size={14} className="text-muted" /> Dish Name <span className="text-danger">*</span></label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input required value={query || form.name}
              onChange={(e) => { setQuery(e.target.value); setForm((f) => ({ ...f, name: e.target.value })); }}
              onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
              placeholder="Search recipes online..." className={inputCls + " pl-9 pr-10"} />
            {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />}
          </div>
          {showDropdown && (
            <div className="absolute z-40 w-full mt-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto">
              {results.map((r) => (
                <button key={r.idMeal} type="button" onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/10 transition-colors cursor-pointer border-b border-border/50 dark:border-border-dark/50 last:border-0">
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
          <label className={labelCls}><FileText size={14} className="text-muted" /> Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Brief description..." className={inputCls + " resize-none"} />
        </div>

        {/* Row: Category + Difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}><Tag size={14} className="text-muted" /> Category</label>
            <select value={form.category} onChange={set('category')} className={inputCls + " cursor-pointer"}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}><ChefHat size={14} className="text-muted" /> Difficulty</label>
            <select value={form.difficulty} onChange={set('difficulty')} className={inputCls + " cursor-pointer"}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Row: Servings + Prep + Cook */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}><Users size={14} className="text-muted" /> Servings</label>
            <input type="number" min={1} value={form.servings} onChange={setNum('servings')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}><Clock size={14} className="text-muted" /> Prep (min)</label>
            <input type="number" min={0} value={form.prepTime} onChange={setNum('prepTime')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}><Clock size={14} className="text-muted" /> Cook (min)</label>
            <input type="number" min={0} value={form.cookTime} onChange={setNum('cookTime')} className={inputCls} />
          </div>
        </div>

        {/* Source */}
        <div>
          <label className={labelCls}><BookOpen size={14} className="text-muted" /> Source</label>
          <input type="text" value={form.source} onChange={set('source')} placeholder="e.g. Grandma's recipe, Jamie Oliver..." className={inputCls} />
        </div>

        {/* Dietary Tags */}
        <div>
          <label className={labelCls}><Tag size={14} className="text-muted" /> Dietary Tags</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleDietary(tag)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${form.dietary.includes(tag) ? 'bg-primary text-white border-primary' : 'border-border dark:border-border-dark text-muted hover:border-primary hover:text-primary'}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition */}
        <div>
          <label className={labelCls}><BarChart3 size={14} className="text-muted" /> Nutrition (per serving)</label>
          <div className="grid grid-cols-4 gap-2">
            {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => (
              <div key={key}>
                <input type="number" min={0} placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={form.nutrition[key] || ''} onChange={(e) => setForm((f) => ({ ...f, nutrition: { ...f.nutrition, [key]: parseFloat(e.target.value) || 0 } }))}
                  className="w-full px-2 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
            ))}
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className={labelCls}><Image size={14} className="text-muted" /> Image URL</label>
          <input type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." className={inputCls} />
          {form.imageUrl && (
            <div className="mt-2 relative group">
              <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-border dark:border-border-dark" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all cursor-pointer"><X size={14} /></button>
            </div>
          )}
        </div>

        {/* YouTube Video */}
        <div>
          <label className={labelCls}><Video size={14} className="text-muted" /> YouTube Video</label>
          <input type="text" value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            onKeyDown={handleVideoKey} placeholder="Paste URL for preview, or type + Enter to search" className={inputCls} />
          {videoId && (
            <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-border dark:border-border-dark">
              <iframe src={`https://www.youtube.com/embed/${videoId}`} title="Video preview" className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}
        </div>

        {/* Cooking Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls + " mb-0"}><FileText size={14} className="text-muted" /> Cooking Steps</label>
            <button type="button" onClick={() => setStepList((s) => [...s, { text: '' }])}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer">
              <Plus size={12} /> Add Step
            </button>
          </div>
          {stepList.length === 0 && <p className="text-xs text-muted italic">No steps yet. Add steps for cooking instructions.</p>}
          <div className="space-y-2">
            {stepList.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2.5 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">{i + 1}</span>
                <textarea value={step.text} rows={2}
                  onChange={(e) => setStepList((s) => s.map((st, j) => j === i ? { text: e.target.value } : st))}
                  placeholder={`Step ${i + 1}...`}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none" />
                <button type="button" onClick={() => setStepList((s) => s.filter((_, j) => j !== i))}
                  className="mt-2 p-1 text-muted hover:text-danger transition-colors cursor-pointer"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
          <Save size={16} /> {existing ? 'Update Dish' : 'Save Dish'}
        </button>
        <button type="button" onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-bg dark:hover:bg-bg-dark transition-all duration-200 cursor-pointer">
          Cancel
        </button>
      </div>
    </form>
  );
}
