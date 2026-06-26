# System Monitor & Alert App

A lightweight, full-stack real-time system monitoring and alerting application. The project tracks critical hardware metrics (CPU, Memory, Disk, and Uptime), stores them in a persistent SQLite database, visualizes current stats and historical trends via a sleek frontend dashboard, and dispatches instant Telegram notifications if customizable resource thresholds are exceeded.

---

## Features

- **Real-Time Dashboard**: Displays continuous live stats for CPU usage (cores/threads), Memory (total, used, available), and Disk space alongside dynamic progress bars.
- **Historical Metrics Charting**: Integrated interactive line charts rendering historical data points for both CPU and Memory parameters.
- **Configurable Thresholds**: Interactive panel allows operators to define custom limits for CPU, Memory, and Disk usage directly from the UI.
- **Automated Telegram Alerts**: Back-end evaluation logic cross-references incoming metrics against thresholds, sending instant critical updates via the Telegram Bot API while filtering out duplicate repetitive alerts.
- **Daemon Metrics Collector**: A continuous background worker utilizing `psutil` captures telemetry data independently at regular intervals without blocking the main web server thread.
- **Persistent Time-Series Database**: SQLite database schema architecture automatically preserves historical captures and stores persistent application settings.
- **Containerized Deployment**: Fully Dockerized wrapper allows seamless provisioning across diverse environments out of the box.

---

## Architecture Overview

```text
       ┌────────────────────────────────────────┐
       │           Frontend Client              │
       │   (Vanilla JS / Chart.js / HTML5)     │
       └───────────────────┬────────────────────┘
                           │
                 REST API (JSON / HTTP)
                           │
       ┌───────────────────▼────────────────────┐
       │            Flask Backend               │
       │    (Routing, Controllers & Threading)  │
       └─────┬────────────────────────────┬─────┘
             │                            │
    Spawns Daemon Thread            Reads / Writes
             │                            │
┌────────────▼─────────────┐    ┌─────────▼─────────────┐
│ Background Collector     │    │ SQLite Database       │
│ (psutil System Telemetry)│    │ (system_data.db)      │
└────────────┬─────────────┘    └───────────────────────┘
             │
   Evaluates Thresholds
             │
┌────────────▼─────────────┐
│ Telegram Notification API│
│ (Instant External Alert) │
└──────────────────────────┘
```

---

## Technical Stack

- **Backend**: Python 3.12, Flask
- **Telemetry Extraction**: `psutil`
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript (ES6+), Chart.js, HTML5, CSS3
- **Alert Dispatcher**: Telegram Bot API
- **Containerization**: Docker

---

## Installation & Local Setup

### Prerequisites
- Python 3.12+ installed locally.
- A Telegram account to configure alert notifications.

### Steps

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/yourusername/seaker-alert-app.git](https://github.com/yourusername/seaker-alert-app.git)
   cd seaker-alert-app
   ```

2. **Establish Environment Properties** Create a `.env` file inside the root workspace folder to configure your Telegram Bot credentials:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   CHAT_ID=your_telegram_chat_or_channel_id_here
   ```

3. **Install Dependencies** Set up a virtual environment and run pip installer:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Boot the Monitor Engine** Execute the wrapper file to automatically initialize the schema and spin up background processing:
   ```bash
   python run.py
   ```
   The interactive system dashboard will now be reachable at `http://localhost:5000`.

---

## Docker Setup Instructions

A preconfigured multi-stage build setup maps dependencies container-side.

1. **Build the Container Image**
   ```bash
   docker build -t seaker-alert-app .
   ```

2. **Execute the Application Container** Pass environmental runtime variables explicitly during initialization:
   ```bash
   docker run -d \
     -p 5000:5000 \
     -e BOT_TOKEN="your_telegram_bot_token_here" \
     -e CHAT_ID="your_telegram_chat_or_channel_id_here" \
     --name system-monitor \
     seaker-alert-app
   ```

---

## API Endpoints Documentation

### 1. Fetch Current Infrastructure Matrix
- **Endpoint**: `/api/latest`
- **Method**: `GET`
- **Description**: Evaluates and responds with the latest written entry representing live system parameters.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "id": 142,
    "timestamp": "2026-06-26T10:45:00.123456",
    "cpu_usage": 14.5,
    "cpu_cores": 8,
    "cpu_threads": 16,
    "memory_total_gb": 16.00,
    "memory_used_gb": 7.42,
    "memory_available_gb": 8.58,
    "memory_percentage": 46.4,
    "disk_total_gb": 512.00,
    "disk_used_gb": 210.50,
    "disk_free_gb": 301.50,
    "disk_percentage": 41.1,
    "uptime_hours": 24.5
  }
  ```

### 2. Query Historical Time-Series Logs
- **Endpoint**: `/api/history`
- **Method**: `POST`
- **Description**: Returns a structured sequence of historical records up to a designated cap value.
- **Payload Shape**:
  ```json
  { "count": 15 }
  ```
- **Response Shape (`200 OK`)**:
  ```json
  [
    {
      "timestamp": "2026-06-26T10:44:59.000",
      "cpu_usage": 12.1,
      "memory_percentage": 46.3,
      "disk_percentage": 41.1,
      "memory_used_gb": 7.41,
      "disk_free_gb": 301.50,
      "uptime_hours": 24.5
    }
  ]
  ```

### 3. Retrieve Configured Threshold Specifications
- **Endpoint**: `/api/thresholds`
- **Method**: `GET`
- **Description**: Queries active performance boundaries utilized for trigger notifications.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "id": 1,
    "cpu": 80,
    "memory": 80,
    "disk": 90
  }
  ```

### 4. Update Critical Performance Thresholds
- **Endpoint**: `/api/thresholds`
- **Method**: `POST`
- **Description**: Updates application-wide warning parameters inside persistent database tables.
- **Payload Shape**:
  ```json
  {
    "cpu": 85,
    "memory": 75,
    "disk": 92
  }
  ```

---

## Alert System Explanation

The system maintains a dedicated daemon service checking telemetry markers dynamically every second against boundaries persisted inside the target SQLite space.  
To prevent alerting noise, the back-end alert pipeline utilizes state tracking flags (`last_alert`):

- When a metric value surpasses a custom defined threshold, the engine validates if a notice has already been dispatched.
- If `last_alert[metric]` is evaluated as `False`, an immediate formatting payload issues out cleanly through downstream network requests toward Telegram's API gateways.
- The tracking state updates immediately to prevent repetitive messaging loops.
- Once the resource profile drops back into acceptable operating levels, state configurations toggle off automatically.

---

## Usage Instructions

- **Dashboard Monitoring**: Open up the application interface inside your web browser. Progress indicators dynamically reflect threshold states using reactive color mapping rules (Green indicating healthy state, Yellow indicating Warning state, and Red highlighting Critical territory).
- **Log Traversal**: Use the dropdown filter component within the logs table viewport area to load specific historical slices on demand.
- **Threshold Alteration**: Key in structural modifications within the configurations module, then push the `Save Thresholds` button to dynamically update engine settings across the backend without restarting the system.

---

## Future Improvements

- [ ] Introduce secure token-based user authentication and multi-user profile configurations.
- [ ] Incorporate asynchronous WebSocket infrastructure paths for sub-second frontend synchronization layers.
- [ ] Expand telemetry instrumentation capturing network input/output bandwidth rates alongside specific process identifiers.
- [ ] Implement query engine aggregations to handle automatic historical data rotation strategies.

---

## Author

Developed by **Farzan R S**.
```