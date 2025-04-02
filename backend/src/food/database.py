from typing import Any, Generator, List, Optional
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, Float, String
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)

from src.food.constants import FoodState, MealType
from src.config import settings
from sqlalchemy import create_engine

engine = create_engine(settings.DATABASE_URL)


def get_db_session() -> Generator[Session, Any, Any]:
    db = sessionmaker(autocommit=False, autoflush=False, bind=engine)()
    try:
        yield db
    finally:
        db.close()


class Base(DeclarativeBase):
    pass


# SQLAlchemy models
class Food(Base):
    """
    A (potentially) edible food item.
    This can be a cooked meal, or a snack, or a raw ingredient for a recipe.
    If it is a cooked meal, the recipe field will be present.
    Appears in the inventory box. Can be dragged onto the calendar to be planned.
    """

    __tablename__ = "food"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    source_recipe_id: Mapped[Optional[int]] = mapped_column(ForeignKey("recipe.id"))
    source_recipe: Mapped[Optional["Recipe"]] = relationship(back_populates="food")

    serving_size: Mapped[Float] = mapped_column(Float)
    serving_size_unit: Mapped[str] = mapped_column(String)
    calories: Mapped[int] = mapped_column(Integer)
    fat: Mapped[int] = mapped_column(Integer)
    protein: Mapped[int] = mapped_column(Integer)
    carbohydrates: Mapped[int] = mapped_column(Integer)


class Recipe(Base):
    """
    A recipe for a meal. This is edited via the user's recipe collection
    :param override_nutrition: If this is present, we will not try to calculate the recipe's nutrition.
      instead, we will use nutrition for the
    """

    __tablename__ = "recipe"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food: Mapped[Food] = relationship(back_populates="source_recipe")
    ingredients: Mapped[List["RecipeIngredient"]] = relationship()
    override_nutrition: Mapped[bool] = mapped_column(Boolean)


class RecipeIngredient(Base):
    """Component of a Recipe."""

    __tablename__ = "recipe_ingredient"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("food.id"))
    food: Mapped[Food] = relationship()  # Food containing nutrition for this ingredient
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"))
    recipe: Mapped[Recipe] = relationship(
        back_populates="ingredients"
    )  # Recipe this ingredient is part of

    name: Mapped[str] = mapped_column(String)
    quantity: Mapped[Float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String)


class PlannedFood(Base):
    __tablename__ = "planned_food"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    meal: Mapped[MealType] = mapped_column(Enum(MealType))
    food_id: Mapped[int] = mapped_column(ForeignKey("food.id"))
    food: Mapped[Food] = relationship()


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    state: Mapped[FoodState] = mapped_column(Enum(FoodState), primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("food.id"))
    food: Mapped[List[Food]] = relationship()
    quantity: Mapped[Float] = mapped_column(Float)


Base.metadata.drop_all(bind=engine, checkfirst=False)
Base.metadata.create_all(bind=engine, checkfirst=False)
