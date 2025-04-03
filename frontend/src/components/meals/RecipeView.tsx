import React from "react";
import { Recipe } from "../../types/api.types";

interface RecipeViewProps {
  recipe: Recipe;
}

const RecipeView: React.FC<RecipeViewProps> = ({ recipe }) => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">{recipe.name}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Nutrition</h3>
          <div className="space-y-1">
            <div>Calories: {recipe.food.calories}</div>
            <div>Protein: {recipe.food.protein}g</div>
            <div>Carbohydrates: {recipe.food.carbohydrates}g</div>
            <div>Fat: {recipe.food.fat}g</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Recipe Details</h3>
          <div className="space-y-1">
            <div>Serving Size: {recipe.food.serving_size} {recipe.food.serving_size_unit}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Ingredients</h3>
        <div className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="font-medium">{ingredient.quantity}</span>
              <span>{ingredient.unit}</span>
              <span>{ingredient.food.name}</span>
              {ingredient.note && (
                <span className="text-gray-500">({ingredient.note})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Instructions</h3>
        <div className="whitespace-pre-wrap">{recipe.instructions}</div>
      </div>
    </div>
  );
};

export default RecipeView; 