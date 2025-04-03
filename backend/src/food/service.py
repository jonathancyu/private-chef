from typing import Optional, List

from sqlalchemy.orm import Session, joinedload
from src.food.database import Food, Recipe, RecipeIngredient
from src.food.models import (
    CreateFoodRequest,
    FoodResponse,
    IngredientResponse,
    Nutrition,
    CreateRecipeRequest,
    RecipeResponse,
    UpdateFoodRequest,
    UpdateRecipeRequest,
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


def create_recipe(
    db_session: Session, request: CreateRecipeRequest
) -> Optional[RecipeResponse]:
    # Create the Recipe first
    recipe = Recipe(override_nutrition=request.override_nutrition)
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
    ingredients = []
    for ingredient_data in request.ingredients:
        ingredient = create_recipe_ingredient(
            db_session=db_session, recipe=recipe, ingredient_data=ingredient_data
        )
        assert ingredient is not None

        food = recipe.food
        ingredients.append(
            IngredientResponse(
                food_id=ingredient_data.food_id,
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
        name=recipe.name,
        ingredients=ingredients,
        calories=nutrition.calories,
        fat=nutrition.fat,
        protein=nutrition.protein,
        carbohydrates=nutrition.carbohydrates,
    )


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
            if food:
                recipe_ingredient = RecipeIngredient(
                    recipe_id=recipe.id,
                    food_id=food.id,
                    name=ingredient_data.name,
                    quantity=ingredient_data.quantity,
                    unit=ingredient_data.unit,
                    note=ingredient_data.note,
                )
                db_session.add(recipe_ingredient)

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


def get_foods(db_session: Session) -> List[Food]:
    """Get all foods."""
    return db_session.query(Food).all()
