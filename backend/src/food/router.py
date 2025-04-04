from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.food import service
from src.food.database import get_db_session
from src.food.models import (
    CreateFoodRequest,
    FoodResponse,
    CreateRecipeRequest,
    RecipeResponse,
    UpdateFoodRequest,
    UpdateRecipeRequest,
    CreatePlannedFoodRequest,
    UpdatePlannedFoodRequest,
    PlannedFoodResponse,
)
import logging

logger = logging.getLogger(__name__)


router = APIRouter()


@router.get("/foods", response_model=List[FoodResponse])
def get_foods(db_session: Session = Depends(get_db_session)) -> List[FoodResponse]:
    """Get all foods."""
    foods = service.get_foods(db_session=db_session)
    [print(f.__dict__) for f in foods]
    return [FoodResponse.model_validate(food) for food in foods]


@router.post("/foods", response_model=FoodResponse)
def create_food_route(
    request: CreateFoodRequest, db_session: Session = Depends(get_db_session)
) -> Optional[FoodResponse]:
    return service.create_food(db_session=db_session, request=request)


@router.put("/foods/{food_id}", response_model=FoodResponse)
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


@router.post("/recipes", response_model=RecipeResponse)
def create_recipe(
    request: CreateRecipeRequest, db_session: Session = Depends(get_db_session)
) -> Optional[RecipeResponse]:
    return RecipeResponse.model_validate(
        service.create_recipe(db_session=db_session, request=request)
    )


@router.delete("/recipes/{recipe_id}")
def delete_recipe_route(
    recipe_id: int,
    db_session: Session = Depends(get_db_session),
) -> bool:
    return service.delete_recipe(db_session=db_session, recipe_id=recipe_id)


@router.put("/recipes/{recipe_id}", response_model=RecipeResponse)
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

    return RecipeResponse.model_validate(recipe)


@router.get("/recipes", response_model=List[RecipeResponse])
def get_recipes(db_session: Session = Depends(get_db_session)) -> List[RecipeResponse]:
    """Get all recipes."""
    recipes = service.get_recipes(db_session=db_session)
    return [RecipeResponse.model_validate(recipe) for recipe in recipes]


# Planned Foods endpoints
@router.get("/planned-foods", response_model=List[PlannedFoodResponse])
def get_planned_foods(
    date: Optional[str] = None, db_session: Session = Depends(get_db_session)
) -> List[PlannedFoodResponse]:
    """Get planned foods, optionally filtered by date."""
    planned_foods = service.get_planned_foods(db_session=db_session, date=date)
    return [PlannedFoodResponse.model_validate(pf) for pf in planned_foods]


@router.post("/planned-foods", response_model=PlannedFoodResponse)
def create_planned_food(
    request: CreatePlannedFoodRequest, db_session: Session = Depends(get_db_session)
) -> PlannedFoodResponse:
    """Create a new planned food entry."""
    planned_food = service.create_planned_food(db_session=db_session, request=request)
    return PlannedFoodResponse.model_validate(planned_food)


@router.put("/planned-foods/{planned_food_id}", response_model=PlannedFoodResponse)
def update_planned_food(
    planned_food_id: int,
    request: UpdatePlannedFoodRequest,
    db_session: Session = Depends(get_db_session),
) -> Optional[PlannedFoodResponse]:
    """Update an existing planned food entry."""
    # Ensure the ID in the path matches the ID in the request
    request.id = planned_food_id
    planned_food = service.update_planned_food(db_session=db_session, request=request)

    if not planned_food:
        return None

    return PlannedFoodResponse.model_validate(planned_food)


@router.delete("/planned-foods/{planned_food_id}")
def delete_planned_food(
    planned_food_id: int, db_session: Session = Depends(get_db_session)
) -> bool:
    """Delete a planned food entry."""
    return service.delete_planned_food(
        db_session=db_session, planned_food_id=planned_food_id
    )
