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
class CreateRecipeIngredient(Nutrition):
    name: str
    note: str
    quantity: float
    unit: str


class CreateRecipeRequest(Nutrition):
    ingredients: list[CreateRecipeIngredient]
    override_nutrition: bool


class CreateRecipeResponse(Nutrition):
    id: int


# Add food to inventory
class CreateFoodRequest(Nutrition):
    name: str
    state: Optional[FoodState] = FoodState.PLANNED
    # TODO: if nutrition not present look up from usda


class CreateFoodResponse(Nutrition):
    id: int


# Update food in inventory
class UpdateInventoryRequest(Nutrition):
    food_id: int
    state: FoodState
    quantity: float
