from __future__ import annotations

import json
from pathlib import Path
from typing import List


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SCHEDULE_PATH = DATA_DIR / "schedule.json"


def _ensure_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_schedule() -> List[dict]:
    _ensure_dir()
    if not SCHEDULE_PATH.exists():
        return []
    try:
        return json.loads(SCHEDULE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_schedule(entries: List) -> None:
    _ensure_dir()
    data = []
    for entry in entries:
        if hasattr(entry, "model_dump"):
            data.append(entry.model_dump())
        elif isinstance(entry, dict):
            data.append(entry)
    SCHEDULE_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
