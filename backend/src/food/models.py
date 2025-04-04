from typing import Optional
from pydantic import BaseModel, ConfigDict

from src.food.constants import FoodState, MealType
import datetime as dt


# Pydantic models
class BaseResponse(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)


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


class InstructionRequest(BaseModel):
    step: int
    text: str


class CreateRecipeRequest(Nutrition):
    name: str
    ingredients: list[IngredientRequest]
    instructions: list[InstructionRequest]
    override_nutrition: bool


class FoodResponse(Nutrition):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: int
    name: str
    source_recipe_id: Optional[int] = None
    serving_size: float
    serving_size_unit: str


class IngredientResponse(BaseResponse):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    food: FoodResponse
    note: Optional[str] = None
    quantity: float
    unit: str


class InstructionResponse(BaseResponse):
    id: int
    step: int
    text: str


class RecipeResponse(BaseResponse):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    food: FoodResponse
    id: int
    name: str
    ingredients: list[IngredientResponse]
    instructions: list[InstructionResponse]


# Add food to database
class CreateFoodRequest(Nutrition):
    name: str
    serving_size: float
    serving_size_unit: str
    # TODO: if nutrition not present look up from usda


class UpdateFoodRequest(BaseModel):
    id: int
    name: Optional[str] = None
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
    ingredients: Optional[list[IngredientRequest]] = None
    instructions: Optional[list[InstructionRequest]] = None
    override_nutrition: Optional[bool] = None
    calories: Optional[int] = None
    fat: Optional[int] = None
    protein: Optional[int] = None
    carbohydrates: Optional[int] = None


# Planned Food models
class CreatePlannedFoodRequest(BaseModel):
    date: dt.date
    meal: MealType
    servings: float
    food_id: int
    eaten: bool = False


class UpdatePlannedFoodRequest(BaseModel):
    id: int
    date: Optional[dt.date] = None  # ISO format date (YYYY-MM-DD)
    meal: Optional[MealType] = None
    food_id: Optional[int] = None
    servings: Optional[float] = None
    eaten: Optional[bool] = None


class PlannedFoodResponse(BaseResponse):
    id: int
    date: str
    meal_type: str
    food: FoodResponse
    servings: float
    eaten: bool
