from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Compliance Explained Platform API"
    app_env: str = "development"
    cors_allow_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_prefix="CEP_")


settings = Settings()

