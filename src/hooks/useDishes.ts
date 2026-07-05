import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Dish, Ingredient, CookingStep, Day, MealTime, Category, WeeklyPlan, MealPlanEntry } from '../types';
import { DAYS, MEAL_TIMES, CATEGORIES } from '../types';

// ─── Dish hooks ─────────────────────────────────────────────

export function useDishes(search = '', category = '') {
  const dishes = useLiveQuery(async () => {
    let query = db.dishes.orderBy('createdAt').reverse();
    const allDishes = await query.toArray();
    return allDishes.filter((d) => {
      const matchesSearch =
        !search || d.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || d.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);
  return dishes ?? [];
}

export function useDish(id: number | undefined) {
  return useLiveQuery(() => (id ? db.dishes.get(id) : undefined), [id]);
}

export function useFavoriteDishes() {
  const dishes = useLiveQuery(() => db.dishes.where('favorite').equals(1).toArray(), []);
  return dishes ?? [];
}

export async function addDish(dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();
  return db.dishes.add({ ...dish, createdAt: now, updatedAt: now });
}

export async function updateDish(id: number, dish: Partial<Dish>) {
  return db.dishes.update(id, { ...dish, updatedAt: new Date() });
}

export async function deleteDish(id: number) {
  await db.ingredients.where('dishId').equals(id).delete();
  await db.steps.where('dishId').equals(id).delete();
  return db.dishes.delete(id);
}

export async function toggleFavorite(id: number, favorite: boolean) {
  return db.dishes.update(id, { favorite });
}

export async function setRating(id: number, rating: number) {
  return db.dishes.update(id, { rating, updatedAt: new Date() });
}

// ─── Ingredient hooks ───────────────────────────────────────

export function useIngredients(dishId: number | undefined) {
  const ingredients = useLiveQuery(
    () => (dishId ? db.ingredients.where('dishId').equals(dishId).toArray() : []),
    [dishId],
  );
  return ingredients ?? [];
}

export async function addIngredient(ingredient: Omit<Ingredient, 'id'>) {
  return db.ingredients.add(ingredient);
}

export async function updateIngredient(id: number, ingredient: Partial<Ingredient>) {
  return db.ingredients.update(id, ingredient);
}

export async function deleteIngredient(id: number) {
  return db.ingredients.delete(id);
}

// ─── Cooking Step hooks ─────────────────────────────────────

export function useSteps(dishId: number | undefined) {
  const steps = useLiveQuery(
    () => (dishId ? db.steps.where('dishId').equals(dishId).sortBy('order') : []),
    [dishId],
  );
  return steps ?? [];
}

export async function saveSteps(dishId: number, steps: { text: string }[]) {
  await db.steps.where('dishId').equals(dishId).delete();
  if (steps.length > 0) {
    await db.steps.bulkAdd(
      steps.map((s, i) => ({ dishId, order: i + 1, text: s.text })),
    );
  }
}

// ─── Weekly Plan hooks ──────────────────────────────────────

export function useWeeklyPlans() {
  const plans = useLiveQuery(() => db.weeklyPlans.orderBy('createdAt').reverse().toArray(), []);
  return plans ?? [];
}

export async function createWeeklyPlan(name: string) {
  return db.weeklyPlans.add({ name, createdAt: new Date() });
}

export async function renameWeeklyPlan(id: number, name: string) {
  return db.weeklyPlans.update(id, { name });
}

export async function deleteWeeklyPlan(id: number) {
  await db.mealPlan.where('planId').equals(id).delete();
  return db.weeklyPlans.delete(id);
}

export async function copyWeeklyPlan(sourceId: number, newName: string) {
  const entries = await db.mealPlan.where('planId').equals(sourceId).toArray();
  const newPlanId = await createWeeklyPlan(newName);
  if (newPlanId && entries.length > 0) {
    await db.mealPlan.bulkAdd(
      entries.map((e) => ({ ...e, id: undefined, planId: newPlanId })),
    );
  }
  return newPlanId;
}

// ─── Meal Plan hooks ────────────────────────────────────────

export function useMealPlan(planId: number | undefined) {
  const entries = useLiveQuery(
    () => (planId ? db.mealPlan.where('planId').equals(planId).toArray() : []),
    [planId],
  );
  return entries ?? [];
}

export async function setMealPlanDish(planId: number, day: Day, mealTime: MealTime, courseType: Category, dishId: number) {
  const existing = await db.mealPlan.where({ planId, day, mealTime, courseType }).first();
  if (existing?.id) {
    return db.mealPlan.update(existing.id, { dishId });
  }
  return db.mealPlan.add({ planId, day, mealTime, courseType, dishId });
}

export async function clearMealPlanSlot(planId: number, day: Day, mealTime: MealTime, courseType: Category) {
  return db.mealPlan.where({ planId, day, mealTime, courseType }).delete();
}

/** Auto-fill a meal plan with random dishes from the collection */
export async function autoFillMealPlan(planId: number) {
  const dishes = await db.dishes.toArray();
  if (dishes.length === 0) return;
  const { DAYS: D, MEAL_TIMES: M, CATEGORIES: C } = { DAYS, MEAL_TIMES, CATEGORIES };
  const pick = () => dishes[Math.floor(Math.random() * dishes.length)];
  const ops: Promise<any>[] = [];
  for (const day of D) {
    for (const mealTime of M) {
      for (const courseType of C) {
        const existing = await db.mealPlan.where({ planId, day, mealTime, courseType }).first();
        const dish = pick();
        if (dish?.id) {
          if (existing?.id) {
            ops.push(db.mealPlan.update(existing.id, { dishId: dish.id }));
          } else {
            ops.push(db.mealPlan.add({ planId, day, mealTime, courseType, dishId: dish.id }));
          }
        }
      }
    }
  }
  await Promise.all(ops);
}

/** Get all ingredients for a set of dish IDs (for shopping list) */
export async function getIngredientsForDishes(dishIds: number[]): Promise<Ingredient[]> {
  if (dishIds.length === 0) return [];
  const allIngredients: Ingredient[] = [];
  for (const id of dishIds) {
    const ings = await db.ingredients.where('dishId').equals(id).toArray();
    allIngredients.push(...ings);
  }
  return allIngredients;
}

// ─── Export / Import ────────────────────────────────────────

export interface ExportData {
  version: number;
  exportedAt: string;
  dishes: Dish[];
  ingredients: Ingredient[];
  steps: CookingStep[];
  weeklyPlans: WeeklyPlan[];
  mealPlan: MealPlanEntry[];
}

export async function exportAllData(): Promise<ExportData> {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    dishes: await db.dishes.toArray(),
    ingredients: await db.ingredients.toArray(),
    steps: await db.steps.toArray(),
    weeklyPlans: await db.weeklyPlans.toArray(),
    mealPlan: await db.mealPlan.toArray(),
  };
}

export async function importAllData(data: ExportData): Promise<void> {
  await db.transaction('rw', db.dishes, db.ingredients, db.steps, db.mealPlan, db.weeklyPlans, async () => {
    await db.dishes.clear();
    await db.ingredients.clear();
    await db.steps.clear();
    await db.mealPlan.clear();
    await db.weeklyPlans.clear();
    if (data.dishes?.length) await db.dishes.bulkAdd(data.dishes.map((d) => ({ ...d, id: undefined })));
    if (data.ingredients?.length) await db.ingredients.bulkAdd(data.ingredients.map((i) => ({ ...i, id: undefined })));
    if (data.steps?.length) await db.steps.bulkAdd(data.steps.map((s) => ({ ...s, id: undefined })));
    if (data.weeklyPlans?.length) await db.weeklyPlans.bulkAdd(data.weeklyPlans.map((w) => ({ ...w, id: undefined })));
    if (data.mealPlan?.length) await db.mealPlan.bulkAdd(data.mealPlan.map((m) => ({ ...m, id: undefined })));
  });
}
