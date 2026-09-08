"""
Seeds the database with the same illustrative data used in the GovInnovate
frontend prototype (CHALLENGES / STARTUPS / PROCUREMENT_ITEMS), so the API
returns realistic results the moment the frontend is pointed at it.

Run with:  python -m scripts.seed_data
"""
import sys
from datetime import date
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.application import Application, ApplicationStatus  # noqa: E402
from app.models.challenge import Challenge, ChallengeStatus  # noqa: E402
from app.models.evaluation import Evaluation  # noqa: E402
from app.models.pilot import Pilot, PilotStatus  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def get_or_create_user(email: str, **kwargs) -> tuple[User, bool]:
    """Look up a user by their unique email; create it only if missing."""
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing, False
    user = User(email=email, **kwargs)
    db.add(user)
    db.commit()
    return user, True


def get_or_create_challenge(challenge_code: str, **kwargs) -> tuple[Challenge, bool]:
    """Look up a challenge by its unique challenge_code; create it only if missing."""
    existing = db.query(Challenge).filter(Challenge.challenge_code == challenge_code).first()
    if existing:
        return existing, False
    challenge = Challenge(challenge_code=challenge_code, **kwargs)
    db.add(challenge)
    db.commit()
    return challenge, True


def get_or_create_application(challenge_id: int, startup_id: int, **kwargs) -> tuple[Application, bool]:
    """A startup should not have two seeded applications to the same challenge."""
    existing = (
        db.query(Application)
        .filter(Application.challenge_id == challenge_id, Application.startup_id == startup_id)
        .first()
    )
    if existing:
        return existing, False
    application = Application(challenge_id=challenge_id, startup_id=startup_id, **kwargs)
    db.add(application)
    db.commit()
    return application, True


def get_or_create_evaluation(application_id: int, evaluator_id: int, **kwargs) -> tuple[Evaluation, bool]:
    """One seeded evaluation per (application, evaluator) pair."""
    existing = (
        db.query(Evaluation)
        .filter(Evaluation.application_id == application_id, Evaluation.evaluator_id == evaluator_id)
        .first()
    )
    if existing:
        return existing, False
    evaluation = Evaluation(application_id=application_id, evaluator_id=evaluator_id, **kwargs)
    db.add(evaluation)
    db.commit()
    return evaluation, True


def get_or_create_pilot(application_id: int, **kwargs) -> tuple[Pilot, bool]:
    """application_id is unique on Pilot, so an application can have at most one pilot."""
    existing = db.query(Pilot).filter(Pilot.application_id == application_id).first()
    if existing:
        return existing, False
    pilot = Pilot(application_id=application_id, **kwargs)
    db.add(pilot)
    db.commit()
    return pilot, True


print("Seeding users...")
gov_user, gov_created = get_or_create_user(
    "r.sharma@gov.example",
    name="Dr. R. Sharma",
    password_hash=hash_password("password123"),
    role=UserRole.government,
    organization="Ministry of Agriculture & Farmers Welfare",
)
startup_user, startup_created = get_or_create_user(
    "founder@agrosense.example",
    name="Startup Founder",
    password_hash=hash_password("password123"),
    role=UserRole.startup,
    organization="AgroSense Technologies Pvt. Ltd.",
)
evaluator_user, evaluator_created = get_or_create_user(
    "a.iyer@gov.example",
    name="Ms. A. Iyer",
    password_hash=hash_password("password123"),
    role=UserRole.evaluator,
    organization="Ministry of Agriculture & Farmers Welfare",
)
print(f"  government: {'created' if gov_created else 'already existed'}")
print(f"  startup:    {'created' if startup_created else 'already existed'}")
print(f"  evaluator:  {'created' if evaluator_created else 'already existed'}")

print("Seeding challenges...")
challenges_data = [
    ("GC-2026-014", "AI-Based Crop Disease Detection for Small Farmers",
     "Ministry of Agriculture & Farmers Welfare", ChallengeStatus.EVALUATION, date(2026, 10, 15)),
    ("GC-2026-021", "Smart Waste Segregation System for Urban Local Bodies",
     "Ministry of Housing & Urban Affairs", ChallengeStatus.PUBLISHED, date(2026, 10, 30)),
    ("GC-2026-009", "Low-Cost Water Quality Monitoring for Rural Areas",
     "Dept. of Drinking Water & Sanitation", ChallengeStatus.SHORTLISTED, date(2026, 9, 5)),
    ("GC-2026-005", "Digital Literacy Platform for Anganwadi Workers",
     "Ministry of Women & Child Development", ChallengeStatus.PILOT, date(2026, 8, 20)),
    ("GC-2025-088", "Predictive Maintenance for Municipal Transformers",
     "Ministry of Power", ChallengeStatus.PROCUREMENT, date(2026, 6, 12)),
    ("GC-2025-071", "Blockchain-Based Land Record Verification",
     "Dept. of Land Resources", ChallengeStatus.COMPLETED, date(2026, 3, 1)),
    ("GC-2026-030", "Solar-Powered Cold Storage for Farm Produce",
     "Ministry of Food Processing Industries", ChallengeStatus.DRAFT, None),
]
challenges = {}
created_count = 0
for code, title, dept, stat, deadline in challenges_data:
    c, was_created = get_or_create_challenge(
        code, title=title, department=dept, status=stat,
        deadline=deadline, created_by_id=gov_user.id,
        description=f"Government challenge: {title}",
    )
    challenges[code] = c
    created_count += was_created
print(f"  {created_count} created, {len(challenges_data) - created_count} already existed")

print("Seeding an application, evaluation and pilot for the flagship challenge...")
application, application_created = get_or_create_application(
    challenge_id=challenges["GC-2026-014"].id,
    startup_id=startup_user.id,
    proposal="AI-powered mobile app for early crop disease detection using computer vision.",
    status=ApplicationStatus.UNDER_REVIEW,
)

evaluation, evaluation_created = get_or_create_evaluation(
    application_id=application.id,
    evaluator_id=evaluator_user.id,
    scores={
        "technical_feasibility": 22,
        "innovation": 18,
        "scalability": 12,
        "cost_effectiveness": 11,
        "implementation_capability": 13,
        "government_impact": 9,
    },
    total_score=85,
    remarks="Strong field-deployment plan; highest weighted score among eligible applicants.",
)

pilot_application, pilot_application_created = get_or_create_application(
    challenge_id=challenges["GC-2026-005"].id,
    startup_id=startup_user.id,
    proposal="Digital literacy training platform for Anganwadi workers.",
    status=ApplicationStatus.PILOT,
)

pilot, pilot_created = get_or_create_pilot(
    application_id=pilot_application.id,
    milestones=[
        {"label": "Pilot Approved", "done": True, "date": "2026-07-01"},
        {"label": "Pilot Deployment", "done": True, "date": "2026-07-15"},
        {"label": "Performance Monitoring", "done": True, "date": "2026-08-01"},
        {"label": "Pilot Evaluation", "done": False, "date": None},
        {"label": "Procurement Recommendation", "done": False, "date": None},
    ],
    status=PilotStatus.MONITORING,
    progress=60,
)
print(f"  application (flagship): {'created' if application_created else 'already existed'}")
print(f"  evaluation:             {'created' if evaluation_created else 'already existed'}")
print(f"  application (pilot):    {'created' if pilot_application_created else 'already existed'}")
print(f"  pilot:                  {'created' if pilot_created else 'already existed'}")

print("Done. Seeded users:")
print("  government: r.sharma@gov.example / password123")
print("  startup:    founder@agrosense.example / password123")
print("  evaluator:  a.iyer@gov.example / password123")

db.close()