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
