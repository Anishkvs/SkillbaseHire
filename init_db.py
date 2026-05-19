#!/usr/bin/env python3
"""
SkillBaseHire — PostgreSQL Database Initialisation Script
==========================================================
Creates all tables, indexes, and seeds reference data.
Safe to run multiple times — uses IF NOT EXISTS and ON CONFLICT DO NOTHING.
Never drops or truncates any table; never deletes existing data.

DigitalOcean App Console command:
    python init_db.py

Requires:
    DATABASE_URL environment variable (injected automatically by DigitalOcean
    when a PostgreSQL database component is attached to your app).
"""

import os
import sys
from urllib.parse import urlparse

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 is not installed. Run:  pip install psycopg2-binary")
    sys.exit(1)


# ── Resolve DATABASE_URL ─────────────────────────────────────────────────────

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

if not DATABASE_URL:
    # Local fallback: try loading from .env files (not needed on DigitalOcean)
    try:
        from dotenv import load_dotenv
        load_dotenv(".env.production", override=False)
        load_dotenv(".env.development")
        DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
    except ImportError:
        pass

if not DATABASE_URL:
    print(
        "ERROR: DATABASE_URL is not set.\n"
        "       On DigitalOcean, attach a PostgreSQL component to your app and\n"
        "       its DATABASE_URL will be injected automatically.\n"
        "       Locally, add DATABASE_URL to your .env.development file."
    )
    sys.exit(1)

# psycopg2 requires the postgresql:// scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Print a safe (password-masked) version of the URL for confirmation
_parsed = urlparse(DATABASE_URL)
_safe = DATABASE_URL.replace(_parsed.password, "***") if _parsed.password else DATABASE_URL
print(f"\nTarget database : {_safe}")
print(f"Host            : {_parsed.hostname}:{_parsed.port}")
print(f"Database name   : {_parsed.path.lstrip('/')}\n")


# ── Table definitions ────────────────────────────────────────────────────────
# Executed in dependency order (referenced tables first).
# Every statement is CREATE TABLE IF NOT EXISTS — completely safe to re-run.

TABLE_STMTS = [

    # ── users ────────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS users (
        id                                SERIAL    PRIMARY KEY,
        name                              TEXT      NOT NULL,
        email                             TEXT      UNIQUE NOT NULL,
        password_hash                     TEXT      NOT NULL,
        role                              TEXT      NOT NULL CHECK (role IN ('candidate', 'recruiter')),
        email_verified                    INTEGER   DEFAULT 0,
        email_verified_at                 TIMESTAMP,
        email_verification_token_hash     TEXT,
        email_verification_expires_at     TIMESTAMP,
        email_verification_sent_at        TIMESTAMP,
        created_at                        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,

    # ── candidate_profiles ───────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS candidate_profiles (
        id                  SERIAL   PRIMARY KEY,
        user_id             INTEGER  UNIQUE NOT NULL
                                     REFERENCES users(id) ON DELETE CASCADE,
        headline            TEXT     DEFAULT '',
        location            TEXT     DEFAULT '',
        bio                 TEXT     DEFAULT '',
        linkedin            TEXT     DEFAULT '',
        github              TEXT     DEFAULT '',
        phone               TEXT     DEFAULT '',
        job_title           TEXT     DEFAULT '',
        experience          TEXT     DEFAULT '',
        resume_filename     TEXT,
        work_status         TEXT     DEFAULT '',
        work_mode           TEXT     DEFAULT '',
        notice_period       TEXT     DEFAULT '',
        expected_salary     TEXT     DEFAULT '',
        willing_to_relocate INTEGER  DEFAULT 0,
        gender              TEXT     DEFAULT '',
        differently_abled   TEXT     DEFAULT 'no',
        profile_photo       TEXT
    )
    """,

    # ── recruiter_profiles ───────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS recruiter_profiles (
        id               SERIAL  PRIMARY KEY,
        user_id          INTEGER UNIQUE NOT NULL
                                  REFERENCES users(id) ON DELETE CASCADE,
        company          TEXT    NOT NULL,
        company_bio      TEXT    DEFAULT '',
        website          TEXT    DEFAULT '',
        phone            TEXT    DEFAULT '',
        job_title        TEXT    DEFAULT '',
        company_size     TEXT    DEFAULT '',
        industry         TEXT    DEFAULT '',
        company_location TEXT    DEFAULT '',
        profile_photo    TEXT
    )
    """,

    # ── skills ───────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS skills (
        id          SERIAL PRIMARY KEY,
        name        TEXT   UNIQUE NOT NULL,
        category    TEXT   NOT NULL,
        description TEXT   DEFAULT ''
    )
    """,

    # ── user_skills ──────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS user_skills (
        id              SERIAL    PRIMARY KEY,
        user_id         INTEGER   NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
        skill_id        INTEGER   NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        verified        INTEGER   DEFAULT 0,
        score           INTEGER   DEFAULT 0,
        correct_answers INTEGER,
        time_taken_secs INTEGER,
        added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, skill_id)
    )
    """,

    # ── jobs ─────────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS jobs (
        id                   SERIAL    PRIMARY KEY,
        recruiter_id         INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title                TEXT      NOT NULL,
        company              TEXT      NOT NULL,
        location             TEXT      NOT NULL DEFAULT '',
        job_type             TEXT      NOT NULL DEFAULT 'Full-time',
        description          TEXT      NOT NULL,
        requirements         TEXT      DEFAULT '',
        salary_min           INTEGER   DEFAULT 0,
        salary_max           INTEGER   DEFAULT 0,
        active               INTEGER   DEFAULT 1,
        skill_test_mandatory INTEGER   DEFAULT 0,
        created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,

    # ── job_skills ───────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS job_skills (
        job_id   INTEGER NOT NULL REFERENCES jobs(id)   ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        PRIMARY KEY (job_id, skill_id)
    )
    """,

    # ── applications ─────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS applications (
        id           SERIAL    PRIMARY KEY,
        job_id       INTEGER   NOT NULL REFERENCES jobs(id)   ON DELETE CASCADE,
        candidate_id INTEGER   NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
        status       TEXT      DEFAULT 'applied',
        cover_letter TEXT      DEFAULT '',
        applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP,
        UNIQUE (job_id, candidate_id)
    )
    """,

    # ── candidate_work_experience ─────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS candidate_work_experience (
        id          SERIAL  PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company     TEXT    NOT NULL,
        designation TEXT    NOT NULL,
        start_date  TEXT    DEFAULT '',
        end_date    TEXT    DEFAULT '',
        is_current  INTEGER DEFAULT 0,
        description TEXT    DEFAULT ''
    )
    """,

    # ── candidate_education ──────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS candidate_education (
        id         SERIAL  PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        degree     TEXT    NOT NULL,
        college    TEXT    NOT NULL,
        start_year TEXT    DEFAULT '',
        end_year   TEXT    DEFAULT ''
    )
    """,

    # ── candidate_certifications ─────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS candidate_certifications (
        id             SERIAL  PRIMARY KEY,
        user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cert_name      TEXT    NOT NULL,
        issued_by      TEXT    DEFAULT '',
        year           TEXT    DEFAULT '',
        credential_url TEXT    DEFAULT ''
    )
    """,

    # ── candidate_projects ───────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS candidate_projects (
        id           SERIAL  PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_name TEXT    NOT NULL,
        domain       TEXT    DEFAULT '',
        description  TEXT    DEFAULT '',
        project_url  TEXT    DEFAULT '',
        year         TEXT    DEFAULT ''
    )
    """,

    # ── notifications ────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS notifications (
        id             SERIAL    PRIMARY KEY,
        candidate_id   INTEGER   NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
        job_id         INTEGER   REFERENCES jobs(id)                  ON DELETE SET NULL,
        application_id INTEGER   REFERENCES applications(id)          ON DELETE SET NULL,
        title          TEXT      NOT NULL,
        message        TEXT      NOT NULL,
        type           TEXT      DEFAULT 'general',
        is_read        INTEGER   DEFAULT 0,
        redirect_url   TEXT      DEFAULT '',
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,

    # ── skill_questions ──────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS skill_questions (
        id             SERIAL    PRIMARY KEY,
        skill_id       INTEGER   NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        question_text  TEXT      NOT NULL,
        option_a       TEXT      NOT NULL,
        option_b       TEXT      NOT NULL,
        option_c       TEXT      NOT NULL,
        option_d       TEXT      NOT NULL,
        correct_option TEXT      NOT NULL CHECK (correct_option IN ('A','B','C','D')),
        marks          INTEGER   DEFAULT 1,
        difficulty     TEXT      DEFAULT 'Medium' CHECK (difficulty IN ('Easy','Medium','Hard')),
        created_by     INTEGER   REFERENCES users(id) ON DELETE SET NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
]


# ── Column migrations ────────────────────────────────────────────────────────
# ADD COLUMN IF NOT EXISTS (PostgreSQL 9.6+) is a no-op when the column
# already exists — completely safe to run any number of times.

MIGRATION_STMTS = [
    # users — email verification columns
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified                INTEGER   DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at             TIMESTAMP",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_sent_at    TIMESTAMP",
    # change default on existing column so new signups default to unverified
    "ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT 0",
    # candidate_profiles
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS location            TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS linkedin            TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS github              TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS phone               TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS job_title           TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS experience          TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS resume_filename     TEXT",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS work_status         TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS work_mode           TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS notice_period       TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS expected_salary     TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS willing_to_relocate INTEGER DEFAULT 0",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS gender              TEXT    DEFAULT ''",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS differently_abled   TEXT    DEFAULT 'no'",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS profile_photo       TEXT",
    # recruiter_profiles
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS phone            TEXT DEFAULT ''",
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS job_title        TEXT DEFAULT ''",
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS company_size     TEXT DEFAULT ''",
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS industry         TEXT DEFAULT ''",
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS company_location TEXT DEFAULT ''",
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS profile_photo    TEXT",
    # jobs
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements         TEXT    DEFAULT ''",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS active               INTEGER DEFAULT 1",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skill_test_mandatory INTEGER DEFAULT 0",
    # applications
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP",
    # candidate_profiles — resume + photo stored as base64 in DB (ephemeral filesystem fix)
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS resume_data          TEXT DEFAULT NULL",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS resume_original_name TEXT DEFAULT NULL",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS profile_photo_data   TEXT DEFAULT NULL",
    "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS profile_photo_mime   TEXT DEFAULT NULL",
    # recruiter_profiles — photo stored as base64 in DB
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS profile_photo_data   TEXT DEFAULT NULL",
    "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS profile_photo_mime   TEXT DEFAULT NULL",
    # user_skills
    "ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS correct_answers   INTEGER",
    "ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS time_taken_secs   INTEGER",
    "ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS terminated_reason TEXT DEFAULT NULL",
    # candidate_projects
    "ALTER TABLE candidate_projects ADD COLUMN IF NOT EXISTS year TEXT DEFAULT ''",
    # notifications
    "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS redirect_url TEXT DEFAULT ''",
    # skill_questions — experience level filter
    "ALTER TABLE skill_questions ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'All'",
]


# ── Indexes ──────────────────────────────────────────────────────────────────

INDEX_STMTS = [
    "CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email)",
    "CREATE INDEX IF NOT EXISTS idx_users_role              ON users(role)",
    "CREATE INDEX IF NOT EXISTS idx_users_token_hash        ON users(email_verification_token_hash)",
    "CREATE INDEX IF NOT EXISTS idx_candidate_profiles_uid  ON candidate_profiles(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_uid  ON recruiter_profiles(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_skills_user        ON user_skills(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_skills_skill       ON user_skills(skill_id)",
    "CREATE INDEX IF NOT EXISTS idx_jobs_recruiter          ON jobs(recruiter_id)",
    "CREATE INDEX IF NOT EXISTS idx_jobs_active             ON jobs(active)",
    "CREATE INDEX IF NOT EXISTS idx_applications_job        ON applications(job_id)",
    "CREATE INDEX IF NOT EXISTS idx_applications_candidate  ON applications(candidate_id)",
    "CREATE INDEX IF NOT EXISTS idx_notifications_candidate ON notifications(candidate_id)",
    "CREATE INDEX IF NOT EXISTS idx_notifications_unread    ON notifications(candidate_id, is_read)",
    "CREATE INDEX IF NOT EXISTS idx_skill_questions_skill   ON skill_questions(skill_id)",
]


# ── Skills seed data ─────────────────────────────────────────────────────────
# Inserted with ON CONFLICT DO NOTHING — existing rows are never touched.

SKILLS_DATA = [
    ("Python",            "Programming", "General-purpose programming language"),
    ("JavaScript",        "Programming", "Web scripting language"),
    ("Java",              "Programming", "Object-oriented programming language"),
    ("TypeScript",        "Programming", "Typed superset of JavaScript"),
    ("C++",               "Programming", "Systems programming language"),
    ("Go",                "Programming", "Compiled systems language"),
    ("Rust",              "Programming", "Memory-safe systems language"),
    ("React",             "Frontend",    "JavaScript UI library"),
    ("Vue.js",            "Frontend",    "Progressive JavaScript framework"),
    ("Angular",           "Frontend",    "TypeScript-based web framework"),
    ("HTML/CSS",          "Frontend",    "Web markup and styling"),
    ("Tailwind CSS",      "Frontend",    "Utility-first CSS framework"),
    ("Node.js",           "Backend",     "JavaScript runtime"),
    ("Django",            "Backend",     "Python web framework"),
    ("Flask",             "Backend",     "Lightweight Python web framework"),
    ("FastAPI",           "Backend",     "Modern Python API framework"),
    ("Spring Boot",       "Backend",     "Java web framework"),
    ("REST APIs",         "Backend",     "RESTful API development"),
    ("GraphQL",           "Backend",     "Query language for APIs"),
    ("SQL",               "Database",    "Structured query language"),
    ("PostgreSQL",        "Database",    "Advanced open-source database"),
    ("MySQL",             "Database",    "Popular relational database"),
    ("MongoDB",           "Database",    "Document-oriented NoSQL database"),
    ("Redis",             "Database",    "In-memory data structure store"),
    ("AWS",               "Cloud",       "Amazon Web Services"),
    ("Azure",             "Cloud",       "Microsoft Azure"),
    ("GCP",               "Cloud",       "Google Cloud Platform"),
    ("Docker",            "DevOps",      "Containerization platform"),
    ("Kubernetes",        "DevOps",      "Container orchestration"),
    ("CI/CD",             "DevOps",      "Continuous integration and deployment"),
    ("Machine Learning",  "AI/ML",       "Statistical learning algorithms"),
    ("Deep Learning",     "AI/ML",       "Neural network-based learning"),
    ("Data Analysis",     "Data",        "Statistical data examination"),
    ("Data Visualization","Data",        "Graphical data representation"),
    ("Selenium",          "Testing",     "Web automation testing"),
    ("Jest",              "Testing",     "JavaScript testing framework"),
    ("PyTest",            "Testing",     "Python testing framework"),
    ("Playwright",        "Testing",     "Modern end-to-end browser testing framework"),
    ("Appium",            "Testing",     "Mobile app automation testing framework"),
    ("API Testing",       "Testing",     "REST and GraphQL API testing"),
    ("Manual Testing",    "Testing",     "Manual software quality assurance"),
    ("Cypress",           "Testing",     "Fast, reliable end-to-end testing for the web"),
    ("TestNG",            "Testing",     "Java testing framework inspired by JUnit"),
    ("Git",               "Tools",       "Version control system"),
    ("Linux",             "Tools",       "Open-source operating system"),
    ("Agile/Scrum",       "Methodology", "Agile project management"),
]


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    conn = None
    try:
        print("Connecting to PostgreSQL…")
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        cur = conn.cursor()

        # ── Step 1: Create tables ──────────────────────────────────────────
        print("\n[1/4] Creating tables…")
        for stmt in TABLE_STMTS:
            cur.execute(stmt)
        print(f"      ✓  {len(TABLE_STMTS)} tables ensured")

        # ── Step 2: Run column migrations ─────────────────────────────────
        print("\n[2/4] Applying column migrations…")
        for stmt in MIGRATION_STMTS:
            cur.execute(stmt)
        print(f"      ✓  {len(MIGRATION_STMTS)} ALTER TABLE statements applied")

        # ── Step 3: Create indexes ─────────────────────────────────────────
        print("\n[3/4] Creating indexes…")
        for stmt in INDEX_STMTS:
            cur.execute(stmt)
        print(f"      ✓  {len(INDEX_STMTS)} indexes ensured")

        # ── Step 4: Seed skills ────────────────────────────────────────────
        print("\n[4/4] Seeding skills catalogue…")
        cur.executemany(
            """
            INSERT INTO skills (name, category, description)
            VALUES (%s, %s, %s)
            ON CONFLICT (name) DO NOTHING
            """,
            SKILLS_DATA,
        )
        inserted = cur.rowcount
        print(f"      ✓  {inserted} new skill(s) inserted  "
              f"({len(SKILLS_DATA) - inserted} already existed — left unchanged)")

        conn.commit()

        # ── Final summary ──────────────────────────────────────────────────
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        tables = [row[0] for row in cur.fetchall()]
        print("\n── Tables in database ───────────────────────────────────")
        for t in tables:
            print(f"   • {t}")
        print(f"─────────────────────────────────────────────────────────")
        print(f"\n✓  Done. {len(tables)} tables present. No existing data was modified.\n")

    except psycopg2.OperationalError as e:
        print(f"\n✗  Could not connect to the database:\n   {e}")
        print("   Check that DATABASE_URL is correct and the database is reachable.")
        sys.exit(1)
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"\n✗  Migration failed: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
