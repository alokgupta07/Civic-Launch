from sqlalchemy import inspect, text

from app.core.database import engine


NEW_COLUMNS = {
    "expected_outcome": "TEXT",
    "technical_requirements": "TEXT",
    "eligibility_criteria": "TEXT",
    "minimum_team_size": "INTEGER",
    "sector_focus": "VARCHAR(255)",
    "evaluation_criteria": "TEXT",
    "procurement_value": "VARCHAR(255)",
    "pilot_requirements": "TEXT",
}


def migrate():
    print("Checking challenges table...")

    with engine.begin() as conn:
        inspector = inspect(conn)

        if "challenges" not in inspector.get_table_names():
            print("ERROR: challenges table does not exist.")
            return

        existing_columns = {
            column["name"]
            for column in inspector.get_columns("challenges")
        }

        added = 0
        existing = 0

        for column_name, column_type in NEW_COLUMNS.items():
            if column_name in existing_columns:
                print(f"  {column_name}: already exists")
                existing += 1
                continue

            conn.execute(
                text(
                    f"ALTER TABLE challenges "
                    f"ADD COLUMN {column_name} {column_type}"
                )
            )

            print(f"  {column_name}: added")
            added += 1

    print()
    print("Migration complete.")
    print(f"  Added: {added}")
    print(f"  Already existed: {existing}")


if __name__ == "__main__":
    migrate()