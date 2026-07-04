export interface Dish {
  id?: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id?: number;
  dishId: number;
  name: string;
  quantity: number;
  unit: string;
}

export const CATEGORIES = [
  'Starter',
  'Main Course',
  'Side Dish',
  'Dessert',
] as const;

export const UNITS = [
  'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'piece', 'pinch', 'whole',
] as const;

export const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export const MEAL_TIMES = ['Lunch', 'Dinner'] as const;

export const COURSE_TYPES = ['Starter', 'Main Course', 'Side Dish', 'Dessert'] as const;

export interface MealPlanEntry {
  id?: number;
  planId: number;     // reference to a WeeklyPlan
  day: string;        // e.g. 'Monday'
  mealTime: string;   // 'Lunch' | 'Dinner'
  courseType: string; // 'Starter' | 'Main Course' | 'Side Dish' | 'Dessert'
  dishId: number;     // reference to a Dish
}

export interface WeeklyPlan {
  id?: number;
  name: string;
  createdAt: Date;
}
