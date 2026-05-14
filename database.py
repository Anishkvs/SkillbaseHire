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
    """Initialize database schema — delegates to init_db.py statement lists."""
    import init_db as _schema
    conn = None
    try:
        conn = get_db()
        with conn.cursor() as cur:
            for stmt in _schema.TABLE_STMTS:
                cur.execute(stmt)
            for stmt in _schema.MIGRATION_STMTS:
                cur.execute(stmt)
            for stmt in _schema.INDEX_STMTS:
                cur.execute(stmt)
            cur.executemany(
                "INSERT INTO skills (name, category, description) VALUES (%s, %s, %s)"
                " ON CONFLICT (name) DO NOTHING",
                _schema.SKILLS_DATA,
            )
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
