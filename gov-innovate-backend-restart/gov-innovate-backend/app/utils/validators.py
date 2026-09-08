"""
Small validation helpers reused across schemas/services.
"""
import re

CHALLENGE_CODE_PATTERN = re.compile(r"^GC-\d{4}-\d{3}$")


def is_valid_challenge_code(code: str) -> bool:
    """Matches the GC-YYYY-NNN format used throughout the frontend, e.g. GC-2026-014."""
    return bool(CHALLENGE_CODE_PATTERN.match(code))


def is_valid_score(value: float, max_value: float = 100.0) -> bool:
    return 0 <= value <= max_value


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))
