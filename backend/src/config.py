# TODO: pydantic_settings
from src.constants import Environment


class Config:
    DATABASE_URL: str = "sqlite:///./private_chef.db"
    ENVIRONMENT: Environment = Environment.Development
    HOST: str = "0.0.0.0"
    PORT: int = 8000


settings = Config()
