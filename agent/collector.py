import psutil
from datetime import datetime
import time

def get_system_data():

    timestamp=datetime.now().isoformat()
    boot_time=psutil.boot_time()
    uptime_hours = (time.time() - boot_time) / 3600 #60x60 => seconds to hours
    cpu_usage = psutil.cpu_percent()
    cpu_cores = psutil.cpu_count(logical=False)
    cpu_threads = psutil.cpu_count(logical=True)

    memory_info = psutil.virtual_memory()
    total_gb = memory_info.total / (1024 ** 3)
    available_gb = memory_info.available / (1024 ** 3)
    used_gb = memory_info.used / (1024 ** 3)
    percentage = memory_info.percent

    disk = psutil.disk_usage('/')

    disk_total_gb = disk.total / (1024 ** 3)
    disk_used_gb = disk.used / (1024 ** 3)
    disk_free_gb = disk.free / (1024 ** 3)
    disk_percent = disk.percent



    return {
        "timestamp": timestamp,

        "cpu": {
            "usage_percent": cpu_usage,
            "cores": cpu_cores,
            "threads": cpu_threads
        },
        "memory": {
            "total_gb": round(total_gb,2),
            "available_gb": round(available_gb,2),
            "used_gb": round(used_gb,2),
            "percentage": percentage
        },
        "disk": {
            "total_gb": round(disk_total_gb,2),
            "used_gb": round(disk_used_gb,2),
            "free_gb": round(disk_free_gb,2),
            "percentage": disk_percent
        },
        "uptime": {
            "hours": uptime_hours
        }
    }