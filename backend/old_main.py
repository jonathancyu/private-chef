from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Any, Generator, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, date

from models import (
    CookedMeal,
    CookedMealCreate,
    CookedMealInDB,
    EatenMeal,
    EatenMealCreate,
    EatenMealInDB,
    EatenOut,
    EatenOutCreate,
    EatenOutInDB,
    Ingredient,
    IngredientCreate,
    IngredientInDB,
    Inventory,
    InventoryItemCreate,
    InventoryItemInDB,
    MealType,
    PlannedMeal,
    PlannedMealCreate,
    PlannedMealInDB,
    Recipe,
    RecipeCreate,
    RecipeInDB,
    RecipeIngredient,
    SessionLocal,
    Snack,
    SnackCreate,
    SnackInDB,
)


# Dependency to get the database session
def get_db() -> Generator[Session, Any, Any]:
    """
    Dependency to get a database session.

    Yields:
        Session: The SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Define database models
# FastAPI application
app = FastAPI(title="Grocery, Meal Planning, and Calorie Tracking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Ingredient endpoints
@app.post("/ingredients/", response_model=IngredientInDB)
def create_ingredient(
    ingredient: IngredientCreate, db: Session = Depends(get_db)
) -> IngredientInDB:
    """
    Create a new ingredient.

    Parameters:
        ingredient: IngredientCreate - The ingredient data
        db: Session - Database session dependency

    Returns:
        IngredientInDB - The created ingredient
    """
    db_ingredient = Ingredient(**ingredient.dict())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


@app.get("/ingredients/", response_model=List[IngredientInDB])
def get_ingredients(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[IngredientInDB]:
    """
    Get all ingredients.

    Parameters:
        skip: int - Number of ingredients to skip
        limit: int - Maximum number of ingredients to return
        db: Session - Database session dependency

    Returns:
        List[IngredientInDB] - List of ingredients
    """
    return db.query(Ingredient).offset(skip).limit(limit).all()


# Recipe endpoints
@app.post("/recipes/", response_model=RecipeInDB)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)) -> RecipeInDB:
    """
    Create a new recipe.

    Parameters:
        recipe: RecipeCreate - The recipe data with ingredients
        db: Session - Database session dependency

    Returns:
        RecipeInDB - The created recipe
    """
    ingredient_data = recipe.ingredients
    recipe_dict = recipe.dict(exclude={"ingredients"})

    db_recipe = Recipe(**recipe_dict)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    for ingredient in ingredient_data:
        db_recipe_ingredient = RecipeIngredient(
            **ingredient.dict(), recipe_id=db_recipe.id
        )
        db.add(db_recipe_ingredient)

    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@app.get("/recipes/", response_model=List[RecipeInDB])
def get_recipes(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[RecipeInDB]:
    """
    Get all recipes.

    Parameters:
        skip: int - Number of recipes to skip
        limit: int - Maximum number of recipes to return
        db: Session - Database session dependency

    Returns:
        List[RecipeInDB] - List of recipes
    """
    return db.query(Recipe).offset(skip).limit(limit).all()


# Snack endpoints
@app.post("/snacks/", response_model=SnackInDB)
def create_snack(snack: SnackCreate, db: Session = Depends(get_db)) -> SnackInDB:
    """
    Create a new snack.

    Parameters:
        snack: SnackCreate - The snack data
        db: Session - Database session dependency

    Returns:
        SnackInDB - The created snack
    """
    db_snack = Snack(**snack.dict())
    db.add(db_snack)
    db.commit()
    db.refresh(db_snack)
    return db_snack


@app.get("/snacks/", response_model=List[SnackInDB])
def get_snacks(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[SnackInDB]:
    """
    Get all snacks.

    Parameters:
        skip: int - Number of snacks to skip
        limit: int - Maximum number of snacks to return
        db: Session - Database session dependency

    Returns:
        List[SnackInDB] - List of snacks
    """
    return db.query(Snack).offset(skip).limit(limit).all()


# Planned meal endpoints
@app.post("/planned-meals/", response_model=PlannedMealInDB)
def create_planned_meal(
    planned_meal: PlannedMealCreate, db: Session = Depends(get_db)
) -> PlannedMealInDB:
    """
    Create a new planned meal.

    Parameters:
        planned_meal: PlannedMealCreate - The planned meal data
        db: Session - Database session dependency

    Returns:
        PlannedMealInDB - The created planned meal
    """
    if not planned_meal.recipe_id and not planned_meal.snack_id:
        raise HTTPException(
            status_code=400, detail="Either recipe_id or snack_id must be provided"
        )

    db_planned_meal = PlannedMeal(**planned_meal.dict())
    db.add(db_planned_meal)
    db.commit()
    db.refresh(db_planned_meal)
    return db_planned_meal


@app.post("/planned-meals/week/", response_model=List[PlannedMealInDB])
def create_weekly_meal_plan(
    planned_meals: List[PlannedMealCreate], db: Session = Depends(get_db)
) -> List[PlannedMealInDB]:
    """
    Create a week's meal plan.

    Parameters:
        planned_meals: List[PlannedMealCreate] - List of planned meals for the week
        db: Session - Database session dependency

    Returns:
        List[PlannedMealInDB] - List of created planned meals
    """
    db_planned_meals = []

    for meal in planned_meals:
        if not meal.recipe_id and not meal.snack_id:
            raise HTTPException(
                status_code=400, detail="Either recipe_id or snack_id must be provided"
            )

        db_planned_meal = PlannedMeal(**meal.dict())
        db.add(db_planned_meal)
        db_planned_meals.append(db_planned_meal)

    db.commit()

    for meal in db_planned_meals:
        db.refresh(meal)

    return db_planned_meals


@app.get("/planned-meals/", response_model=List[PlannedMealInDB])
def get_planned_meals(
    start_date: date = Query(..., description="Start date for meal plan"),
    end_date: date = Query(..., description="End date for meal plan"),
    db: Session = Depends(get_db),
) -> List[PlannedMealInDB]:
    """
    Get planned meals for a date range.

    Parameters:
        start_date: date - Start date for meal plan
        end_date: date - End date for meal plan
        db: Session - Database session dependency

    Returns:
        List[PlannedMealInDB] - List of planned meals
    """
    return (
        db.query(PlannedMeal)
        .filter(PlannedMeal.date >= start_date, PlannedMeal.date <= end_date)
        .all()
    )


@app.delete("/planned-meals/{meal_id}/", response_model=PlannedMealInDB)
def delete_planned_meal(meal_id: int, db: Session = Depends(get_db)) -> PlannedMealInDB:
    """
    Delete a planned meal.

    Parameters:
        meal_id: int - ID of the planned meal to delete
        db: Session - Database session dependency

    Returns:
        PlannedMealInDB - The deleted planned meal

    Raises:
        HTTPException: If the planned meal is not found
    """
    db_planned_meal = db.query(PlannedMeal).filter(PlannedMeal.id == meal_id).first()
    if not db_planned_meal:
        raise HTTPException(status_code=404, detail="Planned meal not found")
    
    db.delete(db_planned_meal)
    db.commit()
    return db_planned_meal


# Add this new Pydantic model for updates
class PlannedMealUpdate(BaseModel):
    """Model for planned meal updates"""
    servings: Optional[float] = None


# Add this new endpoint after the delete_planned_meal endpoint
@app.patch("/planned-meals/{meal_id}/", response_model=PlannedMealInDB)
def update_planned_meal(
    meal_id: int,
    updates: PlannedMealUpdate,
    db: Session = Depends(get_db)
) -> PlannedMealInDB:
    """
    Update a planned meal.

    Parameters:
        meal_id: int - ID of the planned meal to update
        updates: PlannedMealUpdate - The updates to apply
        db: Session - Database session dependency

    Returns:
        PlannedMealInDB - The updated planned meal

    Raises:
        HTTPException: If the planned meal is not found
    """
    db_planned_meal = db.query(PlannedMeal).filter(PlannedMeal.id == meal_id).first()
    if not db_planned_meal:
        raise HTTPException(status_code=404, detail="Planned meal not found")
    
    # Update only the provided fields
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(db_planned_meal, field, value)
    
    db.commit()
    db.refresh(db_planned_meal)
    return db_planned_meal


# Inventory endpoints
@app.post("/inventory/", response_model=InventoryItemInDB)
def add_to_inventory(
    inventory_item: InventoryItemCreate, db: Session = Depends(get_db)
) -> InventoryItemInDB:
    """
    Add an item to inventory.

    Parameters:
        inventory_item: InventoryItemCreate - The inventory item data
        db: Session - Database session dependency

    Returns:
        InventoryItemInDB - The created inventory item
    """
    # Check if ingredient exists
    ingredient = (
        db.query(Ingredient)
        .filter(Ingredient.id == inventory_item.ingredient_id)
        .first()
    )
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    # Check if there's an existing inventory entry for this ingredient
    existing_inventory = (
        db.query(Inventory)
        .filter(Inventory.ingredient_id == inventory_item.ingredient_id)
        .first()
    )

    if existing_inventory:
        # Update existing inventory
        existing_inventory.amount += inventory_item.amount
        db.commit()
        db.refresh(existing_inventory)
        return existing_inventory
    else:
        # Create new inventory entry
        db_inventory_item = Inventory(**inventory_item.dict())
        db.add(db_inventory_item)
        db.commit()
        db.refresh(db_inventory_item)
        return db_inventory_item


@app.get("/inventory/", response_model=List[InventoryItemInDB])
def get_inventory(db: Session = Depends(get_db)) -> List[InventoryItemInDB]:
    """
    Get the current inventory.

    Parameters:
        db: Session - Database session dependency

    Returns:
        List[InventoryItemInDB] - List of inventory items
    """
    return db.query(Inventory).join(Ingredient).all()


# Cooked meal endpoints
@app.post("/cooked-meals/", response_model=CookedMealInDB)
def create_cooked_meal(
    cooked_meal: CookedMealCreate, db: Session = Depends(get_db)
) -> CookedMealInDB:
    """
    Record a cooked meal and update inventory.

    Parameters:
        cooked_meal: CookedMealCreate - The cooked meal data
        db: Session - Database session dependency

    Returns:
        CookedMealInDB - The created cooked meal
    """
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == cooked_meal.recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Get recipe ingredients
    recipe_ingredients = (
        db.query(RecipeIngredient)
        .filter(RecipeIngredient.recipe_id == cooked_meal.recipe_id)
        .all()
    )

    # Check and update inventory
    for recipe_ingredient in recipe_ingredients:
        ingredient_id = recipe_ingredient.ingredient_id
        required_amount = recipe_ingredient.amount * (
            cooked_meal.servings_remaining / recipe.servings
        )

        inventory_item = (
            db.query(Inventory).filter(Inventory.ingredient_id == ingredient_id).first()
        )

        if not inventory_item or inventory_item.amount < required_amount:
            ingredient = (
                db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
            )
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient {ingredient.name} in inventory. Need {required_amount} {ingredient.unit}",
            )

        # Update inventory
        inventory_item.amount -= required_amount
        if inventory_item.amount <= 0:
            db.delete(inventory_item)
        else:
            db.add(inventory_item)

    # Create cooked meal
    db_cooked_meal = CookedMeal(**cooked_meal.dict())
    db.add(db_cooked_meal)
    db.commit()
    db.refresh(db_cooked_meal)
    return db_cooked_meal


# Eaten out endpoints
@app.post("/eaten-out/", response_model=EatenOutInDB)
def record_eaten_out(
    eaten_out: EatenOutCreate, db: Session = Depends(get_db)
) -> EatenOutInDB:
    """
    Record a meal eaten at a restaurant.

    Parameters:
        eaten_out: EatenOutCreate - The eaten out meal data
        db: Session - Database session dependency

    Returns:
        EatenOutInDB - The created eaten out record
    """
    db_eaten_out = EatenOut(**eaten_out.dict())
    db.add(db_eaten_out)
    db.commit()
    db.refresh(db_eaten_out)
    return db_eaten_out


# Eaten meal endpoints
@app.post("/eaten-meals/", response_model=EatenMealInDB)
def record_eaten_meal(
    eaten_meal: EatenMealCreate, db: Session = Depends(get_db)
) -> EatenMealInDB:
    """
    Record an eaten meal (cooked meal, snack, or eaten out).

    Parameters:
        eaten_meal: EatenMealCreate - The eaten meal data
        db: Session - Database session dependency

    Returns:
        EatenMealInDB - The created eaten meal record
    """
    # Check if at least one meal source is provided
    if not any(
        [eaten_meal.cooked_meal_id, eaten_meal.snack_id, eaten_meal.eaten_out_id]
    ):
        raise HTTPException(
            status_code=400,
            detail="One of cooked_meal_id, snack_id, or eaten_out_id must be provided",
        )

    # If cooked meal, check and update servings remaining
    if eaten_meal.cooked_meal_id:
        cooked_meal = (
            db.query(CookedMeal)
            .filter(CookedMeal.id == eaten_meal.cooked_meal_id)
            .first()
        )
        if not cooked_meal:
            raise HTTPException(status_code=404, detail="Cooked meal not found")

        if cooked_meal.servings_remaining < eaten_meal.servings:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient servings remaining. Only {cooked_meal.servings_remaining} available",
            )

        cooked_meal.servings_remaining -= eaten_meal.servings
        if cooked_meal.servings_remaining <= 0:
            db.delete(cooked_meal)
        else:
            db.add(cooked_meal)

    # If eaten out, check and update servings remaining
    if eaten_meal.eaten_out_id:
        eaten_out = (
            db.query(EatenOut).filter(EatenOut.id == eaten_meal.eaten_out_id).first()
        )
        if not eaten_out:
            raise HTTPException(status_code=404, detail="Eaten out meal not found")

        if eaten_out.servings_remaining < eaten_meal.servings:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient servings remaining. Only {eaten_out.servings_remaining} available",
            )

        eaten_out.servings_remaining -= eaten_meal.servings
        if eaten_out.servings_remaining <= 0:
            db.delete(eaten_out)
        else:
            db.add(eaten_out)

    # Create eaten meal record
    db_eaten_meal = EatenMeal(**eaten_meal.dict())
    db.add(db_eaten_meal)
    db.commit()
    db.refresh(db_eaten_meal)
    return db_eaten_meal


# Define Pydantic models for meal information
class MealInfo(BaseModel):
    """Model for individual meal information"""

    type: str
    name: str
    servings: float
    calories: int
    protein: float
    carbs: float
    fat: float


class MealsByType(BaseModel):
    """Model for meals organized by meal type"""

    breakfast: List[MealInfo] = Field(default_factory=list)
    lunch: List[MealInfo] = Field(default_factory=list)
    dinner: List[MealInfo] = Field(default_factory=list)
    snack: List[MealInfo] = Field(default_factory=list)


class MacrosSummary(BaseModel):
    """Model for daily macros summary"""

    date: date
    calories: int
    protein: float
    carbs: float
    fat: float
    meals: MealsByType


@app.get("/macros/daily/", response_model=MacrosSummary)
def get_daily_macros(
    day: date = Query(..., description="Date to get macros for"),
    db: Session = Depends(get_db),
) -> MacrosSummary:
    """
    Get macronutrient summary for a specific day.

    Parameters:
        day: date - Date to get macros for
        db: Session - Database session dependency

    Returns:
        MacrosSummary - Summary of macros for the day
    """
    # Get all eaten meals for the day
    start_datetime = datetime.combine(day, datetime.min.time())
    end_datetime = datetime.combine(day, datetime.max.time())

    eaten_meals = (
        db.query(EatenMeal)
        .filter(EatenMeal.date >= start_datetime, EatenMeal.date <= end_datetime)
        .all()
    )

    # Initialize result with Pydantic models
    meals_by_type = MealsByType()
    total_calories = 0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0

    # Calculate macros for each meal
    for eaten_meal in eaten_meals:
        meal_type = ""
        meal_name = ""
        calories = 0
        protein = 0.0
        carbs = 0.0
        fat = 0.0

        # Cooked meal
        if eaten_meal.cooked_meal_id:
            cooked_meal = (
                db.query(CookedMeal)
                .filter(CookedMeal.id == eaten_meal.cooked_meal_id)
                .first()
            )
            recipe = db.query(Recipe).filter(Recipe.id == cooked_meal.recipe_id).first()

            calories = recipe.calories_per_serving * eaten_meal.servings
            protein = recipe.protein_per_serving * eaten_meal.servings
            carbs = recipe.carbs_per_serving * eaten_meal.servings
            fat = recipe.fat_per_serving * eaten_meal.servings

            meal_type = "cooked_meal"
            meal_name = recipe.name

        # Snack
        elif eaten_meal.snack_id:
            snack = db.query(Snack).filter(Snack.id == eaten_meal.snack_id).first()

            calories = snack.calories_per_serving * eaten_meal.servings
            protein = snack.protein_per_serving * eaten_meal.servings
            carbs = snack.carbs_per_serving * eaten_meal.servings
            fat = snack.fat_per_serving * eaten_meal.servings

            meal_type = "snack"
            meal_name = snack.name

        # Eaten out
        elif eaten_meal.eaten_out_id:
            eaten_out = (
                db.query(EatenOut)
                .filter(EatenOut.id == eaten_meal.eaten_out_id)
                .first()
            )

            # Calculate proportion of total calories based on servings
            proportion = eaten_meal.servings / eaten_out.servings_total
            calories = eaten_out.calories * proportion
            protein = eaten_out.protein * proportion
            carbs = eaten_out.carbs * proportion
            fat = eaten_out.fat * proportion

            meal_type = "eaten_out"
            meal_name = f"{eaten_out.restaurant} - {eaten_out.meal_name}"

        # Create meal info object
        meal_info = MealInfo(
            type=meal_type,
            name=meal_name,
            servings=eaten_meal.servings,
            calories=int(calories),
            protein=protein,
            carbs=carbs,
            fat=fat,
        )

        # Add to appropriate meal type
        if eaten_meal.meal_type == MealType.BREAKFAST:
            meals_by_type.breakfast.append(meal_info)
        elif eaten_meal.meal_type == MealType.LUNCH:
            meals_by_type.lunch.append(meal_info)
        elif eaten_meal.meal_type == MealType.DINNER:
            meals_by_type.dinner.append(meal_info)
        elif eaten_meal.meal_type == MealType.SNACK:
            meals_by_type.snack.append(meal_info)

        # Update totals
        total_calories += calories
        total_protein += protein
        total_carbs += carbs
        total_fat += fat

    # Create and return the MacrosSummary object
    return MacrosSummary(
        date=day,
        calories=int(total_calories),
        protein=total_protein,
        carbs=total_carbs,
        fat=total_fat,
        meals=meals_by_type,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
