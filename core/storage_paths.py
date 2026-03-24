from __future__ import annotations

import os
import sys
from pathlib import Path


def get_data_dir() -> Path:
    override = os.getenv("TEACHER_COPILOT_DATA_DIR")
    if override:
        return Path(override)
    default_dir = Path(__file__).resolve().parent.parent / "data"
    if getattr(sys, "frozen", False) or not os.access(default_dir, os.W_OK):
        if os.name == "nt":
            base = Path(os.getenv("APPDATA", Path.home() / "AppData" / "Roaming"))
        elif sys.platform == "darwin":
            base = Path.home() / "Library" / "Application Support"
        else:
            base = Path(os.getenv("XDG_DATA_HOME", Path.home() / ".local" / "share"))
        return base / "TeacherCopilot"
    return default_dir
