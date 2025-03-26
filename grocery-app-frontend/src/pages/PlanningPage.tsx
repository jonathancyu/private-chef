import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import RecipeForm from "../components/meals/RecipeForm";
import { Recipe } from "../types/api.types";
import { getRecipes } from "../services/api";

const PlanningPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipes();
        setRecipes(data);
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
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RecipeForm onRecipeCreated={handleRecipeCreated} />
        </div>
        <div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Your Recipes</h2>

            {loading ? (
              <div className="text-center py-8">Loading recipes...</div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recipes yet. Create your first recipe!
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="border rounded p-4">
                    <h3 className="font-semibold text-lg">{recipe.name}</h3>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>{recipe.servings} servings</span>
                      <span>
                        {recipe.calories_per_serving} calories per serving
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {recipe.protein_per_serving}g protein |{" "}
                      {recipe.carbs_per_serving}g carbs |{" "}
                      {recipe.fat_per_serving}g fat
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlanningPage;
