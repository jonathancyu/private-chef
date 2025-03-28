import React, { useState, useRef, useEffect } from "react";
import { Recipe, Snack } from "../../types/api.types";

interface PlanningPopupProps {
  availableRecipes: Recipe[];
  availableSnacks: Snack[];
  onSelect: (itemId: number, isSnack: boolean) => void;
  onClose: () => void;
}

const PlanningPopup: React.FC<PlanningPopupProps> = ({
  availableRecipes,
  availableSnacks,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"recipes" | "snacks">("recipes");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filteredRecipes = availableRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSnacks = availableSnacks.filter((snack) =>
    snack.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Item</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab("recipes")}
            className={`flex-1 py-2 px-4 rounded ${
              activeTab === "recipes"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setActiveTab("snacks")}
            className={`flex-1 py-2 px-4 rounded ${
              activeTab === "snacks"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Snacks
          </button>
        </div>

        <div className="mb-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activeTab === "recipes" ? (
            filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => onSelect(recipe.id, false)}
                className="w-full text-left p-3 hover:bg-gray-100 rounded border"
              >
                <div className="font-medium">{recipe.name}</div>
                <div className="text-sm text-gray-600">
                  {recipe.servings} servings | {recipe.calories_per_serving} cal/serving
                </div>
              </button>
            ))
          ) : (
            filteredSnacks.map((snack) => (
              <button
                key={snack.id}
                onClick={() => onSelect(snack.id, true)}
                className="w-full text-left p-3 hover:bg-gray-100 rounded border"
              >
                <div className="font-medium">{snack.name}</div>
                <div className="text-sm text-gray-600">
                  {snack.servings} servings | {snack.calories_per_serving} cal/serving
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningPopup; 