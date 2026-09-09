from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    challenge_id: int
    proposal: str | None = None

    technology_approach: str | None = None
    expected_impact: str | None = None
    team_details: str | None = None
    estimated_budget: str | None = None
    pilot_plan: str | None = None


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus | None = None
    proposal: str | None = None

    technology_approach: str | None = None
    expected_impact: str | None = None
    team_details: str | None = None
    estimated_budget: str | None = None
    pilot_plan: str | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    challenge_id: int
    startup_id: int

    proposal: str | None

    technology_approach: str | None
    expected_impact: str | None
    team_details: str | None
    estimated_budget: str | None
    pilot_plan: str | None

    status: ApplicationStatus
    created_at: datetime