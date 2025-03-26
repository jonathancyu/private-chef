import React, { useState, useEffect } from "react";
import { Recipe } from "../../types/api.types";
import { getRecipes, createCookedMeal } from "../../services/api";

const CookMealForm: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | "">("");
  const [servingsCooked, setServingsCooked] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const recipesData = await getRecipes();
        setRecipes(recipesData);

        if (recipesData.length > 0) {
          setSelectedRecipeId(recipesData[0].id);
        }
      } catch (error) {
        console.error("Failed to load recipes", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const handleCookMeal = async () => {
    if (!selectedRecipeId) return;

    try {
      await createCookedMeal({
        recipe_id: Number(selectedRecipeId),
        servings_remaining: servingsCooked,
      });

      setStatus({
        type: "success",
        message: "Meal cooked successfully! Inventory has been updated.",
      });

      // Reset form
      setServingsCooked(1);

      // Clear the status message after some time
      setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 5000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.response?.data?.detail || "Failed to cook meal",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading recipes...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Cook a Meal</h2>

      {status.message && (
        <div
          className={`p-3 mb-4 rounded ${status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {status.message}
        </div>
      )}

      {recipes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recipes available. Please create a recipe first.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Select Recipe</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} ({recipe.servings} servings)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Servings Cooked</label>
            <input
              type="number"
              value={servingsCooked}
              onChange={(e) => setServingsCooked(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0.5"
              step="0.5"
              required
            />
          </div>

          <button
            onClick={handleCookMeal}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Cook Meal
          </button>
        </div>
      )}
    </div>
  );
};

export default CookMealForm;
