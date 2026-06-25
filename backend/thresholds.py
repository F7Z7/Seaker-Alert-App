from itertools import islice

from backend.database import get_db_connection


def load_threshold():
    conn=get_db_connection()
    cursor=conn.cursor()

    data = conn.execute('SELECT * FROM thresholds').fetchall()

    return islice(data.items(), 1, 4)