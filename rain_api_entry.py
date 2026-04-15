"""
PyInstaller/Tauri sidecar entrypoint.

This module starts the FastAPI server (defined in app.py) via uvicorn.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
import uvicorn


def main() -> None:
    # Load environment variables from `.env` if present (useful for packaged builds).
    load_dotenv()
    data_dir = os.getenv("TEACHER_COPILOT_DATA_DIR")
    if data_dir:
        load_dotenv(Path(data_dir) / ".env")

    host = os.getenv("TEACHER_COPILOT_HOST", "127.0.0.1")
    port = int(os.getenv("TEACHER_COPILOT_PORT", "8010"))

    # In packaged builds we don't want reload by default.
    reload_enabled = os.getenv("TEACHER_COPILOT_RELOAD", "0") == "1"

    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=reload_enabled,
        log_level=os.getenv("TEACHER_COPILOT_LOG_LEVEL", "info"),
    )


if __name__ == "__main__":
    main()
