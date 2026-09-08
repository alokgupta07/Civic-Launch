from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.pilot import PilotStatus


class Milestone(BaseModel):
    label: str
    done: bool = False
    date: str | None = None


class PilotCreate(BaseModel):
    application_id: int
    milestones: list[Milestone] = []
    status: PilotStatus = PilotStatus.APPROVED
    progress: int = 0


class PilotUpdate(BaseModel):
    milestones: list[Milestone] | None = None
    status: PilotStatus | None = None
    progress: int | None = None


class PilotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    application_id: int
    milestones: list[dict]
    status: PilotStatus
    progress: int
    created_at: datetime


class PilotAnalyticsResponse(BaseModel):
    application_id: int
    status: PilotStatus
    progress: int
    completed_milestones: int
    total_milestones: int
