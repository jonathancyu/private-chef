import React, { useState, useEffect } from "react";
import { Recipe, RecipeInstruction, UpdateRecipeRequest, Food } from "../../types/api.types";
import { deleteRecipe, updateRecipe, getIngredients } from "../../services/api";
import IngredientPopup from "./IngredientPopup";

interface RecipeViewProps {
  recipe: Recipe;
  onRecipeDeleted: (recipeId: number) => void;
  onRecipeUpdated: (recipe: Recipe) => void;
}

const RecipeView: React.FC<RecipeViewProps> = ({ recipe, onRecipeDeleted, onRecipeUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState(recipe);
  const [showIngredientPopup, setShowIngredientPopup] = useState(false);
  const [newInstruction, setNewInstruction] = useState("");
  const [availableIngredients, setAvailableIngredients] = useState<Food[]>([]);

  useEffect(() => {
    setEditedRecipe(recipe);
    setIsEditing(false);
  }, [recipe]);

  useEffect(() => {
    if (showIngredientPopup) {
      loadIngredients();
    }
  }, [showIngredientPopup]);

  const loadIngredients = async () => {
    try {
      const ingredientsData = await getIngredients();
      setAvailableIngredients(ingredientsData);
    } catch (error) {
      console.error("Failed to load ingredients", error);
    }
  };

  const handleAddIngredient = (ingredientId: number) => {
    const selectedIngredient = availableIngredients.find(ing => ing.id === ingredientId);
    if (selectedIngredient) {
      setEditedRecipe({
        ...editedRecipe,
        ingredients: [
          ...editedRecipe.ingredients,
          {
            food: selectedIngredient,
            quantity: 1,
            unit: selectedIngredient.serving_size_unit,
          },
        ],
      });
    }
    setShowIngredientPopup(false);
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(recipe.id);
      onRecipeDeleted?.(recipe.id);
    } catch (error) {
      console.error("Failed to delete recipe", error);
      alert("Failed to delete recipe. Please try again.");
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData: UpdateRecipeRequest = {
        id: recipe.id,
        name: editedRecipe.name,
        ingredients: editedRecipe.ingredients.map(ing => ({
          food_id: ing.food.id,
          note: ing.note || "",
          quantity: ing.quantity,
          unit: ing.unit
        })),
        instructions: editedRecipe.instructions.map(instruction => ({
          step: instruction.step,
          text: instruction.text
        }))
      };

      const updatedRecipe = await updateRecipe(editedRecipe.id, updateData);
      onRecipeUpdated(updatedRecipe);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update recipe", error);
      alert("Failed to update recipe. Please try again.");
    }
  };

  const updateIngredient = (index: number, field: keyof typeof editedRecipe.ingredients[0], value: any) => {
    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setEditedRecipe({ ...editedRecipe, ingredients: updatedIngredients });
  };

  const removeIngredient = (index: number) => {
    setEditedRecipe({
      ...editedRecipe,
      ingredients: editedRecipe.ingredients.filter((_, i) => i !== index)
    });
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setEditedRecipe({
        ...editedRecipe,
        instructions: [
          ...editedRecipe.instructions,
          {
            id: Date.now(),
            step: editedRecipe.instructions.length + 1,
            text: newInstruction.trim(),
          },
        ],
      });
      setNewInstruction("");
    }
  };

  const updateInstruction = (index: number, text: string) => {
    const updatedInstructions = [...editedRecipe.instructions];
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      text,
    };
    setEditedRecipe({ ...editedRecipe, instructions: updatedInstructions });
  };

  const removeInstruction = (index: number) => {
    const updatedInstructions = editedRecipe.instructions
      .filter((_, i) => i !== index)
      .map((instruction, i) => ({
        ...instruction,
        step: i + 1,
      }));
    setEditedRecipe({ ...editedRecipe, instructions: updatedInstructions });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRecipe.name}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
                  className="text-3xl font-bold text-gray-900 mb-2 border rounded px-2 py-1"
                />
              ) : (
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
              )}
              <div className="text-gray-500">
                {recipe.food.serving_size} {recipe.food.serving_size_unit} per serving
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="p-2 rounded-full border border-green-500 text-green-500 hover:bg-green-50 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditedRecipe(recipe);
                      setIsEditing(false);
                    }}
                    className="p-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="p-2 rounded-full border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    {showConfirm && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                        <p className="text-gray-700 mb-4">Are you sure you want to delete this recipe?</p>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowConfirm(false)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDelete}
                            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Nutrition and Details */}
        <div className="p-8 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Facts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium text-gray-900">{recipe.food.calories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium text-gray-900">{recipe.food.protein}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Carbohydrates</span>
                  <span className="font-medium text-gray-900">{recipe.food.carbohydrates}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium text-gray-900">{recipe.food.fat}g</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Details</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Prep Time: 15 mins</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Cook Time: 30 mins</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Servings: 4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
            {isEditing && (
              <button
                onClick={() => setShowIngredientPopup(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Ingredient
              </button>
            )}
          </div>
          <div className="space-y-3">
            {editedRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{ingredient.food.name}</span>
                  {ingredient.note && (
                    <span className="text-gray-500 ml-2">({ingredient.note})</span>
                  )}
                </div>
                {isEditing ? (
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
                ) : (
                  <div className="text-gray-600">
                    {ingredient.quantity} {ingredient.unit}
                  </div>
                )}
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
            {editedRecipe.instructions.map((instruction, index) => (
              <div key={instruction.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                  {instruction.step}
                </div>
                {isEditing ? (
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
                ) : (
                  <div className="flex-1 text-gray-600">
                    {instruction.text}
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
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
            )}
          </div>
        </div>
      </div>

      {showIngredientPopup && (
        <IngredientPopup
          availableIngredients={availableIngredients}
          onSelectIngredient={handleAddIngredient}
          onClose={() => setShowIngredientPopup(false)}
        />
      )}
    </div>
  );
};

export default RecipeView; 