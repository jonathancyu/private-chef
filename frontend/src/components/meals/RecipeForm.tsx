import React, { useState, useEffect } from "react";
import { Recipe, Ingredient, RecipeIngredient } from "../../types/api.types";
import { getIngredients, createRecipe } from "../../services/api";
import IngredientPopup from "./IngredientPopup";

interface RecipeFormProps {
  onRecipeCreated: (recipe: Recipe) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onRecipeCreated }) => {
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const [caloriesPerServing, setCaloriesPerServing] = useState(0);
  const [proteinPerServing, setProteinPerServing] = useState(0);
  const [carbsPerServing, setCarbsPerServing] = useState(0);
  const [fatPerServing, setFatPerServing] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [showIngredientPopup, setShowIngredientPopup] = useState(false);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const ingredients = await getIngredients();
        setAvailableIngredients(ingredients);
      } catch (error) {
        console.error("Failed to load ingredients", error);
      }
    };

    loadIngredients();
  }, []);

  const handleIngredientSelected = (ingredientId: number) => {
    setIngredients([
      ...ingredients,
      { id: 0, ingredient_id: ingredientId, amount: 1 },
    ]);
    setShowIngredientPopup(false);
  };

  const updateIngredient = (
    index: number,
    field: keyof RecipeIngredient,
    value: any,
  ) => {
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

  const getIngredientDetails = (ingredientId: number): Ingredient | undefined => {
    return availableIngredients.find((ing) => ing.id === ingredientId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const recipeData = {
        name,
        servings,
        calories_per_serving: caloriesPerServing,
        protein_per_serving: proteinPerServing,
        carbs_per_serving: carbsPerServing,
        fat_per_serving: fatPerServing,
        instructions,
        ingredients: ingredients.map(({ ingredient_id, amount }) => ({
          ingredient_id,
          amount,
        })),
      } as Recipe;

      const createdRecipe = await createRecipe(recipeData);
      onRecipeCreated(createdRecipe);

      // Reset form
      setName("");
      setServings(1);
      setCaloriesPerServing(0);
      setProteinPerServing(0);
      setCarbsPerServing(0);
      setFatPerServing(0);
      setInstructions("");
      setIngredients([]);
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

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
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
          <div>
            <label className="block text-gray-700 mb-1">
              Calories Per Serving
            </label>
            <input
              type="number"
              value={caloriesPerServing}
              onChange={(e) => setCaloriesPerServing(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Protein (g)</label>
            <input
              type="number"
              value={proteinPerServing}
              onChange={(e) => setProteinPerServing(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Carbs (g)</label>
            <input
              type="number"
              value={carbsPerServing}
              onChange={(e) => setCarbsPerServing(Number(e.target.value))}
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
              value={fatPerServing}
              onChange={(e) => setFatPerServing(Number(e.target.value))}
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

          {ingredients.map((ingredient, index) => {
            const ingredientDetails = getIngredientDetails(ingredient.ingredient_id);
            return (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <div className="flex-1 p-2 border rounded bg-gray-50">
                  {ingredientDetails ? (
                    `${ingredientDetails.name} (${ingredientDetails.unit})`
                  ) : (
                    "Unknown Ingredient"
                  )}
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
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Recipe
        </button>
      </form>

      {showIngredientPopup && (
        <IngredientPopup
          availableIngredients={availableIngredients}
          onSelectIngredient={handleIngredientSelected}
          onClose={() => setShowIngredientPopup(false)}
        />
      )}
    </div>
  );
};

export default RecipeForm;
