from sqlalchemy import Column, Integer, JSON, Numeric, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    evaluator_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # scores: {"technical_feasibility": 22, "innovation": 18, ...}
    scores = Column(JSON, nullable=False, default=dict)
    total_score = Column(Numeric(5, 2), nullable=True)
    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="evaluations")
    evaluator = relationship("User")
