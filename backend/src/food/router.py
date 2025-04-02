import re
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.food import service
from src.food.database import get_db_session
from src.food.models import (
    CreateFoodRequest,
    CreateFoodResponse,
    CreateRecipeRequest,
    RecipeResponse,
)


router = APIRouter()


@router.post("/food", response_model=CreateFoodResponse)
def create_food_route(
    request: CreateFoodRequest, db_session: Session = Depends(get_db_session)
) -> Optional[CreateFoodResponse]:
    return service.create_food(db_session=db_session, request=request)


@router.post("/recipe", response_model=RecipeResponse)
def create_recipe(
    request: CreateRecipeRequest, db_session: Session = Depends(get_db_session)
) -> Optional[RecipeResponse]:
    return service.create_recipe(db_session=db_session, request=request)
