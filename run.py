import threading

from backend.app import app, collector
from backend.database import init_db

if __name__ == "__main__":
    init_db()  # this is for first time creation of tables
    t=threading.Thread(target=collector,daemon=True)
    t.start()
    app.run(debug=True, use_reloader=False)

