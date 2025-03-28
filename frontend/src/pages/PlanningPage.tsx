import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { Recipe, MealType, PlannedMeal } from "../types/api.types";
import { getRecipes, createPlannedMeal, getPlannedMeals, deletePlannedMeal } from "../services/api";
import RecipePopup from "../components/meals/RecipePopup";

const PlanningPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWeek, setSelectedWeek] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showRecipePopup, setShowRecipePopup] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get the start and end dates for the selected week
  const getWeekDates = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const startDate = new Date(date.setDate(diff));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = getWeekDates(selectedWeek);
        const [recipesData, plannedMealsData] = await Promise.all([
          getRecipes(),
          getPlannedMeals(
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0]
          ),
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
  }, [selectedWeek]);

  const handleAddMeal = async (recipeId: number) => {
    if (!selectedMealType || !selectedDate) return;
    
    try {
      const newPlannedMeal = await createPlannedMeal({
        date: selectedDate,
        meal_type: selectedMealType,
        recipe_id: recipeId,
        servings: 1,
      });
      setPlannedMeals([...plannedMeals, newPlannedMeal]);
      setShowRecipePopup(false);
      setSelectedMealType(null);
      setSelectedDate(null);
    } catch (error) {
      console.error("Failed to add planned meal", error);
    }
  };

  const handleDeleteMeal = async (mealId: number) => {
    try {
      await deletePlannedMeal(mealId);
      setPlannedMeals(plannedMeals.filter((meal) => meal.id !== mealId));
    } catch (error) {
      console.error("Failed to delete planned meal", error);
    }
  };

  const getMealsForDateAndType = (date: string, mealType: MealType) => {
    return plannedMeals.filter(
      (meal) => meal.date === date && meal.meal_type === mealType
    );
  };

  const renderMealSection = (date: string, mealType: MealType, title: string) => {
    const meals = getMealsForDateAndType(date, mealType);
    return (
      <div className="min-h-[120px]">
        <div className="space-y-1">
          {meals.map((meal) => {
            const recipe = recipes.find((r) => r.id === meal.recipe_id);
            return (
              <div
                key={meal.id}
                className="bg-white p-2 rounded shadow-sm flex justify-between items-center text-sm"
              >
                <div>
                  <div className="font-medium">{recipe?.name}</div>
                  <div className="text-xs text-gray-600">
                    {meal.servings} serving(s)
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-600">
                    {recipe?.calories_per_serving ? recipe.calories_per_serving * meal.servings : 0} cal
                  </div>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => {
              setSelectedDate(date);
              setSelectedMealType(mealType);
              setShowRecipePopup(true);
            }}
            className="w-full text-indigo-600 hover:text-indigo-800 text-sm text-left p-1"
          >
            + Add
          </button>
        </div>
      </div>
    );
  };

  const renderDayColumn = (date: string, dayName: string) => {
    return (
      <div className="flex-1 min-w-0">
        <div className="bg-indigo-50 p-2 rounded-t text-center font-medium">
          {dayName}
        </div>
        <div className="bg-white p-2 rounded-b space-y-2">
          {renderMealSection(date, MealType.BREAKFAST, "Breakfast")}
          {renderMealSection(date, MealType.LUNCH, "Lunch")}
          {renderMealSection(date, MealType.DINNER, "Dinner")}
          {renderMealSection(date, MealType.SNACK, "Snacks")}
        </div>
      </div>
    );
  };

  const getWeekDays = (dateString: string) => {
    const { startDate } = getWeekDates(dateString);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date: date.toISOString().split("T")[0],
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return days;
  };

  const renderMealTypeLabel = (title: string) => {
    return (
      <div className="min-h-[120px] flex items-center">
        <div className="bg-indigo-50 p-2 rounded text-sm font-medium">
          {title}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Meal Planning</h2>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="p-2 border rounded"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2">
              {/* Labels column */}
              <div className="space-y-2">
                <div className="h-8"></div> {/* Spacer for day headers */}
                {renderMealTypeLabel("Breakfast")}
                {renderMealTypeLabel("Lunch")}
                {renderMealTypeLabel("Dinner")}
                {renderMealTypeLabel("Snacks")}
              </div>

              {/* Days columns */}
              {getWeekDays(selectedWeek).map((day) => (
                <div key={day.date} className="flex flex-col">
                  {renderDayColumn(day.date, day.name)}
                </div>
              ))}
            </div>
          )}
        </div>

        {showRecipePopup && (
          <RecipePopup
            availableRecipes={recipes}
            onSelectRecipe={handleAddMeal}
            onClose={() => {
              setShowRecipePopup(false);
              setSelectedMealType(null);
              setSelectedDate(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default PlanningPage; 