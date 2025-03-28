import React, { useState, useRef, useEffect } from "react";
import { Recipe } from "../../types/api.types";

interface RecipePopupProps {
  availableRecipes: Recipe[];
  onSelectRecipe: (recipeId: number) => void;
  onClose: () => void;
}

const RecipePopup: React.FC<RecipePopupProps> = ({
  availableRecipes,
  onSelectRecipe,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filteredRecipes = availableRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Recipe</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="w-full text-left p-3 hover:bg-gray-100 rounded border"
            >
              <div className="font-medium">{recipe.name}</div>
              <div className="text-sm text-gray-600">
                {recipe.servings} servings | {recipe.calories_per_serving} cal/serving
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipePopup; 