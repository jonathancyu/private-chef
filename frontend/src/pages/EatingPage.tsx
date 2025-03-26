import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import EatenMealForm from "../components/eating/EatenMealForm";
import EatenOutForm from "../components/eating/EatenOutForm";
import DailyMacros from "../components/eating/DailyMacros";
import { CookedMeal, Snack, EatenOut } from "../types/api.types";
import { getRecipes, getSnacks } from "../services/api";

const EatingPage: React.FC = () => {
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [eatenOut, setEatenOut] = useState<EatenOut[]>([]);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  useEffect(() => {
    // In a real app, you would have endpoints to get these
    // For now, we'll simulate with empty arrays
    setCookedMeals([]);

    const loadSnacks = async () => {
      try {
        const data = await getSnacks();
        setSnacks(data);
      } catch (error) {
        console.error("Failed to load snacks", error);
      }
    };

    loadSnacks();
    setEatenOut([]);
  }, [refreshCounter]);

  const handleRefresh = () => {
    setRefreshCounter(refreshCounter + 1);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6">
        <DailyMacros />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EatenMealForm
            cookedMeals={cookedMeals}
            snacks={snacks}
            eatenOut={eatenOut}
            onMealEaten={handleRefresh}
          />

          <EatenOutForm onEatenOutRecorded={handleRefresh} />
        </div>
      </div>
    </Layout>
  );
};

export default EatingPage;
