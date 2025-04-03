import React, { useState, useEffect } from "react";
import { Recipe, Food, RecipeIngredient, CreateRecipeRequest, RecipeInstruction } from "../../types/api.types";
import { getIngredients, createRecipe } from "../../services/api";
import IngredientPopup from "./IngredientPopup";

interface RecipeFormProps {
  onRecipeCreated: (recipe: Recipe) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onRecipeCreated }) => {
  const [name, setName] = useState("");
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
  const [instructions, setInstructions] = useState<RecipeInstruction[]>([]);
  const [newInstruction, setNewInstruction] = useState("");

  useEffect(() => {
    if (!calculateNutrition) {
      setNutrition({
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
      });
    }
  }, [calculateNutrition]);

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
          food: selectedIngredient,
          quantity: 1,
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

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([
        ...instructions,
        {
          id: Date.now(), // Temporary ID for new instructions
          step: instructions.length + 1,
          text: newInstruction.trim(),
        },
      ]);
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    const updatedInstructions = instructions
      .filter((_, i) => i !== index)
      .map((instruction, i) => ({
        ...instruction,
        step: i + 1,
      }));
    setInstructions(updatedInstructions);
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
          food_id: ing.food.id,
          note: ing.note || "",
          quantity: ing.quantity,
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
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Recipe</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
              placeholder="Enter recipe name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={calculateNutrition}
              onChange={(e) => setCalculateNutrition(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">Calculate Nutrition Automatically</label>
          </div>

          {!calculateNutrition && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                  <input
                    type="number"
                    value={nutrition.calories}
                    onChange={(e) => setNutrition({ ...nutrition, calories: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={nutrition.protein}
                    onChange={(e) => setNutrition({ ...nutrition, protein: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbohydrates (g)</label>
                  <input
                    type="number"
                    value={nutrition.carbohydrates}
                    onChange={(e) => setNutrition({ ...nutrition, carbohydrates: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={nutrition.fat}
                    onChange={(e) => setNutrition({ ...nutrition, fat: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Ingredients</label>
            <button
              type="button"
              onClick={() => setShowIngredientPopup(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Ingredient
            </button>
          </div>

          {ingredients.length === 0 && (
            <p className="text-gray-500 text-sm italic text-center py-4 bg-gray-50 rounded-md">
              No ingredients added yet
            </p>
          )}

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{ingredient.food.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({ingredient.unit})</span>
                </div>
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  min="0.1"
                  step="0.1"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
          </div>

          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={instruction.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                  {instruction.step}
                </div>
                <div className="flex-1 text-gray-600">
                  {instruction.text}
                </div>
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInstruction();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Add a new instruction..."
              />
              <button
                type="button"
                onClick={addInstruction}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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
