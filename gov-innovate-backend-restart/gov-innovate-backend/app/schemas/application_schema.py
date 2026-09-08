from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    challenge_id: int
    proposal: str | None = None


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus | None = None
    proposal: str | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    challenge_id: int
    startup_id: int
    proposal: str | None
    status: ApplicationStatus
    created_at: datetime
