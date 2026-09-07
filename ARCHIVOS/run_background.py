from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

from waitress import serve

from app import app
from database_web import backup_database_once_daily, db_path, ensure_schema
from hikvision_connector import start_background_sync

APP_VERSION = "11.6"
PORT = 5000


def runtime_dir() -> Path:
    local = os.environ.get("LOCALAPPDATA", "").strip()
    base = Path(local) / "GestionNavalTallerAngulo" if local else Path(__file__).resolve().parent / "data"
    base.mkdir(parents=True, exist_ok=True)
    return base


def log_line(message: str) -> None:
    path = runtime_dir() / "servidor.log"
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with path.open("a", encoding="utf-8") as fh:
            fh.write(f"[{stamp}] {message}\n")
    except OSError:
        pass


def is_server_running() -> bool:
    try:
        with urlopen(f"http://127.0.0.1:{PORT}/estado", timeout=1.5) as response:
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
        return bool(payload.get("ok"))
    except Exception:
        return False


def write_pid() -> Path:
    pid_path = runtime_dir() / "server.pid"
    pid_path.write_text(str(os.getpid()), encoding="ascii")
    return pid_path


def cleanup_pid(pid_path: Path) -> None:
    try:
        if pid_path.exists() and pid_path.read_text(encoding="ascii").strip() == str(os.getpid()):
            pid_path.unlink()
    except OSError:
        pass


def main() -> int:
    if is_server_running():
        return 0

    pid_path = write_pid()
    try:
        backup_database_once_daily()
        ensure_schema()
        start_background_sync()
        log_line(f"Servidor ANGULO V{APP_VERSION} iniciado. Base: {db_path()}")
        serve(app, host="0.0.0.0", port=PORT, threads=8)
        return 0
    except Exception as exc:
        log_line(f"ERROR del servidor: {type(exc).__name__}: {exc}")
        return 1
    finally:
        cleanup_pid(pid_path)


if __name__ == "__main__":
    raise SystemExit(main())
