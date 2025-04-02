from typing import Optional

from sqlalchemy.orm import Session, joinedload
from src.food.database import Food, Recipe, RecipeIngredient
from src.food.models import (
    CreateFoodRequest,
    CreateFoodResponse,
    IngredientResponse,
    Nutrition,
    CreateRecipeRequest,
    RecipeResponse,
)


def get_nutrition(db_session: Session, recipe: Recipe) -> Nutrition:
    """Look up recipe. If override_nutrition is present, return that. Otherwise, calculate nutrition."""
    if recipe.override_nutrition:
        pass
    food = recipe.food
    return Nutrition(
        calories=food.calories,
        fat=food.fat,
        protein=food.protein,
        carbohydrates=food.carbohydrates,
    )


def get_food(db_session: Session, id: int) -> Optional[Food]:
    return db_session.query(Food).filter(Food.id == id).first()


def get_recipe_ingredient(db_session: Session, id: int) -> Optional[RecipeIngredient]:
    return (
        db_session.query(RecipeIngredient)
        .filter(RecipeIngredient.id == id)
        .options(joinedload(RecipeIngredient.food))
        .first()
    )


def create_recipe_ingredient(
    db_session: Session, recipe: Recipe, ingredient_data: IngredientResponse
) -> Optional[RecipeIngredient]:
    food = get_food(db_session, ingredient_data.food_id)
    if food is None:
        # Create a new Food item
        food = Food(
            name=ingredient_data.name,
            serving_size=1.0,  # Default
            serving_size_unit=ingredient_data.unit,
            calories=ingredient_data.calories,
            fat=ingredient_data.fat,
            protein=ingredient_data.protein,
            carbohydrates=ingredient_data.carbohydrates,
        )
        db_session.add(food)
        db_session.flush()  # Get the ID without committing

    # Create the recipe ingredient
    recipe_ingredient = RecipeIngredient(
        recipe=recipe,
        food=food,
        name=ingredient_data.name,
        quantity=ingredient_data.quantity,
        unit=ingredient_data.unit,
    )

    db_session.add(recipe_ingredient)
    db_session.commit()
    db_session.refresh(recipe_ingredient)

    return recipe_ingredient


def create_food(
    db_session: Session, request: CreateFoodRequest
) -> Optional[CreateFoodResponse]:
    food = Food(
        name=request.name,
        source_recipe=None,
        serving_size=request.serving_size,
        serving_size_unit=request.serving_size_unit,
        calories=request.calories,
        fat=request.fat,
        protein=request.protein,
        carbohydrates=request.carbohydrates,
    )

    db_session.add(food)
    db_session.commit()
    db_session.refresh(food)

    # Return the response
    return CreateFoodResponse(
        id=food.id,
        calories=food.calories,
        fat=food.fat,
        protein=food.protein,
        carbohydrates=food.carbohydrates,
    )


def create_recipe(
    db_session: Session, request: CreateRecipeRequest
) -> Optional[RecipeResponse]:
    # Create the Recipe first
    recipe = Recipe(override_nutrition=request.override_nutrition)
    db_session.add(recipe)
    db_session.flush()  # Get the ID without committing

    # Create the Food object for this recipe
    food = Food(
        name=request.name if hasattr(request, "name") else "New Recipe",
        source_recipe_id=recipe.id,
        serving_size=1.0,  # Default serving size
        serving_size_unit="serving",
        calories=request.calories,
        fat=request.fat,
        protein=request.protein,
        carbohydrates=request.carbohydrates,
    )
    db_session.add(food)

    # Create recipe ingredients
    ingredients = []
    for ingredient_data in request.ingredients:
        ingredient = create_recipe_ingredient(
            db_session=db_session, recipe=recipe, ingredient_data=ingredient_data
        )
        assert ingredient is not None

        # Create the recipe ingredient relationship
        recipe_ingredient = RecipeIngredient(
            recipe_id=recipe.id,
            food_id=ingredient.id,
            name=ingredient_data.name,
            quantity=ingredient_data.quantity,
            unit=ingredient_data.unit,
        )
        db_session.add(recipe_ingredient)
        food = recipe.food
        ingredients.append(
            IngredientResponse(
                food_id=ingredient.id,
                name=ingredient_data.name,
                note=ingredient_data.note,
                quantity=ingredient_data.quantity,
                unit=ingredient_data.unit,
                calories=food.calories,
                fat=food.fat,
                protein=food.protein,
                carbohydrates=food.carbohydrates,
            )
        )

    db_session.commit()
    db_session.refresh(recipe)

    nutrition = get_nutrition(db_session=db_session, recipe=recipe)

    return RecipeResponse(
        id=recipe.id,
        ingredients=ingredients,
        calories=nutrition.calories,
        fat=nutrition.fat,
        protein=nutrition.protein,
        carbohydrates=nutrition.carbohydrates,
    )
