import time

from flask import Flask,jsonify,render_template,request

from agent.collector import get_system_data
from backend.alerts import check_thresholds
from backend.database import init_db, get_db_connection
import threading


app = Flask(__name__)


def collector():
    while True:
        data = get_system_data()
        save_system_data(data)
        check_thresholds(data)
        time.sleep(1)



@app.route("/")
def home():
    return render_template("index.html")
# @app.route('/api/system_data', methods=['GET'])



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


@app.route("/api/history", methods=["POST"])
def get_prevdatas():
    data = request.get_json()

    limit = int(data.get("count", 10))

    print("limit =", limit)

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT *
    FROM system_data
    ORDER BY timestamp DESC
    LIMIT ?
    """

    print("QUERY:")
    print(query)

    cursor.execute(query, (limit,))

    rows = cursor.fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])
@app.route("/api/latest", methods=["GET"])
def get_current_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    #
    # data=get_system_data()
    # save_system_data(data)
    # last entered data for current dashboard
    cursor.execute('''
    SELECT * FROM  system_data 
    ORDER BY TIMESTAMP DESC
    LIMIT 1
    
    ''')
    row = cursor.fetchone()
    conn.close()

    return jsonify(dict(row))

@app.route("/api/thresholds", methods=["GET"])
def get_thresholds():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM thresholds
        LIMIT 1
    """)

    row = cursor.fetchone()

    conn.close()

    return jsonify(dict(row))

@app.route("/api/thresholds", methods=["POST"])
def save_thresholds():

    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE thresholds
        SET cpu=?,
            memory=?,
            disk=?
        WHERE id=1
    """,
    (
        data["cpu"],
        data["memory"],
        data["disk"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Thresholds updated"
    })



if __name__ == "__main__":
    init_db()  # this is for first time creation of tables
    t=threading.Thread(target=collector,daemon=True)
    t.start()
    app.run(debug=True, use_reloader=False)


