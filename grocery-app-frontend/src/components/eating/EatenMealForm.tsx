import React, { useState, useEffect } from "react";
import { CookedMeal, Snack, EatenOut, MealType } from "../../types/api.types";
import { recordEatenMeal, recordEatenOut } from "../../services/api";

interface MealSourceProps {
  cookedMeals: CookedMeal[];
  snacks: Snack[];
  eatenOut: EatenOut[];
  selectedSource: string;
  selectedId: number | "";
  onSourceChange: (source: string) => void;
  onIdChange: (id: number) => void;
}

const MealSource: React.FC<MealSourceProps> = ({
  cookedMeals,
  snacks,
  eatenOut,
  selectedSource,
  selectedId,
  onSourceChange,
  onIdChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-1">Meal Source</label>
        <select
          value={selectedSource}
          onChange={(e) => {
            onSourceChange(e.target.value);
            // Reset selected ID when source changes
            onIdChange(0);
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Source</option>
          <option value="cooked_meal">Cooked Meal</option>
          <option value="snack">Snack</option>
          <option value="eaten_out">Eaten Out</option>
        </select>
      </div>

      {selectedSource && (
        <div>
          <label className="block text-gray-700 mb-1">
            {selectedSource === "cooked_meal"
              ? "Select Cooked Meal"
              : selectedSource === "snack"
                ? "Select Snack"
                : "Select Restaurant Meal"}
          </label>
          <select
            value={selectedId}
            onChange={(e) => onIdChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            {selectedSource === "cooked_meal" &&
              cookedMeals.map((meal) => (
                <option key={meal.id} value={meal.id}>
                  {meal.recipe.name} ({meal.servings_remaining} servings left)
                </option>
              ))}
            {selectedSource === "snack" &&
              snacks.map((snack) => (
                <option key={snack.id} value={snack.id}>
                  {snack.name}
                </option>
              ))}
            {selectedSource === "eaten_out" &&
              eatenOut.map((meal) => (
                <option key={meal.id} value={meal.id}>
                  {meal.restaurant} - {meal.meal_name} (
                  {meal.servings_remaining} servings left)
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

interface EatenMealFormProps {
  cookedMeals: CookedMeal[];
  snacks: Snack[];
  eatenOut: EatenOut[];
  onMealEaten: () => void;
}

const EatenMealForm: React.FC<EatenMealFormProps> = ({
  cookedMeals,
  snacks,
  eatenOut,
  onMealEaten,
}) => {
  const [mealType, setMealType] = useState<MealType>(MealType.BREAKFAST);
  const [servings, setServings] = useState<number>(1);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });

  const handleEatMeal = async () => {
    if (!selectedSource || !selectedId) {
      setStatus({
        type: "error",
        message: "Please select a meal source and specific item",
      });
      return;
    }

    try {
      const mealData: any = {
        meal_type: mealType,
        servings: servings,
      };

      if (selectedSource === "cooked_meal") {
        mealData.cooked_meal_id = selectedId;
      } else if (selectedSource === "snack") {
        mealData.snack_id = selectedId;
      } else if (selectedSource === "eaten_out") {
        mealData.eaten_out_id = selectedId;
      }

      await recordEatenMeal(mealData);

      setStatus({
        type: "success",
        message: "Meal recorded successfully!",
      });

      // Reset form
      setServings(1);
      setSelectedSource("");
      setSelectedId("");

      // Notify parent component
      onMealEaten();

      // Clear the status message after some time
      setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 5000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.response?.data?.detail || "Failed to record meal",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Record Eaten Meal</h2>

      {status.message && (
        <div
          className={`p-3 mb-4 rounded ${status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {status.message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Meal Type</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full p-2 border rounded"
          >
            <option value={MealType.BREAKFAST}>Breakfast</option>
            <option value={MealType.LUNCH}>Lunch</option>
            <option value={MealType.DINNER}>Dinner</option>
            <option value={MealType.SNACK}>Snack</option>
          </select>
        </div>

        <MealSource
          cookedMeals={cookedMeals}
          snacks={snacks}
          eatenOut={eatenOut}
          selectedSource={selectedSource}
          selectedId={selectedId}
          onSourceChange={setSelectedSource}
          onIdChange={setSelectedId}
        />

        <div>
          <label className="block text-gray-700 mb-1">Servings</label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min="0.1"
            step="0.1"
            required
          />
        </div>

        <button
          onClick={handleEatMeal}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          disabled={!selectedSource || !selectedId}
        >
          Record Meal
        </button>
      </div>
    </div>
  );
};

export default EatenMealForm;
