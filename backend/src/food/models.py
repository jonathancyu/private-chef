from typing import Optional
from pydantic import BaseModel

from src.food.constants import FoodState


# Pydantic models
class Nutrition(BaseModel):
    calories: int
    fat: int
    protein: int
    carbohydrates: int


# Create recipe models
class IngredientResponse(Nutrition):
    food_id: int
    name: str
    note: str
    quantity: float
    unit: str


class CreateRecipeRequest(Nutrition):
    name: str
    ingredients: list[IngredientResponse]
    override_nutrition: bool


class RecipeResponse(Nutrition):
    id: int
    ingredients: list[IngredientResponse]


# Add food to database
class CreateFoodRequest(Nutrition):
    name: str
    state: Optional[FoodState] = FoodState.PLANNED
    serving_size: float
    serving_size_unit: str
    # TODO: if nutrition not present look up from usda


class CreateFoodResponse(Nutrition):
    id: int


# Add inventory
class AddInventoryRequest(Nutrition):
    state: Optional[FoodState] = FoodState.PLANNED
    food_id: int


# Update food in inventory
class UpdateInventoryRequest(Nutrition):
    food_id: int
    state: FoodState
    quantity: float
