export enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
}

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

export interface PlannedMeal {
  id: number;
  date: string;
  meal_type: MealType;
  servings: number;
  recipe_id?: number;
  snack_id?: number;
}

export interface InventoryItem {
  id: number;
  ingredient_id: number;
  amount: number;
  purchase_date: string;
  ingredient: Ingredient;
}

export interface CookedMeal {
  id: number;
  recipe_id: number;
  servings_remaining: number;
  date_cooked: string;
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
  date: string;
}

export interface EatenMeal {
  id: number;
  date: string;
  meal_type: MealType;
  servings: number;
  cooked_meal_id?: number;
  snack_id?: number;
  eaten_out_id?: number;
}

export interface MacrosInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacrosSummary extends MacrosInfo {
  date: string;
  meals: {
    breakfast: Array<
      {
        type: string;
        name: string;
        servings: number;
      } & MacrosInfo
    >;
    lunch: Array<
      {
        type: string;
        name: string;
        servings: number;
      } & MacrosInfo
    >;
    dinner: Array<
      {
        type: string;
        name: string;
        servings: number;
      } & MacrosInfo
    >;
    snack: Array<
      {
        type: string;
        name: string;
        servings: number;
      } & MacrosInfo
    >;
  };
}
