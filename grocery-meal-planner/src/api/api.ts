import axios from 'axios';
import {
  Ingredient, Recipe, Snack, PlannedMeal, InventoryItem,
  CookedMeal, EatenOut, EatenMeal, MacrosSummary,
  RecipeCreateRequest, PlannedMealCreateRequest, InventoryItemCreateRequest,
  CookedMealCreateRequest, EatenOutCreateRequest, EatenMealCreateRequest
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ingredients
export const getIngredients = async (): Promise<Ingredient[]> => {
  const response = await api.get<Ingredient[]>('/ingredients/');
  return response.data;
};

export const createIngredient = async (ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
  const response = await api.post<Ingredient>('/ingredients/', ingredient);
  return response.data;
};

// Recipes
export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await api.get<Recipe[]>('/recipes/');
  return response.data;
};

export const createRecipe = async (recipe: RecipeCreateRequest): Promise<Recipe> => {
  const response = await api.post<Recipe>('/recipes/', recipe);
  return response.data;
};

// Snacks
export const getSnacks = async (): Promise<Snack[]> => {
  const response = await api.get<Snack[]>('/snacks/');
  return response.data;
};

export const createSnack = async (snack: Omit<Snack, 'id'>): Promise<Snack> => {
  const response = await api.post<Snack>('/snacks/', snack);
  return response.data;
};

// Planned Meals
export const getPlannedMeals = async (startDate: string, endDate: string): Promise<PlannedMeal[]> => {
  const response = await api.get<PlannedMeal[]>(`/planned-meals/?start_date=${startDate}&end_date=${endDate}`);
  return response.data;
};

export const createPlannedMeal = async (plannedMeal: PlannedMealCreateRequest): Promise<PlannedMeal> => {
  const response = await api.post<PlannedMeal>('/planned-meals/', plannedMeal);
  return response.data;
};

export const createWeeklyMealPlan = async (plannedMeals: PlannedMealCreateRequest[]): Promise<PlannedMeal[]> => {
  const response = await api.post<PlannedMeal[]>('/planned-meals/week/', plannedMeals);
  return response.data;
};

// Inventory
export const getInventory = async (): Promise<InventoryItem[]> => {
  const response = await api.get<InventoryItem[]>('/inventory/');
  return response.data;
};

export const addToInventory = async (inventoryItem: InventoryItemCreateRequest): Promise<InventoryItem> => {
  const response = await api.post<InventoryItem>('/inventory/', inventoryItem);
  return response.data;
};

// Cooked Meals
export const createCookedMeal = async (cookedMeal: CookedMealCreateRequest): Promise<CookedMeal> => {
  const response = await api.post<CookedMeal>('/cooked-meals/', cookedMeal);
  return response.data;
};

// Eaten Out
export const recordEatenOut = async (eatenOut: EatenOutCreateRequest): Promise<EatenOut> => {
  const response = await api.post<EatenOut>('/eaten-out/', eatenOut);
  return response.data;
};

// Eaten Meals
export const recordEatenMeal = async (eatenMeal: EatenMealCreateRequest): Promise<EatenMeal> => {
  const response = await api.post<EatenMeal>('/eaten-meals/', eatenMeal);
  return response.data;
};

// Macros
export const getDailyMacros = async (day: string): Promise<MacrosSummary> => {
  const response = await api.get<MacrosSummary>(`/macros/daily/?day=${day}`);
  return response.data;
};

// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AppProvider } from './context/AppContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import MealPlanning from './pages/MealPlanning';
import Inventory from './pages/Inventory';
import CookMeal from './pages/CookMeal';
import EatenMeals from './pages/EatenMeals';
import MacrosPage from './pages/MacrosPage';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6fffa',
      100: '#b2f5ea',
      500: '#38b2ac',
      700: '#2c7a7b',
      900: '#1a4e4c',
    },
  },
});

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="recipes/:id" element={<RecipeDetail />} />
              <Route path="recipes/create" element={<CreateRecipe />} />
              <Route path="meal-planning" element={<MealPlanning />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="cook-meal" element={<CookMeal />} />
              <Route path="eaten-meals" element={<EatenMeals />} />
              <Route path="macros" element={<MacrosPage />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </ChakraProvider>
  );
};

export default App;

