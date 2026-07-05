import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, CalendarDays } from 'lucide-react';
import type { WeeklyPlan } from '../types';
import { createWeeklyPlan, deleteWeeklyPlan, renameWeeklyPlan } from '../hooks/useDishes';
import { useToast } from '../context/ToastContext';

interface Props {
  plans: WeeklyPlan[];
  activePlanId: number | undefined;
  onSelect: (id: number) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function MealPlanSidebar({ plans, activePlanId, onSelect, collapsed }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const { toast, confirm } = useToast();

  const handleAdd = async () => {
    const name = `Week ${plans.length + 1}`;
    const id = await createWeeklyPlan(name);
    if (id) onSelect(id);
  };

  const handleRename = async (id: number) => {
    const name = editName.trim();
    if (name) {
      await renameWeeklyPlan(id, name);
    }
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (await confirm('Delete this weekly plan and all its meals?')) {
      await deleteWeeklyPlan(id);
      toast('Plan deleted', 'success');
    }
  };

  const startEdit = (plan: WeeklyPlan) => {
    setEditingId(plan.id ?? null);
    setEditName(plan.name);
  };

  return (
    <aside
      className={`shrink-0 border-r border-border dark:border-border-dark bg-surface dark:bg-surface-dark transition-all duration-300 flex flex-col h-full ${
        collapsed ? 'w-12' : 'w-64'
      }`}
    >
      {!collapsed && (
        <>
          {/* Add new plan */}
          <div className="p-3 border-b border-border dark:border-border-dark">
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm rounded-xl border border-dashed border-border dark:border-border-dark text-muted dark:text-muted-dark hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer"
            >
              <Plus size={14} /> New Plan
            </button>
          </div>

          {/* Plan list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {plans.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays size={24} className="mx-auto text-muted/30 mb-2" />
                <p className="text-xs text-muted dark:text-muted-dark">No plans yet</p>
              </div>
            ) : (
              plans.map((plan) => {
                const isActive = plan.id === activePlanId;
                const isEditing = plan.id === editingId;

                return (
                  <div
                    key={plan.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text dark:text-text-dark hover:bg-primary/10'
                    }`}
                    onClick={() => plan.id && onSelect(plan.id)}
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') plan.id && handleRename(plan.id); if (e.key === 'Escape') setEditingId(null); }}
                          className="flex-1 min-w-0 px-1.5 py-0.5 text-sm rounded border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark focus:outline-none"
                        />
                        <button onClick={() => plan.id && handleRename(plan.id)} className="p-0.5 text-accent hover:text-accent-light cursor-pointer"><Check size={12} /></button>
                        <button onClick={() => setEditingId(null)} className="p-0.5 text-muted hover:text-text cursor-pointer"><X size={12} /></button>
                      </div>
                    ) : (
                      <>
                        <CalendarDays size={14} className={isActive ? 'text-white/70' : 'text-muted dark:text-muted-dark'} />
                        <span className="flex-1 truncate font-medium">{plan.name}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(plan); }}
                            className={`p-1 rounded-md hover:bg-white/20 cursor-pointer ${isActive ? 'text-white/70 hover:text-white' : 'text-muted hover:text-primary'}`}
                            title="Rename"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); plan.id && handleDelete(plan.id); }}
                            className={`p-1 rounded-md hover:bg-white/20 cursor-pointer ${isActive ? 'text-white/70 hover:text-white' : 'text-muted hover:text-danger'}`}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </aside>
  );
}
