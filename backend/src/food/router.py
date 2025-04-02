import re
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.food import service
from src.food.database import get_db_session
from src.food.models import CreateRecipeRequest, CreateRecipeResponse


router = APIRouter()


@router.post("/recipe", response_model=CreateRecipeResponse)
def create_recipe(
    request: CreateRecipeRequest, db_session: Session = Depends(get_db_session)
) -> Optional[CreateRecipeResponse]:
    return service.create_recipe(db_session=db_session, request=request)
