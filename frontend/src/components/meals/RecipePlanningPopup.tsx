import React, { useState, useRef } from "react";
import { Recipe } from "../../types/api.types";

interface RecipePlanningPopupProps {
  availableRecipes: Recipe[];
  onSelect: (recipeId: number, amount: number) => void;
  onClose: () => void;
}

const RecipePlanningPopup: React.FC<RecipePlanningPopupProps> = ({
  availableRecipes,
  onSelect,
  onClose,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | "">("");
  const [amount, setAmount] = useState<number>(1);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!selectedRecipeId) return;
    onSelect(Number(selectedRecipeId), amount);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div
        ref={popupRef}
        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
      >
        <h3 className="text-lg font-semibold mb-4">Plan Recipe to Cook</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Recipe
          </label>
          <select
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a recipe...</option>
            {availableRecipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name} ({recipe.servings} servings)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Cook
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAmount(Math.max(0.5, amount - 0.5))}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center">{amount}x</span>
            <button
              onClick={() => setAmount(amount + 0.5)}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedRecipeId}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Plan Recipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipePlanningPopup; 