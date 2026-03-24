from __future__ import annotations

import json
from typing import List

from core.storage_paths import get_data_dir

DATA_DIR = get_data_dir()
STUDENTS_PATH = DATA_DIR / "students.json"


def _ensure_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_students() -> List[dict]:
    _ensure_dir()
    if not STUDENTS_PATH.exists():
        return []
    try:
        return json.loads(STUDENTS_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_students(entries: List) -> None:
    _ensure_dir()
    data = []
    for entry in entries:
        if hasattr(entry, "model_dump"):
            data.append(entry.model_dump())
        elif isinstance(entry, dict):
            data.append(entry)
    STUDENTS_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
