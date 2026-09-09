import enum

from sqlalchemy import Column, Integer, Text, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ApplicationStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    PILOT = "PILOT"
    PROCUREMENT = "PROCUREMENT"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    challenge_id = Column(
        Integer,
        ForeignKey("challenges.id"),
        nullable=False
    )

    startup_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Basic application information
    proposal = Column(Text, nullable=True)

    # Detailed startup application information
    technology_approach = Column(Text, nullable=True)
    expected_impact = Column(Text, nullable=True)
    team_details = Column(Text, nullable=True)
    estimated_budget = Column(Text, nullable=True)
    pilot_plan = Column(Text, nullable=True)

    status = Column(
        Enum(ApplicationStatus),
        nullable=False,
        default=ApplicationStatus.SUBMITTED
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    challenge = relationship(
        "Challenge",
        back_populates="applications"
    )

    startup = relationship("User")

    evaluations = relationship(
        "Evaluation",
        back_populates="application",
        cascade="all, delete-orphan"
    )

    pilot = relationship(
        "Pilot",
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan"
    )