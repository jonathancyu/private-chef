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
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    serving_size: 1.0,
    serving_size_unit: "",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filteredIngredients = availableIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {showCreateForm ? "Create New Ingredient" : "Select Ingredient"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {showCreateForm ? (
          <form onSubmit={handleCreateIngredient}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serving Size
                  </label>
                  <input
                    type="number"
                    value={newIngredient.serving_size}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        serving_size: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serving Size Unit
                  </label>
                  <input
                    type="text"
                    value={newIngredient.serving_size_unit}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        serving_size_unit: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={newIngredient.calories}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        calories: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={newIngredient.protein}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        protein: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={newIngredient.carbs}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        carbs: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={newIngredient.fat}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        fat: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredIngredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => onSelectIngredient(ingredient.id)}
                  className="w-full text-left p-3 hover:bg-gray-100 rounded border"
                >
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-sm text-gray-600">
                    {ingredient.serving_size} {ingredient.serving_size_unit} | {ingredient.calories} cal
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200"
              >
                + Create New Ingredient
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IngredientPopup; 