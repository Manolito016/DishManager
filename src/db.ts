import Dexie, { type Table } from 'dexie';
import type { Dish, Ingredient, MealPlanEntry, WeeklyPlan } from './types';

export class DishManagerDB extends Dexie {
  dishes!: Table<Dish>;
  ingredients!: Table<Ingredient>;
  mealPlan!: Table<MealPlanEntry>;
  weeklyPlans!: Table<WeeklyPlan>;

  constructor() {
    super('dishManagerDB');
    this.version(3).stores({
      dishes: '++id, name, category, createdAt',
      ingredients: '++id, dishId, name',
      mealPlan: '++id, planId, day, mealTime, courseType, dishId',
      weeklyPlans: '++id, name, createdAt',
    });
    this.version(4).stores({
      dishes: '++id, name, category, createdAt',
      ingredients: '++id, dishId, name',
      mealPlan: '++id, planId, day, mealTime, courseType, dishId',
      weeklyPlans: '++id, name, createdAt',
    }).upgrade((tx) => {
      // Clear duplicate weekly plans and orphaned meal entries
      return tx.table('weeklyPlans').clear().then(() => {
        return tx.table('mealPlan').clear();
      });
    });
  }
}

export const db = new DishManagerDB();
