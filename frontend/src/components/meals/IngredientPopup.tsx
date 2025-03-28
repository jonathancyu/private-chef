import React, { useState, useRef, useEffect } from "react";
import { Ingredient } from "../../types/api.types";
import { createIngredient } from "../../services/api";

interface IngredientPopupProps {
  availableIngredients: Ingredient[];
  onSelectIngredient: (ingredientId: number) => void;
  onClose: () => void;
}

const IngredientPopup: React.FC<IngredientPopupProps> = ({
  availableIngredients,
  onSelectIngredient,
  onClose,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    unit: "",
    calories_per_unit: 0,
    protein_per_unit: 0,
    carbs_per_unit: 0,
    fat_per_unit: 0,
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingNew && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isCreatingNew]);

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdIngredient = await createIngredient(newIngredient);
      onSelectIngredient(createdIngredient.id);
      onClose();
    } catch (error) {
      console.error("Failed to create ingredient", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isCreatingNew ? "Create New Ingredient" : "Select Ingredient"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {!isCreatingNew ? (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableIngredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => onSelectIngredient(ingredient.id)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  {ingredient.name} ({ingredient.unit})
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="mt-4 w-full bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200"
            >
              Create New Ingredient
            </button>
          </>
        ) : (
          <form onSubmit={handleCreateIngredient} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <input
                type="text"
                value={newIngredient.unit}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, unit: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Calories/Unit
                </label>
                <input
                  type="number"
                  value={newIngredient.calories_per_unit}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      calories_per_unit: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Protein/Unit (g)
                </label>
                <input
                  type="number"
                  value={newIngredient.protein_per_unit}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      protein_per_unit: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Carbs/Unit (g)
                </label>
                <input
                  type="number"
                  value={newIngredient.carbs_per_unit}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      carbs_per_unit: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fat/Unit (g)
                </label>
                <input
                  type="number"
                  value={newIngredient.fat_per_unit}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      fat_per_unit: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default IngredientPopup; 