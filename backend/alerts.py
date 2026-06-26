import time
from backend.thresholds import load_threshold
from backend.telegrarm_alert import send_alert

COOLDOWN = 120  # seconds (2 minutes)

last_alert = {
    "cpu": 0,
    "memory": 0,
    "disk": 0
}


def can_send_alert(component):
    current_time = time.time()

    if current_time - last_alert[component] >= COOLDOWN:
        last_alert[component] = current_time
        return True

    return False


def check_thresholds(data):
    cpu_t, mem_t, disk_t = load_threshold()

    cpu = data["cpu"]["usage_percent"]
    mem = data["memory"]["percentage"]
    disk = data["disk"]["percentage"]

    # CPU
    if cpu > cpu_t and can_send_alert("cpu"):
        send_alert(
            f" CPU usage exceeded threshold\n"
            f"Current: {cpu}%\n"
            f"Threshold: {cpu_t}%"
        )

    # Memory
    if mem > mem_t and can_send_alert("memory"):
        send_alert(
            f" Memory usage exceeded threshold\n"
            f"Current: {mem}%\n"
            f"Threshold: {mem_t}%"
        )

    # Disk
    if disk > disk_t and can_send_alert("disk"):
        send_alert(
            f" Disk usage exceeded threshold\n"
            f"Current: {disk}%\n"
            f"Threshold: {disk_t}%"
        )