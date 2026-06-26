import csv
import io
import json
import time

from flask import Flask,jsonify,render_template,request,send_file

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

@app.route("/api/chart-data")
def chart_data():
    conn=get_db_connection()
    cursor=conn.cursor()
    cursor.execute('''
    SELECT timestamp,cpu_usage ,memory_percentage
    FROM system_data
    ORDER BY timestamp DESC
    LIMIT 30
    ''')

    rows=cursor.fetchall()
    conn.close()

    rows=list(reversed(rows))

    return jsonify([
        {
            "timestamp": row["timestamp"],
            "cpu_usage": row["cpu_usage"],
            "memory_usage": row["memory_percentage"],
        }
        for row in rows
    ])

@app.route("/api/export",methods=["POST"])
def export_data():
    data=request.get_json()
    count=data["count"]
    export_type=data["type"]

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT *
    FROM system_data
    ORDER BY timestamp DESC
    LIMIT ?
    ''',(count,))

    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    if export_type == "csv":
        output = io.StringIO()

        writer = csv.DictWriter(
            output,
            fieldnames=rows[0].keys()
        )

        writer.writeheader()
        writer.writerows(rows)

        mem = io.BytesIO()
        mem.write(output.getvalue().encode())
        mem.seek(0)

        return send_file(
            mem,
            mimetype="text/csv",
            as_attachment=True,
            download_name="system_logs.csv"
        )

    elif export_type == "json":

        mem = io.BytesIO()

        mem.write(
            json.dumps(
                rows,
                indent=4
            ).encode("utf-8")
        )

        mem.seek(0)

        return send_file(
            mem,
            mimetype="application/json",
            as_attachment=True,
            download_name="system_logs.json"
        )

    return jsonify({"error": "Invalid export type"}), 400



