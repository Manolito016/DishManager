/** Core dish entity stored in IndexedDB */
export interface Dish {
  id?: number;
  name: string;
  description: string;
  category: Category;
  imageUrl: string;
  videoUrl: string;
  /** Source attribution (e.g. "Grandma's recipe", "Jamie Oliver") */
  source: string;
  /** Servings this recipe makes */
  servings: number;
  /** Prep time in minutes */
  prepTime: number;
  /** Cook time in minutes */
  cookTime: number;
  /** Difficulty level */
  difficulty: Difficulty;
  /** User rating 0-5 */
  rating: number;
  /** Whether this dish is a favorite */
  favorite: boolean;
  /** Dietary tags */
  dietary: DietaryTag[];
  /** Nutrition per serving */
  nutrition: Nutrition;
  createdAt: Date;
  updatedAt: Date;
}

/** A single cooking step */
export interface CookingStep {
  id?: number;
  dishId: number;
  order: number;
  text: string;
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

/** Nutrition info per serving */
export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ─── Constants & Types ──────────────────────────────────────

/** The four fixed dish/meal categories */
export const CATEGORIES = ['Starter', 'Main Course', 'Side Dish', 'Dessert'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Difficulty levels */
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

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

/** Dietary tags */
export const DIETARY_TAGS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Low-Carb', 'Spicy',
] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];

/** Empty nutrition helper */
export const EMPTY_NUTRITION: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
