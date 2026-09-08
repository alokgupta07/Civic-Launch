import enum

from sqlalchemy import Column, Integer, JSON, String, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class PilotStatus(str, enum.Enum):
    APPROVED = "PILOT APPROVED"
    DEPLOYMENT = "PILOT DEPLOYMENT"
    MONITORING = "PERFORMANCE MONITORING"
    EVALUATION = "PILOT EVALUATION"
    PROCUREMENT_RECOMMENDATION = "PROCUREMENT RECOMMENDATION"
    COMPLETED = "COMPLETED"


class Pilot(Base):
    __tablename__ = "pilots"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, unique=True)

    # milestones: [{"label": "Pilot Approved", "done": true, "date": "2026-07-01"}, ...]
    milestones = Column(JSON, nullable=False, default=list)
    status = Column(Enum(PilotStatus), nullable=False, default=PilotStatus.APPROVED)
    progress = Column(Integer, nullable=False, default=0)  # 0-100

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    application = relationship("Application", back_populates="pilot")
