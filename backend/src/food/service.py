from typing import Optional, List
import logging

from sqlalchemy.orm import Session, joinedload
from src.food.database import (
    Food,
    Recipe,
    RecipeIngredient,
    RecipeInstruction,
    PlannedFood,
)
from src.food.models import (
    CreateFoodRequest,
    FoodResponse,
    IngredientRequest,
    Nutrition,
    CreateRecipeRequest,
    UpdateFoodRequest,
    UpdateRecipeRequest,
    CreatePlannedFoodRequest,
    UpdatePlannedFoodRequest,
)
import datetime as dt

logger = logging.getLogger(__name__)


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
    db_session: Session, recipe: Recipe, ingredient_data: IngredientRequest
) -> Optional[RecipeIngredient]:
    food = get_food(db_session, ingredient_data.food_id)
    assert food is not None, f"Food with ID {ingredient_data.food_id} not found."

    # Create the recipe ingredient
    recipe_ingredient = RecipeIngredient(
        recipe=recipe,
        food=food,
        quantity=ingredient_data.quantity,
        unit=ingredient_data.unit,
    )

    db_session.add(recipe_ingredient)
    db_session.commit()
    db_session.refresh(recipe_ingredient)

    return recipe_ingredient


def create_food(
    db_session: Session, request: CreateFoodRequest
) -> Optional[FoodResponse]:
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
    return FoodResponse(
        id=food.id,
        name=food.name,
        calories=food.calories,
        serving_size=food.serving_size,
        serving_size_unit=food.serving_size_unit,
        fat=food.fat,
        protein=food.protein,
        carbohydrates=food.carbohydrates,
    )


def create_recipe(db_session: Session, request: CreateRecipeRequest) -> Recipe:
    # Create the Recipe first
    recipe = Recipe(name=request.name, override_nutrition=request.override_nutrition)
    db_session.add(recipe)
    db_session.flush()  # Get the ID without committing

    # Create the Food object for this recipe
    food = Food(
        name=request.name,
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
    for ingredient_data in request.ingredients:
        ingredient = create_recipe_ingredient(
            db_session=db_session, recipe=recipe, ingredient_data=ingredient_data
        )
        assert ingredient is not None
        recipe.ingredients.append(ingredient)

    db_session.commit()
    db_session.refresh(recipe)

    return recipe


def update_food(db_session: Session, request: UpdateFoodRequest) -> Optional[Food]:
    # Find the food by ID
    food = db_session.query(Food).filter(Food.id == request.id).first()
    if not food:
        return None

    # Update each field if provided in the request
    if request.name is not None:
        food.name = request.name
    if request.serving_size is not None:
        food.serving_size = request.serving_size
    if request.serving_size_unit is not None:
        food.serving_size_unit = request.serving_size_unit
    if request.calories is not None:
        food.calories = request.calories
    if request.fat is not None:
        food.fat = request.fat
    if request.protein is not None:
        food.protein = request.protein
    if request.carbohydrates is not None:
        food.carbohydrates = request.carbohydrates

    # Commit changes to the database
    db_session.commit()
    db_session.refresh(food)

    return food


def update_recipe(
    db_session: Session, request: UpdateRecipeRequest
) -> Optional[Recipe]:
    # Find the recipe by ID
    recipe = db_session.query(Recipe).filter(Recipe.id == request.id).first()
    if not recipe:
        return None

    # Update basic fields if provided
    if request.name is not None:
        recipe.name = request.name
    if request.override_nutrition is not None:
        recipe.override_nutrition = request.override_nutrition

    # Update nutrition fields if provided
    food = recipe.food
    if request.calories is not None:
        food.calories = request.calories
    if request.fat is not None:
        food.fat = request.fat
    if request.protein is not None:
        food.protein = request.protein
    if request.carbohydrates is not None:
        food.carbohydrates = request.carbohydrates

    # Update ingredients if provided
    if request.ingredients is not None:
        # First, remove existing ingredients
        db_session.query(RecipeIngredient).filter(
            RecipeIngredient.recipe_id == recipe.id
        ).delete()

        # Then add the new ingredients
        for ingredient_data in request.ingredients:
            food = (
                db_session.query(Food)
                .filter(Food.id == ingredient_data.food_id)
                .first()
            )
            assert (
                food is not None
            ), f"Food with ID {ingredient_data.food_id} not found."
            recipe_ingredient = RecipeIngredient(
                recipe_id=recipe.id,
                food_id=food.id,
                quantity=ingredient_data.quantity,
                unit=ingredient_data.unit,
                note=ingredient_data.note,
            )
            recipe.ingredients.append(recipe_ingredient)

    # Update instructions if provided
    if request.instructions is not None:
        # First, remove existing instructions
        db_session.query(RecipeInstruction).filter(
            RecipeInstruction.recipe_id == recipe.id
        ).delete()

        # Then add the new instructions
        for instruction_data in request.instructions:
            recipe_instruction = RecipeInstruction(
                recipe_id=recipe.id,
                step=instruction_data.step,
                text=instruction_data.text,
            )
            recipe.instructions.append(recipe_instruction)

    # Commit changes to the database
    db_session.commit()
    db_session.refresh(recipe)

    return recipe


def get_recipes(db_session: Session) -> List[Recipe]:
    """Get all recipes with their ingredients and food data."""
    return (
        db_session.query(Recipe)
        .options(
            joinedload(Recipe.food),
            joinedload(Recipe.ingredients).joinedload(RecipeIngredient.food),
        )
        .all()
    )


def delete_recipe(db_session: Session, recipe_id: int) -> bool:
    """Delete a recipe by ID."""
    recipe = db_session.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        return False

    # Delete the recipe and its ingredients
    db_session.delete(recipe)
    db_session.commit()
    return True


def get_foods(db_session: Session) -> List[Food]:
    """Get all foods."""
    return db_session.query(Food).all()


#
# Planned Food
def get_planned_foods(
    db_session: Session,
    start_date: dt.date,
    end_date: dt.date,
) -> List["PlannedFood"]:
    query = db_session.query(PlannedFood).options(
        joinedload(PlannedFood.food).joinedload(Food.source_recipe),
    )

    # Apply date range filters (both are required)
    query = query.filter(PlannedFood.date >= start_date)
    query = query.filter(PlannedFood.date <= end_date)

    return query.order_by(PlannedFood.date, PlannedFood.meal).all()


def create_planned_food(
    db_session: Session, request: "CreatePlannedFoodRequest"
) -> "PlannedFood":
    """Create a new planned food entry.

    Args:
        db_session: Database session
        request: Create planned food request

    Returns:
        Created PlannedFood object
    """

    food = get_food(db_session=db_session, id=request.food_id)
    assert food is not None, f"Food with ID {request.food_id} not found."
    planned_food = PlannedFood(
        date=request.date,
        meal=request.meal,
        servings=request.servings,
        food=food,
        eaten=request.eaten,
    )

    db_session.add(planned_food)
    db_session.commit()
    db_session.refresh(planned_food)

    return planned_food


def update_planned_food(
    db_session: Session, request: "UpdatePlannedFoodRequest"
) -> Optional["PlannedFood"]:
    """Update an existing planned food entry.

    Args:
        db_session: Database session
        request: Update planned food request

    Returns:
        Updated PlannedFood object or None if not found
    """
    planned_food = (
        db_session.query(PlannedFood).filter(PlannedFood.id == request.id).first()
    )
    if not planned_food:
        return None

    # Update fields if provided
    if request.date is not None:
        planned_food.date = request.date
    if request.meal is not None:
        planned_food.meal = request.meal
    if request.servings is not None:
        planned_food.servings = request.servings
    if request.eaten is not None:
        planned_food.eaten = request.eaten

    # Update food or recipe reference if provided
    if request.food_id is not None:
        food = get_food(db_session, request.food_id)
        assert food is not None, f"Food with ID {request.food_id} not found."
        planned_food.food_id = request.food_id

    db_session.commit()
    db_session.refresh(planned_food)

    return planned_food


def delete_planned_food(db_session: Session, planned_food_id: int) -> bool:
    """Delete a planned food entry by ID.

    Args:
        db_session: Database session
        planned_food_id: ID of the planned food to delete

    Returns:
        True if deleted successfully, False if not found
    """
    planned_food = (
        db_session.query(PlannedFood).filter(PlannedFood.id == planned_food_id).first()
    )
    if not planned_food:
        return False

    db_session.delete(planned_food)
    db_session.commit()
    return True


# Planned Food
