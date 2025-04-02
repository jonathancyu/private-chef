from typing import Optional

from sqlalchemy.orm import Session
from src.food.database import Recipe
from src.food.models import (
    Nutrition,
    CreateRecipeRequest,
    CreateRecipeResponse,
)


def get_nutrition(*, db_session: Session, recipe: Recipe) -> Nutrition:
    """Look up recipe. If override_nutrition is present, return that. Otherwise, calculate nutrition."""
    if recipe.override_nutrition:
        pass
    return Nutrition(
        calories=recipe.calories,
        fat=recipe.fat,
        protein=recipe.protein,
        carbohydrates=recipe.carbohydrates,
    )


def create_recipe(
    *, db_session: Session, request: CreateRecipeRequest
) -> Optional[CreateRecipeResponse]:
    recipe = Recipe(**request.model_dump())
    db_session.add(recipe)
    db_session.refresh(recipe)
    db_session.commit()

    nutrition = get_nutrition(db_session=db_session, recipe=recipe)

    return CreateRecipeResponse(
        id=recipe.id,
        calories=nutrition.calories,
        fat=nutrition.fat,
        protein=nutrition.protein,
        carbohydrates=nutrition.carbohydrates,
    )
