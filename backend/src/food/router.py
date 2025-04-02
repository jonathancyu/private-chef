import re
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.food import service
from src.food.database import Recipe, RecipeIngredient, get_db_session
from src.food.models import (
    CreateFoodRequest,
    FoodResponse,
    CreateRecipeRequest,
    IngredientResponse,
    RecipeResponse,
    UpdateFoodRequest,
    UpdateRecipeRequest,
)


router = APIRouter()


@router.post("/food", response_model=FoodResponse)
def create_food_route(
    request: CreateFoodRequest, db_session: Session = Depends(get_db_session)
) -> Optional[FoodResponse]:
    return service.create_food(db_session=db_session, request=request)


@router.put("/food/{food_id}", response_model=FoodResponse)
def update_food_route(
    food_id: int,
    request: UpdateFoodRequest,
    db_session: Session = Depends(get_db_session),
) -> Optional[FoodResponse]:
    # Ensure the ID in the path matches the ID in the request
    request.id = food_id
    food = service.update_food(db_session=db_session, request=request)

    if not food:
        return None

    # Convert the Food model to FoodResponse
    return FoodResponse(
        id=food.id,
        name=food.name,
        serving_size=food.serving_size,
        serving_size_unit=food.serving_size_unit,
        calories=food.calories,
        fat=food.fat,
        protein=food.protein,
        carbohydrates=food.carbohydrates,
    )


@router.post("/recipe", response_model=RecipeResponse)
def create_recipe(
    request: CreateRecipeRequest, db_session: Session = Depends(get_db_session)
) -> Optional[RecipeResponse]:
    return service.create_recipe(db_session=db_session, request=request)


@router.put("/recipe/{recipe_id}", response_model=RecipeResponse)
def update_recipe_route(
    recipe_id: int,
    request: UpdateRecipeRequest,
    db_session: Session = Depends(get_db_session),
) -> Optional[RecipeResponse]:
    # Ensure the ID in the path matches the ID in the request
    request.id = recipe_id
    recipe = service.update_recipe(db_session=db_session, request=request)
    if recipe is None:
        return None
    # Convert the Recipe model to RecipeResponse
    nutrition = service.get_nutrition(db_session, recipe)
    ingredients = [
        IngredientResponse(
            food_id=i.food_id,
            name=i.name,
            note=i.note,
            quantity=i.quantity,
            unit=i.unit,
            calories=i.food.calories,
            fat=i.food.fat,
            protein=i.food.protein,
            carbohydrates=i.food.carbohydrates,
        )
        for i in recipe.ingredients
    ]
    return RecipeResponse(
        id=recipe.id,
        name=recipe.name,
        ingredients=ingredients,
        calories=nutrition.calories,
        fat=nutrition.fat,
        protein=nutrition.protein,
        carbohydrates=nutrition.carbohydrates,
    )
