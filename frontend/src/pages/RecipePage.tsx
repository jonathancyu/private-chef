import React, { useState, useEffect } from "react";
import { Recipe, Food } from "../types/api.types";
import { getRecipes, getIngredients, createRecipe } from "../services/api";
import RecipeForm from "../components/meals/RecipeForm";
import RecipeView from "../components/meals/RecipeView";

const RecipePage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const recipesData = await getRecipes();
        setRecipes(recipesData);
      } catch (error) {
        console.error("Failed to load recipes", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const handleRecipeCreated = (recipe: Recipe) => {
    setRecipes([...recipes, recipe]);
    setShowCreateForm(false);
    setSelectedRecipe(recipe);
  };

  if (loading) {
    return <div className="text-center py-8">Loading recipes...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Recipe
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recipes</h2>
          <div className="space-y-2">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className={`w-full text-left p-3 rounded ${
                  selectedRecipe?.id === recipe.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-gray-50"
                }`}
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {showCreateForm ? (
          <RecipeForm onRecipeCreated={handleRecipeCreated} />
        ) : selectedRecipe ? (
          <RecipeView recipe={selectedRecipe} />
        ) : (
          <div className="text-center text-gray-500 py-8">
            Select a recipe or create a new one
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipePage; 