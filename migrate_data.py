#!/usr/bin/env python3
"""
Migrate data from SQLite to PostgreSQL
This script transfers existing data from skillbasehire.db to PostgreSQL.
"""

import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

load_dotenv()

SQLITE_DB = "skillbasehire.db"
PG_URL = os.getenv("DATABASE_URL")

# This will clear PostgreSQL tables before migration to avoid duplicate ID errors
RESET_POSTGRES_BEFORE_MIGRATION = True


def quote_identifier(name):
    """Safely quote table/column names for PostgreSQL."""
    return '"' + name.replace('"', '""') + '"'


def ensure_missing_columns(pg_cursor, table, columns):
    """
    If SQLite has columns that PostgreSQL table does not have,
    automatically add those missing columns as TEXT.
    """
    pg_cursor.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = %s
        """,
        (table,),
    )

    existing_columns = {row[0] for row in pg_cursor.fetchall()}

    for column in columns:
        if column not in existing_columns:
            pg_cursor.execute(
                f"""
                ALTER TABLE {quote_identifier(table)}
                ADD COLUMN {quote_identifier(column)} TEXT
                """
            )
            print(f" added missing column: {column}", end=" ")


def reset_postgres_tables(pg_cursor, pg_conn):
    """Clear PostgreSQL tables before migration."""
    tables = [
        "applications",
        "job_skills",
        "jobs",
        "skills",
        "recruiter_profiles",
        "candidate_profiles",
        "users",
    ]

    print("🧹 Clearing existing PostgreSQL data...")

    try:
        table_names = ", ".join([quote_identifier(table) for table in tables])
        pg_cursor.execute(
            f"""
            TRUNCATE TABLE {table_names}
            RESTART IDENTITY CASCADE
            """
        )
        pg_conn.commit()
        print("✓ PostgreSQL tables cleared")
    except Exception as e:
        pg_conn.rollback()
        print(f"⚠ Could not clear tables: {e}")


def reset_sequence(pg_cursor, table):
    """Reset PostgreSQL sequence after inserting existing IDs."""
    try:
        pg_cursor.execute(
            "SELECT pg_get_serial_sequence(%s, 'id')",
            (f"public.{table}",),
        )
        sequence = pg_cursor.fetchone()[0]

        if sequence:
            pg_cursor.execute(
                f"""
                SELECT setval(
                    %s,
                    COALESCE((SELECT MAX(id) FROM {quote_identifier(table)}), 1),
                    true
                )
                """,
                (sequence,),
            )
    except Exception:
        pass


def migrate_data():
    """Migrate all data from SQLite to PostgreSQL."""

    print("\n" + "=" * 60)
    print("SQLite → PostgreSQL Data Migration")
    print("=" * 60 + "\n")

    if not PG_URL:
        print("✗ DATABASE_URL not found in .env file")
        return False

    # Connect to SQLite
    try:
        sqlite_conn = sqlite3.connect(SQLITE_DB)
        sqlite_conn.row_factory = sqlite3.Row
        sqlite_cursor = sqlite_conn.cursor()
        print("✓ Connected to SQLite database")
    except Exception as e:
        print(f"✗ Failed to connect to SQLite: {e}")
        return False

    # Connect to PostgreSQL
    try:
        pg_conn = psycopg2.connect(PG_URL)
        pg_cursor = pg_conn.cursor()
        print("✓ Connected to PostgreSQL database")
    except Exception as e:
        print(f"✗ Failed to connect to PostgreSQL: {e}")
        print(f"DATABASE_URL: {PG_URL}")
        return False

    try:
        if RESET_POSTGRES_BEFORE_MIGRATION:
            reset_postgres_tables(pg_cursor, pg_conn)

        # Migration order should respect foreign keys
        tables = [
            "users",
            "candidate_profiles",
            "recruiter_profiles",
            "skills",
            "jobs",
            "job_skills",
            "applications",
        ]

        total_rows = 0

        for table in tables:
            print(f"📦 Migrating '{table}'...", end=" ", flush=True)

            # Get data from SQLite
            try:
                sqlite_cursor.execute(f"SELECT * FROM {table}")
                rows = sqlite_cursor.fetchall()
            except sqlite3.OperationalError:
                print("(table does not exist in SQLite)")
                continue

            if not rows:
                print("(empty)")
                continue

            # Get SQLite column names
            columns = [description[0] for description in sqlite_cursor.description]

            # Add missing PostgreSQL columns automatically
            ensure_missing_columns(pg_cursor, table, columns)
            pg_conn.commit()

            # Convert rows to tuples
            data = [tuple(row) for row in rows]

            # Quote column names safely
            quoted_columns = ", ".join([quote_identifier(col) for col in columns])

            # PostgreSQL bulk insert query
            insert_query = (
                f"INSERT INTO {quote_identifier(table)} "
                f"({quoted_columns}) VALUES %s"
            )

            try:
                execute_values(pg_cursor, insert_query, data)
                reset_sequence(pg_cursor, table)
                pg_conn.commit()

                total_rows += len(data)
                print(f"✓ {len(data)} rows migrated")

            except Exception as e:
                pg_conn.rollback()
                print(f"✗ Error: {e}")
                return False

        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        print(f"\n📊 Total rows migrated: {total_rows}\n")

        # Summary
        try:
            pg_cursor.execute("SELECT COUNT(*) FROM users")
            user_count = pg_cursor.fetchone()[0]

            pg_cursor.execute("SELECT COUNT(*) FROM jobs")
            job_count = pg_cursor.fetchone()[0]

            pg_cursor.execute("SELECT COUNT(*) FROM applications")
            application_count = pg_cursor.fetchone()[0]

            print("📊 Database Summary:")
            print(f"   • Users: {user_count}")
            print(f"   • Jobs: {job_count}")
            print(f"   • Applications: {application_count}\n")
        except Exception:
            pass

        return True

    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        pg_conn.rollback()
        return False

    finally:
        sqlite_conn.close()
        pg_conn.close()


if __name__ == "__main__":
    success = migrate_data()

    if not success:
        print("\n⚠ Migration failed. Check errors above and try again.")
        exit(1)
    else:
        print("🎉 Your data is now in PostgreSQL!")