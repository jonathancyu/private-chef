import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { Recipe, MealType, PlannedMeal } from "../types/api.types";
import { getRecipes, createPlannedMeal, getPlannedMeals } from "../services/api";

const PlanningPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [recipesData, plannedMealsData] = await Promise.all([
          getRecipes(),
          getPlannedMeals(selectedDate, selectedDate),
        ]);
        setRecipes(recipesData);
        setPlannedMeals(plannedMealsData);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  const handleAddMeal = async (recipeId: number, mealType: MealType) => {
    try {
      const newPlannedMeal = await createPlannedMeal({
        date: selectedDate,
        meal_type: mealType,
        recipe_id: recipeId,
        servings: 1,
      });
      setPlannedMeals([...plannedMeals, newPlannedMeal]);
    } catch (error) {
      console.error("Failed to add planned meal", error);
    }
  };

  const getMealsForType = (mealType: MealType) => {
    return plannedMeals.filter((meal) => meal.meal_type === mealType);
  };

  const renderMealSection = (mealType: MealType, title: string) => {
    const meals = getMealsForType(mealType);
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="space-y-2">
          {meals.map((meal) => {
            const recipe = recipes.find((r) => r.id === meal.recipe_id);
            return (
              <div
                key={meal.id}
                className="bg-white p-3 rounded shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{recipe?.name}</div>
                  <div className="text-sm text-gray-600">
                    {meal.servings} serving(s)
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {recipe?.calories_per_serving ? recipe.calories_per_serving * meal.servings : 0} cal
                </div>
              </div>
            );
          })}
          <button
            onClick={() => handleAddMeal(recipes[0]?.id || 0, mealType)}
            className="w-full bg-indigo-50 text-indigo-700 px-3 py-2 rounded hover:bg-indigo-100 text-sm"
          >
            + Add {title}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Meal Planning</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div>
              {renderMealSection(MealType.BREAKFAST, "Breakfast")}
              {renderMealSection(MealType.LUNCH, "Lunch")}
              {renderMealSection(MealType.DINNER, "Dinner")}
              {renderMealSection(MealType.SNACK, "Snacks")}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlanningPage; 