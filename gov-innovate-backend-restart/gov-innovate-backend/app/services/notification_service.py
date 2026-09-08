"""
Email/SMS alerts for key platform events (challenge published, evaluation due,
pilot milestone reached, etc).

This is a console-logging stub so the app runs with zero external config.
Wire in a real provider (SES/SendGrid for email, Twilio/MSG91 for SMS) by
replacing the bodies of send_email / send_sms — every caller in the app
goes through notify_event() below, so that's the one place to extend.
"""
import logging

logger = logging.getLogger("notifications")


def send_email(to: str, subject: str, body: str) -> None:
    logger.info("[EMAIL to=%s] %s\n%s", to, subject, body)


def send_sms(to: str, body: str) -> None:
    logger.info("[SMS to=%s] %s", to, body)


def notify_event(event: str, recipient_email: str, context: dict | None = None) -> None:
    """
    event examples: "challenge_published", "application_shortlisted",
    "evaluation_due", "pilot_milestone_reached", "procurement_recommended"
    """
    context = context or {}
    subject = event.replace("_", " ").title()
    body = "\n".join(f"{k}: {v}" for k, v in context.items())
    send_email(recipient_email, subject, body)
