export interface Ingredient {
  id: number;
  name: string;
  note?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_size_unit: string;
}

export interface RecipeIngredient {
  ingredient_id: number;
  amount: number;
  unit: string;
  name: string;
  note?: string;
}

export interface Recipe {
  id: number;
  name: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  ingredients: RecipeIngredient[];
  instructions: string;
}

export enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
}
