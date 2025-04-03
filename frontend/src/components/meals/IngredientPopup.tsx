import React, { useState, useRef, useEffect } from "react";
import { Food } from "../../types/api.types";
import { getIngredients, createIngredient } from "../../services/api";

interface IngredientPopupProps {
  onSelectIngredient: (food: Food) => void;
  onClose: () => void;
}

const IngredientPopup: React.FC<IngredientPopupProps> = ({
  onSelectIngredient,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    serving_size: 1.0,
    serving_size_unit: "",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const ingredientsData = await getIngredients();
      setAvailableIngredients(ingredientsData);
    } catch (error) {
      console.error("Failed to load ingredients", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = availableIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate ingredients into raw and recipe-based
  const rawIngredients = filteredIngredients.filter(ing => !ing.source_recipe_id);
  const recipeBasedIngredients = filteredIngredients.filter(ing => ing.source_recipe_id);

  const renderIngredientList = (ingredients: Food[], title: string) => (
    <>
      {ingredients.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
          <div className="space-y-2">
            {ingredients.map((ingredient) => (
              <button
                key={ingredient.id}
                onClick={() => onSelectIngredient(ingredient)}
                className="w-full text-left p-3 hover:bg-gray-100 rounded border"
              >
                <div className="font-medium">{ingredient.name}</div>
                <div className="text-sm text-gray-600">
                  {ingredient.serving_size} {ingredient.serving_size_unit} | {ingredient.calories} cal
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const createdIngredient = await createIngredient(newIngredient);
      onSelectIngredient(createdIngredient);
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
                        calories: Math.round(Number(e.target.value)),
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
                        protein: Math.round(Number(e.target.value)),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbohydrates (g)
                  </label>
                  <input
                    type="number"
                    value={newIngredient.carbohydrates}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        carbohydrates: Math.round(Number(e.target.value)),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
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
                        fat: Math.round(Number(e.target.value)),
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
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

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading ingredients...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {renderIngredientList(rawIngredients, "Raw Ingredients")}
                {renderIngredientList(recipeBasedIngredients, "Recipe-Based Ingredients")}
                
                {filteredIngredients.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No ingredients found
                  </p>
                )}
              </div>
            )}

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