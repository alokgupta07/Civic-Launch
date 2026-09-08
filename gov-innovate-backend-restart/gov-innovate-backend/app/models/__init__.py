"""
Importing this package registers every model on the shared declarative Base,
which SQLAlchemy needs so that string-based relationship() references
(e.g. Application.evaluations = relationship("Evaluation", ...)) resolve
correctly no matter which module is imported first.
"""
from app.models.user import User, UserRole  # noqa: F401
from app.models.challenge import Challenge, ChallengeStatus  # noqa: F401
from app.models.application import Application, ApplicationStatus  # noqa: F401
from app.models.evaluation import Evaluation  # noqa: F401
from app.models.pilot import Pilot, PilotStatus  # noqa: F401
