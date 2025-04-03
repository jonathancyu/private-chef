import React, { useState, useEffect } from "react";
import { Recipe } from "../types/api.types";
import { getRecipes, createRecipe } from "../services/api";
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

        // Load saved recipe ID from localStorage
        const savedRecipeId = localStorage.getItem('selectedRecipeId');
        if (savedRecipeId) {
          const savedRecipe = recipesData.find(recipe => recipe.id.toString() === savedRecipeId);
          if (savedRecipe) {
            setSelectedRecipe(savedRecipe);
          }
        }
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

  const handleRecipeDeleted = (recipeId: number) => {
    setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(null);
    }
  };

  const handleRecipeUpdated = (updatedRecipe: Recipe) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));
    setSelectedRecipe(updatedRecipe);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Recipe
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recipes</h2>
          <div className="space-y-2">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => {
                  setSelectedRecipe(recipe);
                  setShowCreateForm(false);
                }}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  selectedRecipe?.id === recipe.id
                    ? "bg-indigo-50 border border-indigo-200"
                    : "hover:bg-gray-50 border border-gray-100"
                }`}
              >
                <div className="font-medium text-gray-900">{recipe.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {recipe.food.calories} calories
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
          <RecipeView 
            recipe={selectedRecipe} 
            onRecipeDeleted={handleRecipeDeleted}
            onRecipeUpdated={handleRecipeUpdated}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recipe Selected</h3>
            <p className="text-gray-500 max-w-md">
              Select a recipe from the sidebar or create a new one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipePage; 