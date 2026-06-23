import sqlite3

def get_db_connection():
    conn = sqlite3.connect("device_statistics.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS system_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,cpu_usage REAL,
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

    conn.commit()
    conn.close()