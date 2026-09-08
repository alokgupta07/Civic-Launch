"""
Rubric-based evaluation scoring, matching the six parameters used in the
GovInnovate Evaluator Dashboard (Technical Feasibility, Innovation, Scalability,
Cost Effectiveness, Implementation Capability, Government Impact).

Scores are submitted as raw points already weighted by the evaluator
(e.g. Technical Feasibility scored 22 out of a 25% weight) — this service just
sums them into a final score out of 100. Swap in a weighted-average formula
here if you want evaluators to submit 0-100 scores per parameter instead.
"""

DEFAULT_MAX_SCORE = 100


def calculate_total_score(scores: dict[str, float]) -> float:
    total = sum(scores.values())
    return round(min(total, DEFAULT_MAX_SCORE), 2)
