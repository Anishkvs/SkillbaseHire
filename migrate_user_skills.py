#!/usr/bin/env python3
"""One-time migration for SkillBaseHire user_skills from SQLite to PostgreSQL."""

import os
import sqlite3

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

SQLITE_DB = os.getenv("SQLITE_DB", "skillbasehire.db")
PG_URL = os.getenv("DATABASE_URL")


def main():
    if not PG_URL:
        print("ERROR: DATABASE_URL is missing in .env")
        return 1
    if not os.path.exists(SQLITE_DB):
        print(f"ERROR: SQLite database not found: {SQLITE_DB}")
        return 1

    sqlite_conn = sqlite3.connect(SQLITE_DB)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_skills'")
    if not sqlite_cur.fetchone():
        print("SQLite table user_skills not found. Nothing to migrate.")
        return 0

    pg_conn = psycopg2.connect(PG_URL)
    pg_cur = pg_conn.cursor()

    try:
        pg_cur.execute("""
            CREATE TABLE IF NOT EXISTS user_skills (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
                verified INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, skill_id)
            )
        """)
        pg_conn.commit()

        sqlite_cur.execute("SELECT * FROM user_skills")
        rows = sqlite_cur.fetchall()
        if not rows:
            print("SQLite user_skills is empty.")
            return 0

        sqlite_cols = [d[0] for d in sqlite_cur.description]
        pg_cur.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema='public' AND table_name='user_skills'
            ORDER BY ordinal_position
        """)
        pg_cols = {row[0] for row in pg_cur.fetchall()}
        common_cols = [col for col in sqlite_cols if col in pg_cols]

        data = [tuple(row[col] for col in common_cols) for row in rows]
        columns_sql = ", ".join(common_cols)

        pg_cur.execute("TRUNCATE TABLE user_skills RESTART IDENTITY")
        insert_sql = f"INSERT INTO user_skills ({columns_sql}) VALUES %s ON CONFLICT DO NOTHING"
        execute_values(pg_cur, insert_sql, data, page_size=500)

        pg_cur.execute("""
            SELECT setval(
                pg_get_serial_sequence('user_skills', 'id'),
                COALESCE((SELECT MAX(id) FROM user_skills), 1),
                (SELECT COUNT(*) FROM user_skills) > 0
            )
        """)
        pg_conn.commit()
        print(f"✅ user_skills migrated successfully: {len(rows)} rows processed")
        return 0

    except Exception as exc:
        pg_conn.rollback()
        print(f"ERROR: {exc}")
        return 1

    finally:
        sqlite_conn.close()
        pg_conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
