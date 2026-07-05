import Dexie, { type Table } from 'dexie';
import type { Dish, Ingredient, MealPlanEntry, WeeklyPlan, CookingStep } from './types';

export class DishManagerDB extends Dexie {
  dishes!: Table<Dish>;
  ingredients!: Table<Ingredient>;
  steps!: Table<CookingStep>;
  mealPlan!: Table<MealPlanEntry>;
  weeklyPlans!: Table<WeeklyPlan>;

  constructor() {
    super('dishManagerDB');
    this.version(2).stores({
      dishes: '++id, name, category, createdAt, favorite, rating',
      ingredients: '++id, dishId, name',
      steps: '++id, dishId, order',
      mealPlan: '++id, planId, day, mealTime, courseType, dishId',
      weeklyPlans: '++id, name, createdAt',
    });
  }
}

export const db = new DishManagerDB();
