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
class IngredientRequest(BaseModel):
    food_id: int
    note: str
    quantity: float
    unit: str


class CreateRecipeRequest(Nutrition):
    name: str
    ingredients: list[IngredientRequest]
    override_nutrition: bool


class IngredientResponse(Nutrition):
    food_id: int
    name: str
    note: str
    quantity: float
    unit: str


class RecipeResponse(Nutrition):
    id: int
    name: str
    ingredients: list[IngredientResponse]


# Add food to database
class CreateFoodRequest(Nutrition):
    name: str
    serving_size: float
    serving_size_unit: str
    # TODO: if nutrition not present look up from usda


class FoodResponse(Nutrition):
    id: int
    name: str
    serving_size: float
    serving_size_unit: str


class UpdateFoodRequest(BaseModel):
    id: int
    name: Optional[str] = None
    state: Optional[FoodState] = None
    serving_size: Optional[float] = None
    serving_size_unit: Optional[str] = None
    calories: Optional[int] = None
    fat: Optional[int] = None
    protein: Optional[int] = None
    carbohydrates: Optional[int] = None


# Add inventory
class AddInventoryRequest(Nutrition):
    state: Optional[FoodState] = FoodState.PLANNED
    food_id: int


# Update food in inventory
class UpdateInventoryRequest(Nutrition):
    food_id: int
    state: FoodState
    quantity: float


class UpdateRecipeRequest(BaseModel):
    id: int
    name: Optional[str] = None
    ingredients: Optional[list[IngredientResponse]] = None
    override_nutrition: Optional[bool] = None
    calories: Optional[int] = None
    fat: Optional[int] = None
    protein: Optional[int] = None
    carbohydrates: Optional[int] = None
