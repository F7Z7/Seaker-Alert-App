import time

from backend.database import get_db_connection

conn = get_db_connection()
cursor=conn.cursor()

data = cursor.execute('''
    SELECT * FROM thresholds
    ''').fetchone()

# print("hey")

print(f"row length {len(data)}")
print(data["cpu"], data["memory"], data["disk"])
# rows_before = len(data)

# time.sleep(10)
#
# rows_after = len(conn.execute(
#     "SELECT * FROM system_data"
# ).fetchall())

# print(rows_after - rows_before)

conn.close()