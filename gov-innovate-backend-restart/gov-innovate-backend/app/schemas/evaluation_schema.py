from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class EvaluationCreate(BaseModel):
    application_id: int
    # e.g. {"technical_feasibility": 22, "innovation": 18, "scalability": 12,
    #       "cost_effectiveness": 11, "implementation_capability": 13, "government_impact": 9}
    scores: dict[str, float]
    remarks: str | None = None


class EvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    application_id: int
    evaluator_id: int | None
    scores: dict[str, float]
    total_score: Decimal | None
    remarks: str | None
    created_at: datetime
