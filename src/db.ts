import Dexie, { type Table } from 'dexie';
import type { Dish, Ingredient, MealPlanEntry, WeeklyPlan } from './types';

export class DishManagerDB extends Dexie {
  dishes!: Table<Dish>;
  ingredients!: Table<Ingredient>;
  mealPlan!: Table<MealPlanEntry>;
  weeklyPlans!: Table<WeeklyPlan>;

  constructor() {
    super('dishManagerDB');
    this.version(1).stores({
      dishes: '++id, name, category, createdAt',
      ingredients: '++id, dishId, name',
      mealPlan: '++id, planId, day, mealTime, courseType, dishId',
      weeklyPlans: '++id, name, createdAt',
    });
  }
}

export const db = new DishManagerDB();
