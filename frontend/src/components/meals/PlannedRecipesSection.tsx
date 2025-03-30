import React from "react";
import { Recipe } from "../../types/api.types";

interface PlannedRecipe {
  id: number;
  recipe: Recipe;
  amount: number;
  servings: number;
}

interface PlannedRecipesSectionProps {
  plannedRecipes: PlannedRecipe[];
  onDragStart: (e: React.DragEvent, recipe: PlannedRecipe) => void;
  onDelete: (id: number) => void;
}

const PlannedRecipesSection: React.FC<PlannedRecipesSectionProps> = ({
  plannedRecipes,
  onDragStart,
  onDelete,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Planned to Cook</h3>
      <div className="space-y-2">
        {plannedRecipes.map((plannedRecipe) => (
          <div
            key={plannedRecipe.id}
            draggable
            onDragStart={(e) => onDragStart(e, plannedRecipe)}
            className="bg-gray-50 p-3 rounded border border-gray-200 hover:border-indigo-300 cursor-move group"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{plannedRecipe.recipe.name}</div>
                <div className="text-sm text-gray-600">
                  {plannedRecipe.amount}x recipe ({plannedRecipe.servings} servings)
                </div>
              </div>
              <button
                onClick={() => onDelete(plannedRecipe.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {plannedRecipes.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No recipes planned to cook
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannedRecipesSection; 