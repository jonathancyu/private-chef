from enum import Enum


class FoodState(str, Enum):
    PLANNED = "PLANNED"
    UNCOOKED = "UNCOOKED"
    READY = "READY"


class MealType(str, Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    SNACK = "SNACK"
