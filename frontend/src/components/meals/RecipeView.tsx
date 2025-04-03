import React, { useState } from "react";
import { Recipe } from "../../types/api.types";
import { deleteRecipe } from "../../services/api";

interface RecipeViewProps {
  recipe: Recipe;
  onRecipeDeleted?: (recipeId: number) => void;
}

const RecipeView: React.FC<RecipeViewProps> = ({ recipe, onRecipeDeleted }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteRecipe(recipe.id);
      onRecipeDeleted?.(recipe.id);
    } catch (error) {
      console.error("Failed to delete recipe", error);
      alert("Failed to delete recipe. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
              <div className="text-gray-500">
                {recipe.food.serving_size} {recipe.food.serving_size_unit} per serving
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowConfirm(true)}
                className="p-2 rounded-full border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              {/* Confirmation Dialog */}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{ingredient.food.name}</span>
                  {ingredient.note && (
                    <span className="text-gray-500 ml-2">({ingredient.note})</span>
                  )}
                </div>
                <div className="text-gray-600">
                  {ingredient.quantity} {ingredient.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
          <div className="space-y-4">
            {recipe.instructions.length > 0 ? (
              recipe.instructions.map((instruction) => (
                <div key={instruction.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                    {instruction.step}
                  </div>
                  <div className="flex-1 text-gray-600">
                    {instruction.text}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No instructions provided for this recipe.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeView; 