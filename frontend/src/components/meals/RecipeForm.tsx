import React, { useState, useEffect } from "react";
import { Recipe, RecipeInstruction, Food, CreateRecipeRequest } from "../../types/api.types";
import { createRecipe } from "../../services/api";
import IngredientPopup from "./IngredientPopup";

interface RecipeFormProps {
  onRecipeCreated: (recipe: Recipe) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onRecipeCreated }) => {
  const [recipe, setRecipe] = useState<CreateRecipeRequest>({
    name: "",
    ingredients: [] as Array<{
      food_id: number;
      quantity: number;
      unit: string;
      note: string;
    }>,
    instructions: [] as Array<{
      step: number;
      text: string;
    }>,
    override_nutrition: false,
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });
  const [showIngredientPopup, setShowIngredientPopup] = useState(false);
  const [newInstruction, setNewInstruction] = useState("");

  const handleAddIngredient = (food: Food) => {
    setRecipe({
      ...recipe,
      ingredients: [
        ...recipe.ingredients,
        {
          food_id: food.id,
          note: "",
          quantity: 1,
          unit: food.serving_size_unit,
        },
      ],
    });
    setShowIngredientPopup(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdRecipe = await createRecipe(recipe);
      onRecipeCreated(createdRecipe);
    } catch (error) {
      console.error("Failed to create recipe", error);
      alert("Failed to create recipe. Please try again.");
    }
  };

  const updateIngredient = (index: number, field: keyof typeof recipe.ingredients[0], value: any) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  const removeIngredient = (index: number) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter((_, i) => i !== index)
    });
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setRecipe({
        ...recipe,
        instructions: [
          ...recipe.instructions,
          {
            step: recipe.instructions.length + 1,
            text: newInstruction.trim(),
          },
        ],
      });
      setNewInstruction("");
    }
  };

  const updateInstruction = (index: number, text: string) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      text,
    };
    setRecipe({ ...recipe, instructions: updatedInstructions });
  };

  const removeInstruction = (index: number) => {
    const updatedInstructions = recipe.instructions
      .filter((_, i) => i !== index)
      .map((instruction, i) => ({
        ...instruction,
        step: i + 1,
      }));
    setRecipe({ ...recipe, instructions: updatedInstructions });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <input
                type="text"
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                placeholder="Recipe Name"
                className="text-3xl font-bold text-gray-900 mb-2 border rounded px-2 py-1 w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Create Recipe
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
            <button
              onClick={() => setShowIngredientPopup(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Ingredient
            </button>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Ingredient {ingredient.food_id}</span>
                  {ingredient.note && (
                    <span className="text-gray-500 ml-2">({ingredient.note})</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    min="0.1"
                    step="0.1"
                  />
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
          </div>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                  {instruction.step}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={instruction.text}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={() => removeInstruction(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <div className="flex space-x-2 mt-4">
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
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Add a new instruction..."
              />
              <button
                onClick={addInstruction}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </form>

      {showIngredientPopup && (
        <IngredientPopup
          onSelectIngredient={handleAddIngredient}
          onClose={() => setShowIngredientPopup(false)}
        />
      )}
    </div>
  );
};

export default RecipeForm;
