/** Core dish entity stored in IndexedDB */
export interface Dish {
  id?: number;
  name: string;
  description: string;
  category: Category;
  imageUrl: string;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Ingredient linked to a dish */
export interface Ingredient {
  id?: number;
  dishId: number;
  name: string;
  quantity: number;
  unit: string;
}

/** A weekly meal plan containing meal entries */
export interface WeeklyPlan {
  id?: number;
  name: string;
  createdAt: Date;
}

/** Single meal slot in a weekly plan */
export interface MealPlanEntry {
  id?: number;
  planId: number;
  day: Day;
  mealTime: MealTime;
  courseType: Category;
  dishId: number;
}

/** The four fixed dish/meal categories */
export const CATEGORIES = [
  'Starter',
  'Main Course',
  'Side Dish',
  'Dessert',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Available measurement units for ingredients */
export const UNITS = [
  'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'piece', 'pinch', 'whole',
] as const;

/** Days of the week for meal planning */
export const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export type Day = (typeof DAYS)[number];

/** Meal time slots */
export const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner'] as const;

export type MealTime = (typeof MEAL_TIMES)[number];
