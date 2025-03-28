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
      <div className="h-[120px] border-b border-r border-gray-200 last:border-b-0">
        <div className="flex-1 space-y-1">
          {meals.map((meal) => {
            const recipe = recipes.find((r) => r.id === meal.recipe_id);
            return (
              <div
                key={meal.id}
                className="bg-white p-2 flex justify-between items-center text-sm"
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

  const renderDayColumn = (date: string, dayName: string, isFirstDay: boolean = false) => {
    return (
      <div className="flex-1 min-w-0 border-r border-gray-300 last:border-r-0">
        <div className="bg-indigo-600 text-white p-2 text-center font-medium">
          {dayName}
        </div>
        <div className="bg-gray-50">
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

  // Add this helper function to calculate average calories for a meal type
  const getAverageCaloriesForMealType = (mealType: MealType) => {
    const mealsOfType = plannedMeals.filter(meal => meal.meal_type === mealType);
    if (mealsOfType.length === 0) return 0;
    
    const totalCalories = mealsOfType.reduce((sum, meal) => {
      const recipe = recipes.find(r => r.id === meal.recipe_id);
      return sum + (recipe?.calories_per_serving || 0) * meal.servings;
    }, 0);
    
    return Math.round(totalCalories / mealsOfType.length);
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
            <div className="relative flex gap-4">
              {/* Meal Types Table */}
              <div className="w-[100px] border border-gray-300 rounded-lg mt-[41px] overflow-hidden">
                <div className="bg-gray-50">
                  {[
                    { type: MealType.BREAKFAST, label: "Breakfast" },
                    { type: MealType.LUNCH, label: "Lunch" },
                    { type: MealType.DINNER, label: "Dinner" },
                    { type: MealType.SNACK, label: "Snacks" }
                  ].map(({ type, label }, index) => (
                    <div key={type} className={`h-[120px] p-4 ${index !== 3 ? 'border-b border-gray-300' : ''}`}>
                      <div className="font-medium text-indigo-600">{label}</div>
                      <div className="text-sm text-gray-600">
                        Avg: {getAverageCaloriesForMealType(type)} cal
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Planning Table */}
              <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                <div className="grid grid-cols-7">
                  {getWeekDays(selectedWeek).map(day => (
                    <div key={day.date} className="bg-indigo-600 text-white p-2 text-center font-medium border-r last:border-r-0">
                      {day.name}
                    </div>
                  ))}
                  {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK].map((mealType, mealIndex) => (
                    getWeekDays(selectedWeek).map((day, dayIndex) => (
                      <div 
                        key={`${day.date}-${mealType}`} 
                        className={`bg-gray-50 border-r last:border-r-0 ${mealIndex !== 3 ? 'border-b border-gray-300' : ''}`}
                      >
                        {renderMealSection(day.date, mealType, "")}
                      </div>
                    ))
                  ))}
                </div>
              </div>
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