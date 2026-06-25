from itertools import islice

from backend.database import get_db_connection


def load_threshold():
    conn=get_db_connection()
    cursor=conn.cursor()

    data = conn.execute('SELECT * FROM thresholds').fetchone()
    conn.close()

    return data["cpu"], data["memory"], data["disk"]