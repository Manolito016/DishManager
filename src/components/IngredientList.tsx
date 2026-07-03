import { useState } from 'react';
import { Plus, Check, X, Pencil } from 'lucide-react';
import { UNITS } from '../types';
import type { Ingredient } from '../types';
import { addIngredient, updateIngredient, deleteIngredient } from '../hooks/useDishes';

interface Props {
  dishId: number;
  ingredients: Ingredient[];
}

export default function IngredientList({ dishId, ingredients }: Props) {
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', quantity: 1, unit: UNITS[0] as string });
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addIngredient({ dishId, name: form.name, quantity: form.quantity, unit: form.unit });
    setForm({ name: '', quantity: 1, unit: UNITS[0] });
    setShowAdd(false);
  };

  const startEdit = (ing: Ingredient) => {
    setEditing(ing.id ?? null);
    setForm({ name: ing.name, quantity: ing.quantity, unit: ing.unit });
  };

  const handleUpdate = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    await updateIngredient(id, { name: form.name, quantity: form.quantity, unit: form.unit });
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">Ingredients</h3>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditing(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-200 cursor-pointer"
        >
          <Plus size={14} /> {showAdd ? 'Cancel' : 'Add'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-4 p-3 rounded-lg bg-bg dark:bg-bg-dark border border-border dark:border-border-dark">
          <input
            required
            placeholder="Ingredient name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="flex-1 min-w-[120px] px-3 py-1.5 text-sm rounded border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <input
            type="number"
            min={0}
            step={0.1}
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
            className="w-20 px-3 py-1.5 text-sm rounded border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <select
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            className="px-3 py-1.5 text-sm rounded border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text dark:text-text-dark cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <button type="submit" className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-xl bg-accent text-white hover:opacity-90 cursor-pointer">
            <Check size={13} /> Save
          </button>
        </form>
      )}

      {ingredients.length === 0 ? (
        <p className="text-sm text-muted dark:text-muted-dark italic">No ingredients yet.</p>
      ) : (
        <ul className="space-y-1">
          {ingredients.map((ing) => (
            <li key={ing.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg dark:hover:bg-bg-dark group">
              {editing === ing.id ? (
                <form onSubmit={(e) => ing.id && handleUpdate(e, ing.id)} className="flex flex-wrap gap-2 flex-1">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="flex-1 min-w-[100px] px-2 py-1 text-sm rounded border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                    className="w-16 px-2 py-1 text-sm rounded border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none"
                  />
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text dark:text-text-dark cursor-pointer focus:outline-none"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button type="submit" className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-accent text-white cursor-pointer"><Check size={11} /></button>
                  <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-muted text-white cursor-pointer"><X size={11} /></button>
                </form>
              ) : (
                <>
                  <span className="flex-1 text-text dark:text-text-dark">
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-muted dark:text-muted-dark ml-2 text-sm">
                      {ing.quantity} {ing.unit}
                    </span>
                  </span>
                  <button
                    onClick={() => startEdit(ing)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => ing.id && deleteIngredient(ing.id)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
