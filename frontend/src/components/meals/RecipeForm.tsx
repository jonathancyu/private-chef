import React, { useState, useEffect } from "react";
import { Recipe, Food, RecipeIngredient, CreateRecipeRequest } from "../../types/api.types";
import { getIngredients, createRecipe } from "../../services/api";
import IngredientPopup from "./IngredientPopup";

interface RecipeFormProps {
  onRecipeCreated: (recipe: Recipe) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onRecipeCreated }) => {
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Food[]>([]);
  const [showIngredientPopup, setShowIngredientPopup] = useState(false);
  const [calculateNutrition, setCalculateNutrition] = useState(true);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });

  const loadIngredients = async () => {
    try {
      const ingredientsData = await getIngredients();
      setAvailableIngredients(ingredientsData);
    } catch (error) {
      console.error("Failed to load ingredients", error);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleIngredientSelected = (ingredientId: number) => {
    const selectedIngredient = availableIngredients.find(ing => ing.id === ingredientId);
    if (selectedIngredient) {
      setIngredients([
        ...ingredients,
        {
          ingredient_id: selectedIngredient.id,
          food: selectedIngredient,
          amount: 1,
          unit: selectedIngredient.serving_size_unit,
        },
      ]);
    }
    setShowIngredientPopup(false);
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setIngredients(updatedIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const recipeData: CreateRecipeRequest = {
        name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbohydrates: nutrition.carbohydrates,
        fat: nutrition.fat,
        override_nutrition: !calculateNutrition,
        ingredients: ingredients.map(ing => ({
          food_id: ing.ingredient_id,
          note: ing.note || "",
          quantity: ing.amount,
          unit: ing.unit
        }))
      };

      const createdRecipe = await createRecipe(recipeData);
      onRecipeCreated(createdRecipe);
    } catch (error) {
      console.error("Failed to create recipe", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Recipe Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Servings</label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min="1"
            step="0.5"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Calculate Nutrition</label>
          <input
            type="checkbox"
            checked={calculateNutrition}
            onChange={(e) => setCalculateNutrition(e.target.checked)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Calories</label>
            <input
              type="number"
              value={nutrition.calories}
              onChange={(e) => setNutrition({ ...nutrition, calories: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Protein (g)</label>
            <input
              type="number"
              value={nutrition.protein}
              onChange={(e) => setNutrition({ ...nutrition, protein: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Carbohydrates (g)</label>
            <input
              type="number"
              value={nutrition.carbohydrates}
              onChange={(e) => setNutrition({ ...nutrition, carbohydrates: Number(e.target.value) })}
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
              value={nutrition.fat}
              onChange={(e) => setNutrition({ ...nutrition, fat: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700">Ingredients</label>
            <button
              type="button"
              onClick={() => setShowIngredientPopup(true)}
              className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm"
            >
              + Add Ingredient
            </button>
          </div>

          {ingredients.length === 0 && (
            <p className="text-gray-500 text-sm italic">No ingredients added</p>
          )}

          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div className="flex-1 p-2 border rounded bg-gray-50">
                {ingredient.food.name} ({ingredient.unit})
              </div>
              <input
                type="number"
                value={ingredient.amount}
                onChange={(e) =>
                  updateIngredient(index, "amount", Number(e.target.value))
                }
                className="w-24 p-2 border rounded"
                min="0.1"
                step="0.1"
                required
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Recipe
          </button>
        </div>
      </form>

      {showIngredientPopup && (
        <IngredientPopup
          availableIngredients={availableIngredients}
          onSelectIngredient={handleIngredientSelected}
          onClose={() => setShowIngredientPopup(false)}
          onIngredientCreated={loadIngredients}
        />
      )}
    </div>
  );
};

export default RecipeForm;
