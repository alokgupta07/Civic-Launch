from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.challenge import ChallengeStatus


class ChallengeCreate(BaseModel):
    challenge_code: str
    title: str
    description: Optional[str] = None
    department: str

    budget: Optional[Decimal] = None
    deadline: Optional[date] = None
    status: ChallengeStatus = ChallengeStatus.DRAFT

    expected_outcome: Optional[str] = None
    technical_requirements: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    minimum_team_size: Optional[int] = None
    sector_focus: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    procurement_value: Optional[str] = None
    pilot_requirements: Optional[str] = None


class ChallengeUpdate(BaseModel):
    challenge_code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None

    budget: Optional[Decimal] = None
    deadline: Optional[date] = None
    status: Optional[ChallengeStatus] = None

    expected_outcome: Optional[str] = None
    technical_requirements: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    minimum_team_size: Optional[int] = None
    sector_focus: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    procurement_value: Optional[str] = None
    pilot_requirements: Optional[str] = None


class ChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    challenge_code: str
    title: str
    description: Optional[str] = None
    department: str

    budget: Optional[Decimal] = None
    deadline: Optional[date] = None
    status: ChallengeStatus

    expected_outcome: Optional[str] = None
    technical_requirements: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    minimum_team_size: Optional[int] = None
    sector_focus: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    procurement_value: Optional[str] = None
    pilot_requirements: Optional[str] = None

    created_by_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None