export interface Nutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface Food extends Nutrition {
  id: number;
  name: string;
  serving_size: number;
  serving_size_unit: string;
  source_recipe_id?: number; // ID of the recipe this food is based on, if any
}

export interface RecipeIngredient {
  food: Food;
  quantity: number;
  unit: string;
  note?: string;
}

export interface RecipeInstruction {
  id: number;
  step: number;
  text: string;
}

export interface CreateRecipeRequest extends Nutrition {
  name: string;
  ingredients: {
    food_id: number;
    note: string;
    quantity: number;
    unit: string;
  }[];
  instructions: {
    step: number;
    text: string;
  }[];
  override_nutrition: boolean;
}

export interface Recipe {
  id: number;
  name: string;
  food: Food;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
}

export enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
}
