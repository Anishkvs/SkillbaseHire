import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set in .env file")

# Connection pool for better performance
class DatabasePool:
    _pool = None
    
    @classmethod
    def get_pool(cls):
        if cls._pool is None:
            try:
                cls._pool = SimpleConnectionPool(1, 20, DATABASE_URL)
                print("✓ Database connection pool created")
            except Exception as e:
                print(f"✗ Failed to create connection pool: {e}")
                raise
        return cls._pool
    
    @classmethod
    def get_connection(cls):
        """Get a connection from the pool"""
        try:
            pool = cls.get_pool()
            return pool.getconn()
        except Exception as e:
            print(f"✗ Database connection error: {e}")
            raise
    
    @classmethod
    def release_connection(cls, conn):
        """Return a connection to the pool"""
        if conn:
            pool = cls.get_pool()
            pool.putconn(conn)
    
    @classmethod
    def close_all(cls):
        """Close all connections in pool"""
        if cls._pool:
            cls._pool.closeall()

def get_db():
    """Get database connection"""
    return DatabasePool.get_connection()

def close_db(conn):
    """Release database connection"""
    DatabasePool.release_connection(conn)

def execute_query(query, params=None):
    """Execute SELECT query and return results as list of dictionaries"""
    conn = None
    try:
        conn = get_db()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params or ())
            results = cur.fetchall()
            return results
    except Exception as e:
        print(f"Query error: {e}")
        raise
    finally:
        if conn:
            close_db(conn)

def execute_update(query, params=None):
    """Execute INSERT/UPDATE/DELETE and return affected rows"""
    conn = None
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            conn.commit()
            return cur.rowcount
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Update error: {e}")
        raise
    finally:
        if conn:
            close_db(conn)

def get_last_insert_id(query, params=None):
    """Execute INSERT with RETURNING and get the ID"""
    conn = None
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Insert error: {e}")
        raise
    finally:
        if conn:
            close_db(conn)

def init_db():
    """Initialize database schema"""
    conn = None
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('candidate','recruiter')),
                    email_verified INTEGER DEFAULT 0,
                    verification_token TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS candidate_profiles (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER UNIQUE NOT NULL,
                    headline TEXT DEFAULT '',
                    bio TEXT DEFAULT '',
                    skills TEXT DEFAULT '',
                    phone TEXT DEFAULT '',
                    job_title TEXT DEFAULT '',
                    experience TEXT DEFAULT '',
                    resume_filename TEXT,
                    work_status TEXT DEFAULT '',
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS recruiter_profiles (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER UNIQUE NOT NULL,
                    company TEXT NOT NULL,
                    company_bio TEXT DEFAULT '',
                    website TEXT DEFAULT '',
                    phone TEXT DEFAULT '',
                    job_title TEXT DEFAULT '',
                    company_size TEXT DEFAULT '',
                    industry TEXT DEFAULT '',
                    company_location TEXT DEFAULT '',
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS jobs (
                    id SERIAL PRIMARY KEY,
                    recruiter_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    company TEXT NOT NULL,
                    location TEXT DEFAULT '',
                    job_type TEXT DEFAULT '',
                    salary_min INTEGER,
                    salary_max INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS skills (
                    id SERIAL PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL,
                    category TEXT DEFAULT '',
                    description TEXT DEFAULT ''
                );

                CREATE TABLE IF NOT EXISTS job_skills (
                    job_id INTEGER NOT NULL,
                    skill_id INTEGER NOT NULL,
                    PRIMARY KEY (job_id, skill_id),
                    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS applications (
                    id SERIAL PRIMARY KEY,
                    job_id INTEGER NOT NULL,
                    candidate_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'applied',
                    cover_letter TEXT DEFAULT '',
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(job_id, candidate_id),
                    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
                );

                -- Create indexes for performance
                CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
                CREATE INDEX IF NOT EXISTS idx_candidate_user ON candidate_profiles(user_id);
                CREATE INDEX IF NOT EXISTS idx_recruiter_user ON recruiter_profiles(user_id);
                CREATE INDEX IF NOT EXISTS idx_job_recruiter ON jobs(recruiter_id);
                CREATE INDEX IF NOT EXISTS idx_application_job ON applications(job_id);
                CREATE INDEX IF NOT EXISTS idx_application_candidate ON applications(candidate_id);
            ''')
            conn.commit()
            print("✓ Database schema initialized successfully!")
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"✗ Error initializing database: {e}")
        raise
    finally:
        if conn:
            close_db(conn)
