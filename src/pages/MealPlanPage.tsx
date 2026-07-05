import { useState, useEffect } from 'react';
import { Plus, X, CalendarDays, Search, ShoppingCart, Printer, Shuffle, Copy } from 'lucide-react';
import { DAYS, MEAL_TIMES, CATEGORIES } from '../types';
import type { Day, MealTime, Category, Ingredient } from '../types';
import { useDishes, useMealPlan, useWeeklyPlans, setMealPlanDish, clearMealPlanSlot, getIngredientsForDishes, autoFillMealPlan, copyWeeklyPlan } from '../hooks/useDishes';
import { useToast } from '../context/ToastContext';
import MealPlanSidebar from '../components/MealPlanSidebar';

interface Props {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function MealPlanPage({ sidebarCollapsed, onToggleSidebar }: Props) {
  const dishes = useDishes();
  const weeklyPlans = useWeeklyPlans();
  const [activePlanId, setActivePlanId] = useState<number | undefined>(undefined);
  const plan = useMealPlan(activePlanId);
  const [picker, setPicker] = useState<{ day: Day; mealTime: MealTime; courseType: Category } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState<Ingredient[] | null>(null);
  const { toast, confirm } = useToast();

  // Auto-select first plan when plans load (no auto-create)
  useEffect(() => {
    if (weeklyPlans.length > 0 && !activePlanId) {
      setActivePlanId(weeklyPlans[0].id);
    }
  }, [weeklyPlans, activePlanId]);

  const activePlan = weeklyPlans.find((p) => p.id === activePlanId);

  const getDishId = (day: Day, mealTime: MealTime, courseType: Category) => {
    const entry = plan.find((e) => e.day === day && e.mealTime === mealTime && e.courseType === courseType);
    return entry?.dishId;
  };

  const getDishName = (dishId: number | undefined) => {
    if (!dishId) return null;
    return dishes.find((d) => d.id === dishId)?.name ?? null;
  };

  const handleSelect = async (dishId: number) => {
    if (!picker || !activePlanId) return;
    await setMealPlanDish(activePlanId, picker.day, picker.mealTime, picker.courseType, dishId);
    setPicker(null);
  };

  const handleClear = async (day: Day, mealTime: MealTime, courseType: Category) => {
    if (!activePlanId) return;
    await clearMealPlanSlot(activePlanId, day, mealTime, courseType);
  };

  const handleShoppingList = async () => {
    const dishIds = [...new Set(plan.map((e) => e.dishId).filter(Boolean))];
    const ings = await getIngredientsForDishes(dishIds);
    setShoppingList(ings);
  };

  const handlePrint = () => window.print();

  const handleAutoFill = async () => {
    if (!activePlanId) return;
    if (await confirm('Auto-fill this meal plan with random dishes? This will overwrite existing assignments.')) {
      await autoFillMealPlan(activePlanId);
      toast('Meal plan auto-filled!', 'success');
    }
  };

  const handleCopyPlan = async () => {
    if (!activePlanId || !activePlan) return;
    const newName = `${activePlan.name} (copy)`;
    await copyWeeklyPlan(activePlanId, newName);
    toast('Plan copied!', 'success');
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] -mx-3 -mb-4 sm:-mx-6 sm:-mb-6">
      {/* Mobile overlay backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar: overlay on mobile, inline on desktop */}
      <div className={`z-40 ${
        sidebarCollapsed
          ? 'hidden sm:block'
          : 'fixed inset-y-0 left-0 sm:relative sm:inset-y-auto'
      }`}>
        <MealPlanSidebar
          plans={weeklyPlans}
          activePlanId={activePlanId}
          onSelect={(id) => { setActivePlanId(id); onToggleSidebar(); }}
          collapsed={sidebarCollapsed}
          onToggle={onToggleSidebar}
        />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {activePlan ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-text dark:text-text-dark m-0 font-[family-name:var(--font-heading)]">
                {activePlan.name}
              </h2>
              <div className="flex gap-2 no-print flex-wrap">
                <button onClick={handleAutoFill}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer">
                  <Shuffle size={14} /> Auto-Fill
                </button>
                <button onClick={handleCopyPlan}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer">
                  <Copy size={14} /> Copy Plan
                </button>
                <button
                  onClick={handleShoppingList}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer"
                >
                  <ShoppingCart size={14} /> Shopping List
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <div className="overflow-x-auto scroll-hint rounded-xl sm:rounded-2xl border border-border dark:border-border-dark shadow-sm">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-left font-semibold text-sm w-[100px] sm:w-[140px]">Day</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-center font-semibold text-sm">Breakfast</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-center font-semibold text-sm">Lunch</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-center font-semibold text-sm">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, di) => (
                    <tr key={day} className={di % 2 === 0 ? 'bg-surface dark:bg-surface-dark' : 'bg-bg dark:bg-bg-dark'}>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base text-text dark:text-text-dark border-r border-border dark:border-border-dark align-top">
                        {day}
                      </td>
                      {MEAL_TIMES.map((mealTime) => (
                        <td key={mealTime} className="px-2 sm:px-3 py-2 sm:py-3 border-r border-border dark:border-border-dark last:border-r-0 align-top">
                          <div className="space-y-1 sm:space-y-1.5">
                            {CATEGORIES.map((courseType) => {
                              const dishId = getDishId(day, mealTime, courseType);
                              const dishName = getDishName(dishId);
                              return (
                                <div key={courseType} className="flex items-center gap-1 sm:gap-1.5 group">
                                  <span className="text-[10px] sm:text-xs text-muted dark:text-muted-dark w-[60px] sm:w-[80px] shrink-0 font-medium">
                                    {courseType}
                                  </span>
                                  {dishName ? (
                                    <div className="flex-1 flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-text dark:text-text-dark text-sm">
                                      <span className="flex-1 truncate">{dishName}</span>
                                      <button
                                        onClick={() => handleClear(day, mealTime, courseType)}
                                        className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded-md text-danger hover:bg-danger/10 transition-all duration-200 shrink-0 cursor-pointer"
                                        title="Remove"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setPicker({ day, mealTime, courseType })}
                                      className="flex-1 flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-border dark:border-border-dark text-muted dark:text-muted-dark text-sm text-left hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer"
                                    >
                                      <Plus size={12} /> Add dish
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <CalendarDays size={40} className="text-muted/30 mb-3" />
            <p className="text-muted dark:text-muted-dark text-lg">Select or create a plan</p>
          </div>
        )}
      </div>

      {/* Dish picker modal */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setPicker(null); setSearchQuery(''); }}
        >
          <div
            className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-border dark:border-border-dark">
              <h3 className="font-semibold text-text dark:text-text-dark m-0">Select a dish</h3>
              <p className="text-xs text-muted dark:text-muted-dark mt-0.5">
                {picker.day} · {picker.mealTime} · {picker.courseType}
              </p>
              <div className="relative mt-2">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {dishes.length === 0 ? (
                <p className="text-sm text-muted dark:text-muted-dark text-center py-6">
                  No dishes yet. Add some dishes first.
                </p>
              ) : (
                dishes
                  .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => { dish.id && handleSelect(dish.id); setSearchQuery(''); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-text dark:text-text-dark hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="font-medium">{dish.name}</span>
                      <span className="text-muted dark:text-muted-dark ml-2 text-xs">{dish.category}</span>
                    </button>
                  ))
              )}
              {searchQuery && dishes.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-sm text-muted dark:text-muted-dark text-center py-6">No dishes match "{searchQuery}"</p>
              )}
            </div>
            <div className="px-4 py-3 border-t border-border dark:border-border-dark">
              <button
                onClick={() => { setPicker(null); setSearchQuery(''); }}
                className="w-full py-2 text-sm rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-bg dark:hover:bg-bg-dark transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping list modal */}
      {shoppingList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShoppingList(null)}
        >
          <div
            className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark shadow-xl w-full max-w-md max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-border dark:border-border-dark flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text dark:text-text-dark m-0 flex items-center gap-2">
                  <ShoppingCart size={16} /> Shopping List
                </h3>
                <p className="text-xs text-muted dark:text-muted-dark mt-0.5">
                  {shoppingList.length} ingredient{shoppingList.length !== 1 ? 's' : ''} from your meal plan
                </p>
              </div>
              <button
                onClick={() => setShoppingList(null)}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-bg dark:hover:bg-bg-dark transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {shoppingList.length === 0 ? (
                <p className="text-sm text-muted dark:text-muted-dark text-center py-6">
                  No ingredients found. Add ingredients to your dishes first.
                </p>
              ) : (
                <ul className="space-y-2">
                  {shoppingList.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg dark:hover:bg-bg-dark">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-text dark:text-text-dark">
                        <span className="font-medium">{ing.name}</span>
                        <span className="text-muted dark:text-muted-dark ml-2 text-sm">
                          {ing.quantity} {ing.unit}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-4 py-3 border-t border-border dark:border-border-dark flex gap-2">
              <button
                onClick={() => { setShoppingList(null); }}
                className="flex-1 py-2 text-sm rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-bg dark:hover:bg-bg-dark transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
              {shoppingList.length > 0 && (
                <button
                  onClick={() => {
                    const text = shoppingList.map((ing, i) => `${i + 1}. ${ing.name} — ${ing.quantity} ${ing.unit}`).join('\n');
                    navigator.clipboard.writeText(text);
                    toast('Shopping list copied!', 'success');
                  }}
                  className="flex-1 py-2 text-sm rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-200 cursor-pointer"
                >
                  Copy to Clipboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
