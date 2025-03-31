import enum


class Environment(str, enum.Enum):
    """Enum for deployment environment"""

    Development = "Development"
    NonProduction = "NonProduction"
    Production = "Production"
