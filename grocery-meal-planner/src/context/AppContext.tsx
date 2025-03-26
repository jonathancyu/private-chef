import React, { createContext, useContext, useState, ReactNode } from "react";
import { Recipe, Snack, InventoryItem, CookedMeal, EatenOut } from "../types";

interface AppContextType {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  snacks: Snack[];
  setSnacks: React.Dispatch<React.SetStateAction<Snack[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  cookedMeals: CookedMeal[];
  setCookedMeals: React.Dispatch<React.SetStateAction<CookedMeal[]>>;
  eatenOut: EatenOut[];
  setEatenOut: React.Dispatch<React.SetStateAction<EatenOut[]>>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [eatenOut, setEatenOut] = useState<EatenOut[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const value = {
    recipes,
    setRecipes,
    snacks,
    setSnacks,
    inventory,
    setInventory,
    cookedMeals,
    setCookedMeals,
    eatenOut,
    setEatenOut,
    selectedDate,
    setSelectedDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
