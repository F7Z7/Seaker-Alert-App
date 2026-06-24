import time

from backend.database import get_db_connection

conn = get_db_connection()

data = conn.execute('SELECT * FROM system_data').fetchall()

# print("hey")

print(f"row length {len(data)}")
# for row in data:
#     print(dict(row))
# rows_before = len(data)

# time.sleep(10)
#
# rows_after = len(conn.execute(
#     "SELECT * FROM system_data"
# ).fetchall())

# print(rows_after - rows_before)

conn.close()