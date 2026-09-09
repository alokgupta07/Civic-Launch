from sqlalchemy import text

from app.core.database import engine


COLUMNS = {
    "technology_approach": "TEXT",
    "expected_impact": "TEXT",
    "team_details": "TEXT",
    "estimated_budget": "TEXT",
    "pilot_plan": "TEXT",
}


def migrate():
    with engine.begin() as connection:
        for column_name, column_type in COLUMNS.items():
            try:
                connection.execute(
                    text(
                        f"ALTER TABLE applications "
                        f"ADD COLUMN {column_name} {column_type}"
                    )
                )
                print(f"Added column: {column_name}")
            except Exception as error:
                if "duplicate column" in str(error).lower():
                    print(f"Already exists: {column_name}")
                else:
                    raise error

    print("Application migration completed.")


if __name__ == "__main__":
    migrate()