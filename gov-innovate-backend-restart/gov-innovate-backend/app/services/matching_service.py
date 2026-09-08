"""
Lightweight AI/NLP-style matching between challenges and startups.

This starts as a simple keyword-overlap scorer so the platform works with zero
external dependencies. Swap the body of `match_score` for a call to an
embeddings model (e.g. sentence-transformers or an LLM) once you're ready —
the function signature is the only contract the rest of the app relies on.
"""
import re

_STOPWORDS = {
    "the", "a", "an", "and", "or", "for", "of", "to", "in", "on", "with",
    "is", "are", "this", "that", "by", "at", "as", "be", "it",
}


def _tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) > 2}


def match_score(challenge_text: str, startup_profile_text: str) -> float:
    """
    Returns a 0-100 relevance score based on shared-keyword overlap
    between a challenge's description and a startup's profile/proposal.
    """
    challenge_tokens = _tokenize(challenge_text)
    startup_tokens = _tokenize(startup_profile_text)

    if not challenge_tokens or not startup_tokens:
        return 0.0

    overlap = challenge_tokens & startup_tokens
    score = len(overlap) / len(challenge_tokens) * 100
    return round(min(score, 100.0), 2)


def rank_startups(challenge_text: str, startups: list[dict]) -> list[dict]:
    """
    startups: [{"id": 1, "profile_text": "..."}, ...]
    Returns the same list, each item annotated with a "match_score" key,
    sorted highest-match first.
    """
    ranked = [
        {**s, "match_score": match_score(challenge_text, s.get("profile_text", ""))}
        for s in startups
    ]
    return sorted(ranked, key=lambda s: s["match_score"], reverse=True)
