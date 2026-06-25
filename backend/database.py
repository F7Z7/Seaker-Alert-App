import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

DB_LOCATION = os.path.join(DATA_DIR, "system_data.db")


def get_db_connection():
    conn = sqlite3.connect(DB_LOCATION, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn
def init_db():
    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS system_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        cpu_usage REAL,
        cpu_cores INTEGER,
        cpu_threads INTEGER,
        memory_total_gb REAL,
        memory_available_gb REAL,
        memory_used_gb REAL,
        memory_percentage REAL,
        disk_total_gb REAL,
        disk_used_gb REAL,
        disk_free_gb REAL,
        disk_percentage REAL,
        uptime_hours REAL
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS thresholds(
        id INTEGER PRIMARY KEY,
        cpu INTEGER,
        memory INTEGER,
        disk INTEGER
    )
    ''')

    cursor.execute("SELECT COUNT(*) FROM thresholds")
    count = cursor.fetchone()[0]

    if count == 0:
        cursor.execute("""
        INSERT INTO thresholds(cpu,memory,disk)
        VALUES(80,80,90)
        """)

    conn.commit()
    conn.close()
