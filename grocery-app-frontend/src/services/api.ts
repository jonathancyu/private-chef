import axios from "axios";
import {
  Recipe,
  Ingredient,
  RecipeIngredient,
  Snack,
  PlannedMeal,
  InventoryItem,
  CookedMeal,
  EatenOut,
  EatenMeal,
  MacrosSummary,
} from "../types/api.types";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ingredients
export const getIngredients = () =>
  api.get<Ingredient[]>("/ingredients/").then((res) => res.data);

export const createIngredient = (ingredient: Omit<Ingredient, "id">) =>
  api.post<Ingredient>("/ingredients/", ingredient).then((res) => res.data);

// Recipes
export const getRecipes = () =>
  api.get<Recipe[]>("/recipes/").then((res) => res.data);

export const createRecipe = (recipe: Omit<Recipe, "id">) =>
  api.post<Recipe>("/recipes/", recipe).then((res) => res.data);

// Snacks
export const getSnacks = () =>
  api.get<Snack[]>("/snacks/").then((res) => res.data);

export const createSnack = (snack: Omit<Snack, "id">) =>
  api.post<Snack>("/snacks/", snack).then((res) => res.data);

// Planned meals
export const getPlannedMeals = (startDate: string, endDate: string) =>
  api
    .get<
      PlannedMeal[]
    >(`/planned-meals/?start_date=${startDate}&end_date=${endDate}`)
    .then((res) => res.data);

export const createPlannedMeal = (plannedMeal: Omit<PlannedMeal, "id">) =>
  api.post<PlannedMeal>("/planned-meals/", plannedMeal).then((res) => res.data);

export const createWeeklyMealPlan = (plannedMeals: Omit<PlannedMeal, "id">[]) =>
  api
    .post<PlannedMeal[]>("/planned-meals/week/", plannedMeals)
    .then((res) => res.data);

// Inventory
export const getInventory = () =>
  api.get<InventoryItem[]>("/inventory/").then((res) => res.data);

export const addToInventory = (
  inventoryItem: Omit<InventoryItem, "id" | "ingredient">,
) =>
  api.post<InventoryItem>("/inventory/", inventoryItem).then((res) => res.data);

// Cooked meals
export const createCookedMeal = (
  cookedMeal: Omit<CookedMeal, "id" | "date_cooked" | "recipe">,
) => api.post<CookedMeal>("/cooked-meals/", cookedMeal).then((res) => res.data);

// Eaten out
export const recordEatenOut = (eatenOut: Omit<EatenOut, "id" | "date">) =>
  api.post<EatenOut>("/eaten-out/", eatenOut).then((res) => res.data);

// Eaten meals
export const recordEatenMeal = (eatenMeal: Omit<EatenMeal, "id" | "date">) =>
  api.post<EatenMeal>("/eaten-meals/", eatenMeal).then((res) => res.data);

// Macros
export const getDailyMacros = (date: string) =>
  api.get<MacrosSummary>(`/macros/daily/?day=${date}`).then((res) => res.data);
