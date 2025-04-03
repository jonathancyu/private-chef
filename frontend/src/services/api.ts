import axios from "axios";
import { Recipe, Food, CreateRecipeRequest, UpdateRecipeRequest } from "../types/api.types";

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

export const createRecipe = async (recipe: CreateRecipeRequest): Promise<Recipe> => {
  const response = await api.post("/recipes", recipe);
  return response.data;
};

export const updateRecipe = async (id: number, recipe: UpdateRecipeRequest): Promise<Recipe> => {
  const response = await api.put(`/recipes/${id}`, recipe);
  return response.data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};

export const getIngredients = async (): Promise<Food[]> => {
  const response = await fetch(`${API_URL}/foods`);
  if (!response.ok) {
    throw new Error("Failed to fetch ingredients");
  }
  return response.json();
};

export const createIngredient = async (ingredient: Omit<Food, "id">): Promise<Food> => {
  const response = await fetch(`${API_URL}/foods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ingredient),
  });
  if (!response.ok) {
    throw new Error("Failed to create ingredient");
  }
  return response.json();
};

export const updateIngredient = async (id: number, ingredient: Partial<Food>): Promise<Food> => {
  const response = await api.put(`/ingredients/${id}`, ingredient);
  return response.data;
};

export const deleteIngredient = async (id: number): Promise<void> => {
  await api.delete(`/ingredients/${id}`);
};
