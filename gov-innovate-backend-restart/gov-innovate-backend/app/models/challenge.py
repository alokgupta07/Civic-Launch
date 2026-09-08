import enum

from sqlalchemy import Column, Integer, String, Text, Numeric, Date, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ChallengeStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    EVALUATION = "EVALUATION"
    SHORTLISTED = "SHORTLISTED"
    PILOT = "PILOT"
    PROCUREMENT = "PROCUREMENT"
    COMPLETED = "COMPLETED"


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    challenge_code = Column(String(30), unique=True, index=True, nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String(255), nullable=False)
    budget = Column(Numeric(14, 2), nullable=True)
    deadline = Column(Date, nullable=True)
    status = Column(
        Enum(ChallengeStatus),
        nullable=False,
        default=ChallengeStatus.DRAFT
    )

    expected_outcome = Column(Text, nullable=True)
    technical_requirements = Column(Text, nullable=True)
    eligibility_criteria = Column(Text, nullable=True)
    minimum_team_size = Column(Integer, nullable=True)
    sector_focus = Column(String(255), nullable=True)
    evaluation_criteria = Column(Text, nullable=True)
    procurement_value = Column(String(255), nullable=True)
    pilot_requirements = Column(Text, nullable=True)

    created_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    applications = relationship(
        "Application",
        back_populates="challenge",
        cascade="all, delete-orphan"
    )