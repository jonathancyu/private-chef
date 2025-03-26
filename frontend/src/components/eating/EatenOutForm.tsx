import React, { useState } from "react";
import { recordEatenOut } from "../../services/api";

interface EatenOutFormProps {
  onEatenOutRecorded: () => void;
}

const EatenOutForm: React.FC<EatenOutFormProps> = ({ onEatenOutRecorded }) => {
  const [restaurant, setRestaurant] = useState<string>("");
  const [mealName, setMealName] = useState<string>("");
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [servingsTotal, setServingsTotal] = useState<number>(1);
  const [servingsRemaining, setServingsRemaining] = useState<number>(0);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await recordEatenOut({
        restaurant,
        meal_name: mealName,
        calories,
        protein,
        carbs,
        fat,
        servings_total: servingsTotal,
        servings_remaining: servingsRemaining,
      });

      setStatus({
        type: "success",
        message: "Restaurant meal recorded successfully!",
      });

      // Reset form
      setRestaurant("");
      setMealName("");
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);
      setServingsTotal(1);
      setServingsRemaining(0);

      // Notify parent component
      onEatenOutRecorded();

      // Clear the status message after some time
      setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 5000);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to record restaurant meal",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Record Restaurant Meal</h2>

      {status.message && (
        <div
          className={`p-3 mb-4 rounded ${status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Restaurant</label>
          <input
            type="text"
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Meal Name</label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Calories</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Protein (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Carbs (g)</label>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Fat (g)</label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Total Servings</label>
            <input
              type="number"
              value={servingsTotal}
              onChange={(e) => setServingsTotal(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0.5"
              step="0.5"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Servings to Save</label>
            <input
              type="number"
              value={servingsRemaining}
              onChange={(e) => setServingsRemaining(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              step="0.5"
              max={servingsTotal}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Record Restaurant Meal
        </button>
      </form>
    </div>
  );
};

export default EatenOutForm;
