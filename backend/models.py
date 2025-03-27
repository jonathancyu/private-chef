import enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime, date

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
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
# Database setup
SQLALCHEMY_DATABASE_URL: str = "sqlite:///./grocery_app.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


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
    ingredients: list[RecipeIngredientCreate]


class RecipeCreate(RecipeBase):
    """Model for recipe creation requests"""

    pass


class RecipeInDB(RecipeBase):
    """Model for recipe responses"""

    id: int
    ingredients: list[RecipeIngredientInDB]

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
