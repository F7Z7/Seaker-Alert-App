from backend.database import init_db,get_db_connection
from agent.collector import get_system_data
from flask import Flask

init_db() #this is for first time creation of tables

app=Flask(__name__)


@app.route('/api/system_data', methods=['GET'])
def system_data():
    data = get_system_data()

    save_system_data(data)
    return data, 200

def save_system_data(data):
    conn = get_db_connection()
    cursor=conn.cursor()
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



if __name__ == "__main__":
    app.run(debug=True)