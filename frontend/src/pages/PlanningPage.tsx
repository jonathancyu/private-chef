import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { Recipe, MealType, PlannedMeal, Snack } from "../types/api.types";
import {
  getRecipes,
  createPlannedMeal,
  getPlannedMeals,
  deletePlannedMeal,
  updatePlannedMeal,
  getSnacks,
} from "../services/api";
import PlanningPopup from "../components/meals/PlanningPopup";
import MealPopup from "../components/meals/MealPopup";
import RecipePlanningPopup from "../components/meals/RecipePlanningPopup";
import ShoppingListSection from "../components/meals/PlannedRecipesSection";

interface PlannedRecipe {
  id: number;
  recipe: Recipe;
  amount: number;
  servings: number;
}

const PlanningPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [plannedRecipes, setPlannedRecipes] = useState<PlannedRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWeek, setSelectedWeek] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [showPlanningPopup, setShowPlanningPopup] = useState(false);
  const [showRecipePlanningPopup, setShowRecipePlanningPopup] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMealPopup, setShowMealPopup] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [nextPlannedRecipeId, setNextPlannedRecipeId] = useState(1);

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
        const [recipesData, snacksData, plannedMealsData] = await Promise.all([
          getRecipes(),
          getSnacks(),
          getPlannedMeals(
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ),
        ]);
        setRecipes(recipesData);
        setSnacks(snacksData);
        setPlannedMeals(plannedMealsData);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedWeek]);

  const handlePlanRecipe = (recipeId: number, amount: number) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const newPlannedRecipe: PlannedRecipe = {
      id: nextPlannedRecipeId,
      recipe,
      amount,
      servings: recipe.servings * amount,
    };

    setPlannedRecipes([...plannedRecipes, newPlannedRecipe]);
    setNextPlannedRecipeId(nextPlannedRecipeId + 1);
    setShowRecipePlanningPopup(false);
  };

  const handleDeletePlannedRecipe = (id: number) => {
    setPlannedRecipes(plannedRecipes.filter((pr) => pr.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, plannedRecipe: PlannedRecipe) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({
      type: 'planned_recipe',
      data: plannedRecipe
    }));
  };

  const handleMealDragStart = (e: React.DragEvent, meal: PlannedMeal) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({
      type: 'planned_meal',
      data: meal
    }));
  };

  const handleDrop = async (e: React.DragEvent, date: string, mealType: MealType) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const { type, data: dragData } = JSON.parse(data);

      if (type === 'planned_recipe') {
        const plannedRecipe: PlannedRecipe = dragData;
        const newPlannedMeal = await createPlannedMeal({
          date,
          meal_type: mealType,
          recipe_id: plannedRecipe.recipe.id,
          servings: 1, // Each dragged item represents 1 serving
        });

        setPlannedMeals([...plannedMeals, newPlannedMeal]);
        
        // Update the planned recipe's servings
        const updatedPlannedRecipes = plannedRecipes.map((pr) =>
          pr.id === plannedRecipe.id
            ? { ...pr, servings: pr.servings - 1 }
            : pr
        );

        // Remove the planned recipe if no servings left
        const finalPlannedRecipes = updatedPlannedRecipes.filter(
          (pr) => pr.servings > 0
        );

        setPlannedRecipes(finalPlannedRecipes);
      } else if (type === 'planned_meal') {
        const meal: PlannedMeal = dragData;
        await updatePlannedMeal(meal.id, {
          date,
          meal_type: mealType,
        });

        setPlannedMeals(plannedMeals.map(m => 
          m.id === meal.id 
            ? { ...m, date, meal_type: mealType }
            : m
        ));
      }
    } catch (error) {
      console.error("Failed to update meal", error);
    }
  };

  const handlePlannedRecipesDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const { type, data: dragData } = JSON.parse(data);

      if (type === 'planned_meal') {
        const meal: PlannedMeal = dragData;
        await deletePlannedMeal(meal.id);
        
        // Find the recipe and add it back to planned recipes
        const recipe = recipes.find(r => r.id === meal.recipe_id);
        if (recipe) {
          const existingPlannedRecipe = plannedRecipes.find(
            pr => pr.recipe.id === recipe.id
          );

          if (existingPlannedRecipe) {
            // Update existing planned recipe
            setPlannedRecipes(plannedRecipes.map(pr =>
              pr.id === existingPlannedRecipe.id
                ? { ...pr, servings: pr.servings + 1 }
                : pr
            ));
          } else {
            // Create new planned recipe
            const newPlannedRecipe: PlannedRecipe = {
              id: nextPlannedRecipeId,
              recipe,
              amount: 1,
              servings: 1,
            };
            setPlannedRecipes([...plannedRecipes, newPlannedRecipe]);
            setNextPlannedRecipeId(nextPlannedRecipeId + 1);
          }
        }

        setPlannedMeals(plannedMeals.filter(m => m.id !== meal.id));
      }
    } catch (error) {
      console.error("Failed to move meal back to planned recipes", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddMeal = async (itemId: number, isSnack: boolean) => {
    try {
      if (isSnack) {
        const snack = snacks.find(s => s.id === itemId);
        if (!snack) return;

        const newPlannedSnack: PlannedRecipe = {
          id: nextPlannedRecipeId,
          recipe: {
            id: snack.id,
            name: snack.name,
            servings: 1,
            calories_per_serving: snack.calories_per_serving,
            protein_per_serving: snack.protein_per_serving,
            carbs_per_serving: snack.carbs_per_serving,
            fat_per_serving: snack.fat_per_serving,
            instructions: "",
            ingredients: [],
          },
          amount: 1,
          servings: 1,
        };

        setPlannedRecipes([...plannedRecipes, newPlannedSnack]);
      } else {
        const recipe = recipes.find(r => r.id === itemId);
        if (!recipe) return;

        const newPlannedRecipe: PlannedRecipe = {
          id: nextPlannedRecipeId,
          recipe,
          amount: 1,
          servings: recipe.servings,
        };

        setPlannedRecipes([...plannedRecipes, newPlannedRecipe]);
      }
      setNextPlannedRecipeId(nextPlannedRecipeId + 1);
      setShowPlanningPopup(false);
    } catch (error) {
      console.error("Failed to add item to shopping list", error);
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

  const handleUpdateServings = async (mealId: number, newServings: number) => {
    try {
      await updatePlannedMeal(mealId, { servings: newServings });
      setPlannedMeals(
        plannedMeals.map((meal) =>
          meal.id === mealId ? { ...meal, servings: newServings } : meal,
        ),
      );
    } catch (error) {
      console.error("Failed to update servings", error);
    }
  };

  const getMealsForDateAndType = (date: string, mealType: MealType) => {
    return plannedMeals.filter(
      (meal) => meal.date === date && meal.meal_type === mealType,
    );
  };

  const renderMealSection = (
    date: string,
    mealType: MealType,
    title: string,
    key: string,
  ) => {
    const meals = getMealsForDateAndType(date, mealType);
    return (
      <div
        key={key}
        className="h-[120px] border-b border-r border-gray-200 last:border-b-0"
        onDrop={(e) => handleDrop(e, date, mealType)}
        onDragOver={handleDragOver}
      >
        <div className="h-full overflow-y-auto scrollbar-hide">
          {meals.map((meal) => {
            const recipe = meal.recipe_id
              ? recipes.find((r) => r.id === meal.recipe_id)
              : null;
            const snack = meal.snack_id
              ? snacks.find((s) => s.id === meal.snack_id)
              : null;
            const item = recipe || snack;

            return (
              <div
                key={meal.id}
                draggable
                onDragStart={(e) => handleMealDragStart(e, meal)}
                className="h-12 bg-white mb-1 px-2 py-1.5 flex justify-between items-start shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-move"
                onClick={() => {
                  setSelectedMeal(meal);
                  setShowMealPopup(true);
                }}
              >
                <div className="flex flex-col">
                  <span className="truncate text-sm font-medium">
                    {item?.name}
                  </span>
                  <span className="text-xs text-gray-600">
                    {item?.calories_per_serving
                      ? item.calories_per_serving * meal.servings
                      : 0}{" "}
                    cal
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {showMealPopup && selectedMeal && (
          <MealPopup
            recipeName={
              selectedMeal.recipe_id
                ? recipes.find((r) => r.id === selectedMeal.recipe_id)?.name ||
                  ""
                : snacks.find((s) => s.id === selectedMeal.snack_id)?.name || ""
            }
            currentServings={selectedMeal.servings}
            onUpdateServings={(servings: number) =>
              handleUpdateServings(selectedMeal.id, servings)
            }
            onUnplan={() => {
              handleDeleteMeal(selectedMeal.id);
              setShowMealPopup(false);
              setSelectedMeal(null);
            }}
            onClose={() => {
              setShowMealPopup(false);
              setSelectedMeal(null);
            }}
          />
        )}
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

  // Add this helper function before getAverageCaloriesForMealType
  const getCaloriesForMeal = (meal: PlannedMeal) => {
    const recipe = meal.recipe_id
      ? recipes.find((r) => r.id === meal.recipe_id)
      : null;
    const snack = meal.snack_id
      ? snacks.find((s) => s.id === meal.snack_id)
      : null;
    const item = recipe || snack;
    return item ? item.calories_per_serving * meal.servings : 0;
  };

  // Update the average calories calculation
  const getAverageCaloriesForMealType = (mealType: MealType) => {
    const mealsOfType = plannedMeals.filter(
      (meal) => meal.meal_type === mealType,
    );
    if (mealsOfType.length === 0) return 0;

    const totalCalories = mealsOfType.reduce((sum, meal) => {
      return sum + getCaloriesForMeal(meal);
    }, 0);

    // Average over 7 days (number of meal slots) rather than number of items
    return Math.round(totalCalories / 7);
  };

  // Add this helper function near the other helper functions
  const isCurrentWeek = (dateString: string) => {
    const today = new Date();
    const { startDate, endDate } = getWeekDates(dateString);
    return today >= startDate && today <= endDate;
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Meal Planning</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRecipePlanningPopup(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Plan Recipe
              </button>
              <div className="flex items-center space-x-2">
                {!isCurrentWeek(selectedWeek) && (
                  <button
                    onClick={() =>
                      setSelectedWeek(new Date().toISOString().split("T")[0])
                    }
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Go to current week"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => {
                    const date = new Date(selectedWeek);
                    date.setDate(date.getDate() - 7);
                    setSelectedWeek(date.toISOString().split("T")[0]);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <span className="text-gray-600 font-medium">
                  {((): string => {
                    const { startDate, endDate } = getWeekDates(selectedWeek);
                    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                  })()}
                </span>
                <button
                  onClick={() => {
                    const date = new Date(selectedWeek);
                    date.setDate(date.getDate() + 7);
                    setSelectedWeek(date.toISOString().split("T")[0]);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ShoppingListSection
                  plannedRecipes={plannedRecipes}
                  onDragStart={handleDragStart}
                  onDelete={handleDeletePlannedRecipe}
                  onDrop={handlePlannedRecipesDrop}
                  onDragOver={handleDragOver}
                  onAddClick={() => setShowPlanningPopup(true)}
                />
              </div>
              <div className="lg:col-span-3">
                <div className="relative flex gap-4">
                  {/* Meal Types Table */}
                  <div className="w-[100px] border border-gray-300 rounded-lg mt-[41px] overflow-hidden">
                    <div className="bg-gray-50">
                      {[
                        { type: MealType.BREAKFAST, label: "Breakfast" },
                        { type: MealType.LUNCH, label: "Lunch" },
                        { type: MealType.DINNER, label: "Dinner" },
                        { type: MealType.SNACK, label: "Snacks" },
                      ].map(({ type, label }, index) => (
                        <div
                          key={type}
                          className={`h-[120px] p-4 ${index !== 3 ? "border-b border-gray-300" : ""}`}
                        >
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
                    <div className="overflow-x-auto">
                      <div className="min-w-[800px]">
                        <div className="grid grid-cols-7">
                          {getWeekDays(selectedWeek).map((day) => (
                            <div
                              key={day.date}
                              className="bg-indigo-600 text-white p-2 text-center font-medium border-r last:border-r-0"
                            >
                              {day.name}
                            </div>
                          ))}
                          {[
                            MealType.BREAKFAST,
                            MealType.LUNCH,
                            MealType.DINNER,
                            MealType.SNACK,
                          ].map((mealType, mealIndex) =>
                            getWeekDays(selectedWeek).map((day, dayIndex) => (
                              <div
                                key={`${day.date}-${mealType}`}
                                className={`bg-gray-50 border-r last:border-r-0 ${mealIndex !== 3 ? "border-b border-gray-300" : ""}`}
                              >
                                {renderMealSection(
                                  day.date,
                                  mealType,
                                  "",
                                  `${day.date}-${mealType}`,
                                )}
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showPlanningPopup && (
          <PlanningPopup
            availableRecipes={recipes}
            availableSnacks={snacks}
            onSelect={handleAddMeal}
            onClose={() => {
              setShowPlanningPopup(false);
              setSelectedMealType(null);
              setSelectedDate(null);
            }}
          />
        )}

        {showRecipePlanningPopup && (
          <RecipePlanningPopup
            availableRecipes={recipes}
            onSelect={handlePlanRecipe}
            onClose={() => setShowRecipePlanningPopup(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default PlanningPage;

