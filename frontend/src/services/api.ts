import axios from "axios";
import { Recipe, Ingredient } from "../types/api.types";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await api.get("/recipes");
  return response.data;
};

export const getRecipe = async (id: number): Promise<Recipe> => {
  const response = await api.get(`/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (recipe: Omit<Recipe, "id">): Promise<Recipe> => {
  const response = await api.post("/recipes", recipe);
  return response.data;
};

export const updateRecipe = async (id: number, recipe: Partial<Recipe>): Promise<Recipe> => {
  const response = await api.put(`/recipes/${id}`, recipe);
  return response.data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};

export const getIngredients = async (): Promise<Ingredient[]> => {
  const response = await api.get("/foods");
  return response.data.map((food: any) => ({
    id: food.id,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbohydrates,
    fat: food.fat,
    serving_size: food.serving_size,
    serving_size_unit: food.serving_size_unit,
  }));
};

export const createIngredient = async (ingredient: Omit<Ingredient, "id">): Promise<Ingredient> => {
  const response = await api.post("/food", {
    name: ingredient.name,
    serving_size: ingredient.serving_size,
    serving_size_unit: ingredient.serving_size_unit,
    calories: ingredient.calories,
    fat: ingredient.fat,
    protein: ingredient.protein,
    carbohydrates: ingredient.carbs,
  });
  return response.data;
};

export const updateIngredient = async (id: number, ingredient: Partial<Ingredient>): Promise<Ingredient> => {
  const response = await api.put(`/ingredients/${id}`, ingredient);
  return response.data;
};

export const deleteIngredient = async (id: number): Promise<void> => {
  await api.delete(`/ingredients/${id}`);
};
