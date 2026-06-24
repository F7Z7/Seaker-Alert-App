from flask import Flask,jsonify,render_template

from agent.collector import get_system_data
from backend.database import init_db, get_db_connection

init_db()  # this is for first time creation of tables

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")
@app.route('/api/system_data', methods=['GET'])
def system_data():
    data = get_system_data()

    save_system_data(data)
    return data, 200


def save_system_data(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO system_data (
        timestamp,
        cpu_usage,
        cpu_cores,
        cpu_threads,
        memory_total_gb,
        memory_available_gb,
        memory_used_gb,
        memory_percentage,
        disk_total_gb,
        disk_used_gb,
        disk_free_gb,
        disk_percentage,
        uptime_hours
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
        data['timestamp'],
        data['cpu']['usage_percent'],
        data['cpu']['cores'],
        data['cpu']['threads'],
        data['memory']['total_gb'],
        data['memory']['available_gb'],
        data['memory']['used_gb'],
        data['memory']['percentage'],
        data['disk']['total_gb'],
        data['disk']['used_gb'],
        data['disk']['free_gb'],
        data['disk']['percentage'],
        data['uptime']['hours']
    ))

    conn.commit()
    conn.close()


@app.route("/api/history", methods=["GET"])
def get_prevdatas():
    conn = get_db_connection()
    cursor = conn.cursor()

    # for prev data=>mostly for plotting - last 5 datas
    cursor.execute('''
        SELECT *
FROM system_data
ORDER BY timestamp DESC
LIMIT 10
        ''')

    rows=cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])


@app.route("/api/latest", methods=["GET"])
def get_current_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    # last entered data for current dashboard
    cursor.execute('''
    SELECT * FROM  system_data 
    ORDER BY TIMESTAMP DESC
    LIMIT 1
    
    ''')
    row = cursor.fetchone()
    conn.close()

    return jsonify(row)

if __name__ == "__main__":
    app.run(debug=True)
