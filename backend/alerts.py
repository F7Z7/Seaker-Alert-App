from backend.thresholds import load_threshold
from backend.telegrarm_alert import  send_alert

last_alert = {
    "cpu": False,
    "memory": False,
    "disk": False
}

def check_thresholds(data):
    # print("ivde")
    cpu_t, mem_t, disk_t = load_threshold()

    cpu = data["cpu"]["usage_percent"]
    mem = data["memory"]["percentage"]
    disk = data["disk"]["percentage"]
    # print("hey1")
    if cpu > cpu_t:
        # print("hey2")
        if not last_alert["cpu"]:
            # print("hey3")
            send_alert(
                f" CPU usage exceeded threshold\nCurrent: {cpu}%\nThreshold: {cpu_t}%"
            )
            last_alert["cpu"] = True
    else:
        last_alert["cpu"] = False

    if mem > mem_t:
        if not last_alert["memory"]:
            send_alert(
                f" Memory usage exceeded threshold\nCurrent: {mem}%\nThreshold: {mem_t}%"
            )
            last_alert["memory"] = True
    else:
        last_alert["memory"] = False

    if disk > disk_t:
        if not last_alert["disk"]:
            send_alert(
                f" Disk usage exceeded threshold\nCurrent: {disk}%\nThreshold: {disk_t}%"
            )
            last_alert["disk"] = True
    else:
        last_alert["disk"] = False