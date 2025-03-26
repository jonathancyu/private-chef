export interface Ingredient {
  id: number;
  name: string;
  calories_per_unit: number;
  protein_per_unit: number;
  carbs_per_unit: number;
  fat_per_unit: number;
  unit: string;
}

export interface RecipeIngredient {
  id: number;
  ingredient_id: number;
  amount: number;
  ingredient?: Ingredient;
}

export interface Recipe {
  id: number;
  name: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  instructions: string;
  ingredients: RecipeIngredient[];
}

export interface Snack {
  id: number;
  name: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
}

export enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
}

export interface PlannedMeal {
  id: number;
  date: string; // ISO format date
  meal_type: MealType;
  servings: number;
  recipe_id?: number;
  snack_id?: number;
  recipe?: Recipe;
  snack?: Snack;
}

export interface InventoryItem {
  id: number;
  ingredient_id: number;
  amount: number;
  purchase_date: string; // ISO format date
  ingredient: Ingredient;
}

export interface CookedMeal {
  id: number;
  recipe_id: number;
  servings_remaining: number;
  date_cooked: string; // ISO format datetime
  recipe: Recipe;
}

export interface EatenOut {
  id: number;
  restaurant: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings_total: number;
  servings_remaining: number;
  date: string; // ISO format datetime
}

export interface EatenMeal {
  id: number;
  date: string; // ISO format datetime
  meal_type: MealType;
  servings: number;
  cooked_meal_id?: number;
  snack_id?: number;
  eaten_out_id?: number;
}

export interface MacrosSummary {
  date: string; // ISO format date
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: {
    [key in MealType]: Array<{
      type: string;
      name: string;
      servings: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  };
}

// Requests
export interface RecipeCreateRequest {
  name: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  instructions: string;
  ingredients: Array<{
    ingredient_id: number;
    amount: number;
  }>;
}

export interface PlannedMealCreateRequest {
  date: string; // ISO format date
  meal_type: MealType;
  servings: number;
  recipe_id?: number;
  snack_id?: number;
}

export interface InventoryItemCreateRequest {
  ingredient_id: number;
  amount: number;
  purchase_date: string; // ISO format date
}

export interface CookedMealCreateRequest {
  recipe_id: number;
  servings_remaining: number;
}

export interface EatenOutCreateRequest {
  restaurant: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings_total: number;
  servings_remaining: number;
}

export interface EatenMealCreateRequest {
  meal_type: MealType;
  servings: number;
  cooked_meal_id?: number;
  snack_id?: number;
  eaten_out_id?: number;
}
