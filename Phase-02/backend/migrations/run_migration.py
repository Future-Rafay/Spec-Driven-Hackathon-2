"""
Database migration runner for tasks table.
Run this script to create the tasks table and indexes.
"""
import asyncio
import sys
from pathlib import Path
import re

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from src.core.database import engine


def split_sql_statements(sql_content: str) -> list:
    """
    Split SQL content into individual statements.
    Handles multi-line statements and comments.
    """
    # Remove SQL comments
    sql_content = re.sub(r'--.*$', '', sql_content, flags=re.MULTILINE)

    # Split by semicolons, but preserve function definitions
    statements = []
    current_statement = []
    in_function = False

    for line in sql_content.split('\n'):
        line = line.strip()
        if not line:
            continue

        # Track function definitions
        if 'CREATE OR REPLACE FUNCTION' in line.upper() or 'CREATE FUNCTION' in line.upper():
            in_function = True

        current_statement.append(line)

        # End of statement
        if line.endswith(';'):
            if in_function and '$$ LANGUAGE' in line.upper():
                in_function = False

            if not in_function:
                stmt = ' '.join(current_statement)
                if stmt.strip():
                    statements.append(stmt)
                current_statement = []

    return statements


async def run_migration():
    """
    Run the 002_create_tasks_table.sql migration.
    """
    migration_file = Path(__file__).parent / "002_create_tasks_table.sql"

    print(f"Reading migration file: {migration_file}")

    if not migration_file.exists():
        print(f"ERROR: Migration file not found: {migration_file}")
        return False

    # Read migration SQL
    with open(migration_file, 'r', encoding='utf-8') as f:
        migration_sql = f.read()

    print("Splitting SQL statements...")
    statements = split_sql_statements(migration_sql)
    print(f"Found {len(statements)} SQL statements to execute")

    try:
        async with engine.begin() as conn:
            # Execute each statement individually
            for i, stmt in enumerate(statements, 1):
                print(f"Executing statement {i}/{len(statements)}...")
                await conn.execute(text(stmt))

            print("[OK] All migration statements executed successfully")

            # Verify table exists
            result = await conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name = 'tasks'"
            ))
            table_exists = result.fetchone()

            if table_exists:
                print("[OK] Tasks table created successfully")
            else:
                print("[ERROR] Tasks table not found after migration")
                return False

            # Verify foreign key constraint
            result = await conn.execute(text(
                "SELECT conname FROM pg_constraint "
                "WHERE conrelid = 'tasks'::regclass AND contype = 'f'"
            ))
            fk_constraint = result.fetchone()

            if fk_constraint:
                print(f"[OK] Foreign key constraint exists: {fk_constraint[0]}")
            else:
                print("[ERROR] Foreign key constraint not found")
                return False

            # Verify indexes
            result = await conn.execute(text(
                "SELECT indexname FROM pg_indexes "
                "WHERE tablename = 'tasks'"
            ))
            indexes = result.fetchall()

            if indexes:
                print(f"[OK] Indexes created: {len(indexes)} indexes")
                for idx in indexes:
                    print(f"  - {idx[0]}")
            else:
                print("[ERROR] No indexes found")
                return False

            # Verify trigger
            result = await conn.execute(text(
                "SELECT tgname FROM pg_trigger "
                "WHERE tgrelid = 'tasks'::regclass"
            ))
            trigger = result.fetchone()

            if trigger:
                print(f"[OK] Trigger exists: {trigger[0]}")
            else:
                print("[ERROR] Trigger not found")
                return False

            print("\n[OK] All migration checks passed!")
            return True

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def verify_schema():
    """
    Verify the tasks table schema matches the specification.
    """
    print("\nVerifying table schema...")

    try:
        async with engine.begin() as conn:
            # Get column information
            result = await conn.execute(text(
                "SELECT column_name, data_type, is_nullable, column_default "
                "FROM information_schema.columns "
                "WHERE table_name = 'tasks' "
                "ORDER BY ordinal_position"
            ))
            columns = result.fetchall()

            expected_columns = {
                'id': 'uuid',
                'title': 'character varying',
                'description': 'text',
                'completed': 'boolean',
                'user_id': 'uuid',
                'created_at': 'timestamp without time zone',
                'updated_at': 'timestamp without time zone'
            }

            print("\nTable columns:")
            for col in columns:
                col_name, data_type, is_nullable, default = col
                nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                print(f"  - {col_name}: {data_type} {nullable}")

                # Verify expected columns
                if col_name in expected_columns:
                    if data_type == expected_columns[col_name]:
                        print(f"    [OK] Type matches specification")
                    else:
                        print(f"    [ERROR] Type mismatch: expected {expected_columns[col_name]}")

            print("\n[OK] Schema verification complete!")
            return True

    except Exception as e:
        print(f"[ERROR] Schema verification failed: {e}")
        return False


async def main():
    """
    Main migration runner.
    """
    print("=" * 60)
    print("Database Migration: Create Tasks Table")
    print("=" * 60)
    print()

    # Run migration
    migration_success = await run_migration()

    if not migration_success:
        print("\n[ERROR] Migration failed. Please check the errors above.")
        sys.exit(1)

    # Verify schema
    schema_success = await verify_schema()

    if not schema_success:
        print("\n[ERROR] Schema verification failed. Please check the errors above.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("[OK] Migration completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
