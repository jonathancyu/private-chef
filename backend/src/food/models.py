from typing import Optional
from pydantic import BaseModel

from src.food.constants import FoodState


# Pydantic models
class BaseFoodModel(BaseModel):
    calories: int
    fat: int
    protein: int
    carbohydrates: int


# Recipe related requests
class CreateRecipeIngredient(BaseFoodModel):
    name: str
    note: str
    quantity: float
    unit: str


class CreateRecipeRequest(BaseFoodModel):
    ingredients: list[CreateRecipeIngredient]
    override_nutrition: bool


# Add food to inventory
class CreateFoodRequest(BaseFoodModel):
    name: str
    state: Optional[FoodState] = FoodState.PLANNED
    # TODO: if nutrition not present look up from usda


class CreateFoodResponse(BaseFoodModel):
    id: int


# Update food in inventory
class UpdateInventoryRequest(BaseFoodModel):
    food_id: int
    state: FoodState
    quantity: float
