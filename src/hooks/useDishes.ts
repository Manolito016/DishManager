import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Dish, Ingredient, Day, MealTime, Category } from '../types';

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
  const dish = useLiveQuery(() => (id ? db.dishes.get(id) : undefined), [id]);
  return dish;
}

export function useIngredients(dishId: number | undefined) {
  const ingredients = useLiveQuery(
    () => (dishId ? db.ingredients.where('dishId').equals(dishId).toArray() : []),
    [dishId]
  );
  return ingredients ?? [];
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
  return db.dishes.delete(id);
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

// Weekly Plans
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

// Meal Plan hooks
export function useMealPlan(planId: number | undefined) {
  const entries = useLiveQuery(
    () => (planId ? db.mealPlan.where('planId').equals(planId).toArray() : []),
    [planId]
  );
  return entries ?? [];
}

export async function setMealPlanDish(planId: number, day: Day, mealTime: MealTime, courseType: Category, dishId: number) {
  const existing = await db.mealPlan
    .where({ planId, day, mealTime, courseType })
    .first();
  if (existing?.id) {
    return db.mealPlan.update(existing.id, { dishId });
  }
  return db.mealPlan.add({ planId, day, mealTime, courseType, dishId });
}

export async function clearMealPlanSlot(planId: number, day: Day, mealTime: MealTime, courseType: Category) {
  return db.mealPlan.where({ planId, day, mealTime, courseType }).delete();
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
