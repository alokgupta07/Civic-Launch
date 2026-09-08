import enum

from sqlalchemy import Column, Integer, String, Enum, DateTime, func

from app.core.database import Base


class UserRole(str, enum.Enum):
    government = "government"
    startup = "startup"
    evaluator = "evaluator"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.startup)
    organization = Column(String(255), nullable=True)  # ministry/department or startup name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
