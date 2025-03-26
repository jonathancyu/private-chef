from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Date,
    Text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date
import enum

# Database setup
SQLALCHEMY_DATABASE_URL: str = "sqlite:///./grocery_app.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency to get the database session
def get_db() -> Session:
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
class MealType(str, enum.Enum):
    """Enum for meal types"""

    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class Recipe(Base):
    """Model for recipes"""

    __tablename__ = "recipes"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String, index=True)
    servings: float = Column(Float)
    calories_per_serving: int = Column(Integer)
    protein_per_serving: float = Column(Float)
    carbs_per_serving: float = Column(Float)
    fat_per_serving: float = Column(Float)
    instructions: str = Column(Text)

    ingredients = relationship("RecipeIngredient", back_populates="recipe")
    planned_meals = relationship("PlannedMeal", back_populates="recipe")
    cooked_meals = relationship("CookedMeal", back_populates="recipe")


class Ingredient(Base):
    """Model for ingredients"""

    __tablename__ = "ingredients"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String, index=True)
    calories_per_unit: int = Column(Integer)
    protein_per_unit: float = Column(Float)
    carbs_per_unit: float = Column(Float)
    fat_per_unit: float = Column(Float)
    unit: str = Column(String)  # e.g., grams, ml, pieces

    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")
    inventory = relationship("Inventory", back_populates="ingredient")


class RecipeIngredient(Base):
    """Model for ingredients in recipes with quantities"""

    __tablename__ = "recipe_ingredients"

    id: int = Column(Integer, primary_key=True, index=True)
    recipe_id: int = Column(Integer, ForeignKey("recipes.id"))
    ingredient_id: int = Column(Integer, ForeignKey("ingredients.id"))
    amount: float = Column(Float)

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")


class Snack(Base):
    """Model for snacks (pre-packaged foods)"""

    __tablename__ = "snacks"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String, index=True)
    servings: float = Column(Float)
    calories_per_serving: int = Column(Integer)
    protein_per_serving: float = Column(Float)
    carbs_per_serving: float = Column(Float)
    fat_per_serving: float = Column(Float)

    planned_meals = relationship("PlannedMeal", back_populates="snack")
    eaten_meals = relationship("EatenMeal", back_populates="snack")


class PlannedMeal(Base):
    """Model for planned meals"""

    __tablename__ = "planned_meals"

    id: int = Column(Integer, primary_key=True, index=True)
    date: date = Column(Date)
    meal_type: str = Column(String)  # breakfast, lunch, dinner, snack
    recipe_id: Optional[int] = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    snack_id: Optional[int] = Column(Integer, ForeignKey("snacks.id"), nullable=True)
    servings: float = Column(Float)

    recipe = relationship("Recipe", back_populates="planned_meals")
    snack = relationship("Snack", back_populates="planned_meals")


class Inventory(Base):
    """Model for ingredient inventory"""

    __tablename__ = "inventory"

    id: int = Column(Integer, primary_key=True, index=True)
    ingredient_id: int = Column(Integer, ForeignKey("ingredients.id"))
    amount: float = Column(Float)
    purchase_date: date = Column(Date)

    ingredient = relationship("Ingredient", back_populates="inventory")


class CookedMeal(Base):
    """Model for cooked meals from recipes"""

    __tablename__ = "cooked_meals"

    id: int = Column(Integer, primary_key=True, index=True)
    recipe_id: int = Column(Integer, ForeignKey("recipes.id"))
    date_cooked: datetime = Column(DateTime, default=datetime.utcnow)
    servings_remaining: float = Column(Float)

    recipe = relationship("Recipe", back_populates="cooked_meals")
    eaten_meals = relationship("EatenMeal", back_populates="cooked_meal")


class EatenOut(Base):
    """Model for meals eaten at restaurants"""

    __tablename__ = "eaten_out"

    id: int = Column(Integer, primary_key=True, index=True)
    restaurant: str = Column(String)
    meal_name: str = Column(String)
    calories: int = Column(Integer)
    protein: float = Column(Float)
    carbs: float = Column(Float)
    fat: float = Column(Float)
    date: datetime = Column(DateTime, default=datetime.utcnow)
    servings_total: float = Column(Float, default=1.0)
    servings_remaining: float = Column(Float, default=0.0)

    eaten_meals = relationship("EatenMeal", back_populates="eaten_out")


class EatenMeal(Base):
    """Model for eaten meals"""

    __tablename__ = "eaten_meals"

    id: int = Column(Integer, primary_key=True, index=True)
    date: datetime = Column(DateTime, default=datetime.utcnow)
    meal_type: str = Column(String)  # breakfast, lunch, dinner, snack
    cooked_meal_id: Optional[int] = Column(
        Integer, ForeignKey("cooked_meals.id"), nullable=True
    )
    snack_id: Optional[int] = Column(Integer, ForeignKey("snacks.id"), nullable=True)
    eaten_out_id: Optional[int] = Column(
        Integer, ForeignKey("eaten_out.id"), nullable=True
    )
    servings: float = Column(Float)

    cooked_meal = relationship("CookedMeal", back_populates="eaten_meals")
    snack = relationship("Snack", back_populates="eaten_meals")
    eaten_out = relationship("EatenOut", back_populates="eaten_meals")


# Create tables
Base.metadata.create_all(bind=engine)


# Pydantic models for API requests/responses
class IngredientBase(BaseModel):
    """Base model for ingredient data"""

    name: str
    calories_per_unit: int
    protein_per_unit: float
    carbs_per_unit: float
    fat_per_unit: float
    unit: str


class IngredientCreate(IngredientBase):
    """Model for ingredient creation requests"""

    pass


class IngredientInDB(IngredientBase):
    """Model for ingredient responses"""

    id: int

    class Config:
        orm_mode = True


class RecipeIngredientBase(BaseModel):
    """Base model for recipe ingredient data"""

    ingredient_id: int
    amount: float


class RecipeIngredientCreate(RecipeIngredientBase):
    """Model for recipe ingredient creation requests"""

    pass


class RecipeIngredientInDB(RecipeIngredientBase):
    """Model for recipe ingredient responses"""

    id: int

    class Config:
        orm_mode = True


class RecipeBase(BaseModel):
    """Base model for recipe data"""

    name: str
    servings: float
    calories_per_serving: int
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float
    instructions: str
    ingredients: List[RecipeIngredientCreate]


class RecipeCreate(RecipeBase):
    """Model for recipe creation requests"""

    pass


class RecipeInDB(RecipeBase):
    """Model for recipe responses"""

    id: int
    ingredients: List[RecipeIngredientInDB]

    class Config:
        orm_mode = True


class SnackBase(BaseModel):
    """Base model for snack data"""

    name: str
    servings: float
    calories_per_serving: int
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float


class SnackCreate(SnackBase):
    """Model for snack creation requests"""

    pass


class SnackInDB(SnackBase):
    """Model for snack responses"""

    id: int

    class Config:
        orm_mode = True


class PlannedMealBase(BaseModel):
    """Base model for planned meal data"""

    date: date
    meal_type: MealType
    servings: float
    recipe_id: Optional[int] = None
    snack_id: Optional[int] = None


class PlannedMealCreate(PlannedMealBase):
    """Model for planned meal creation requests"""

    pass


class PlannedMealInDB(PlannedMealBase):
    """Model for planned meal responses"""

    id: int

    class Config:
        orm_mode = True


class InventoryItemBase(BaseModel):
    """Base model for inventory item data"""

    ingredient_id: int
    amount: float
    purchase_date: date


class InventoryItemCreate(InventoryItemBase):
    """Model for inventory item creation requests"""

    pass


class InventoryItemInDB(InventoryItemBase):
    """Model for inventory item responses"""

    id: int
    ingredient: IngredientInDB

    class Config:
        orm_mode = True


class CookedMealBase(BaseModel):
    """Base model for cooked meal data"""

    recipe_id: int
    servings_remaining: float


class CookedMealCreate(CookedMealBase):
    """Model for cooked meal creation requests"""

    pass


class CookedMealInDB(CookedMealBase):
    """Model for cooked meal responses"""

    id: int
    date_cooked: datetime
    recipe: RecipeInDB

    class Config:
        orm_mode = True


class EatenOutBase(BaseModel):
    """Base model for eaten out meal data"""

    restaurant: str
    meal_name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    servings_total: float = 1.0
    servings_remaining: float = 0.0


class EatenOutCreate(EatenOutBase):
    """Model for eaten out meal creation requests"""

    pass


class EatenOutInDB(EatenOutBase):
    """Model for eaten out meal responses"""

    id: int
    date: datetime

    class Config:
        orm_mode = True


class EatenMealBase(BaseModel):
    """Base model for eaten meal data"""

    meal_type: MealType
    servings: float
    cooked_meal_id: Optional[int] = None
    snack_id: Optional[int] = None
    eaten_out_id: Optional[int] = None


class EatenMealCreate(EatenMealBase):
    """Model for eaten meal creation requests"""

    pass


class EatenMealInDB(EatenMealBase):
    """Model for eaten meal responses"""

    id: int
    date: datetime

    class Config:
        orm_mode = True


class MacrosSummary(BaseModel):
    """Model for daily macros summary"""

    date: date
    calories: int
    protein: float
    carbs: float
    fat: float
    meals: Dict[str, List[Dict[str, Any]]]


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

    # Initialize result
    result = {
        "date": day,
        "calories": 0,
        "protein": 0.0,
        "carbs": 0.0,
        "fat": 0.0,
        "meals": {"breakfast": [], "lunch": [], "dinner": [], "snack": []},
    }

    # Calculate macros for each meal
    for eaten_meal in eaten_meals:
        meal_info = {"servings": eaten_meal.servings}
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

            meal_info["type"] = "cooked_meal"
            meal_info["name"] = recipe.name

        # Snack
        elif eaten_meal.snack_id:
            snack = db.query(Snack).filter(Snack.id == eaten_meal.snack_id).first()

            calories = snack.calories_per_serving * eaten_meal.servings
            protein = snack.protein_per_serving * eaten_meal.servings
            carbs = snack.carbs_per_serving * eaten_meal.servings
            fat = snack.fat_per_serving * eaten_meal.servings

            meal_info["type"] = "snack"
            meal_info["name"] = snack.name

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

            meal_info["type"] = "eaten_out"
            meal_info["name"] = f"{eaten_out.restaurant} - {eaten_out.meal_name}"

        # Add macros to meal info
        meal_info["calories"] = calories
        meal_info["protein"] = protein
        meal_info["carbs"] = carbs
        meal_info["fat"] = fat

        # Add to appropriate meal type
        result["meals"][eaten_meal.meal_type].append(meal_info)

        # Update totals
        result["calories"] += calories
        result["protein"] += protein
        result["carbs"] += carbs
        result["fat"] += fat

    return MacrosSummary(**result)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
