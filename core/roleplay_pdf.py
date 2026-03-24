from __future__ import annotations

from datetime import datetime
from pathlib import Path

from .quiz_pdf import render_quiz_pdf


def default_roleplay_filename(scenario: str, level: str) -> str:
    safe = "".join(c for c in scenario if c.isalnum() or c in (" ", "-", "_")).strip()
    safe = safe.replace(" ", "_")[:40] or "rol_play"
    stamp = datetime.utcnow().strftime("%Y%m%d_%H%M")
    return f"{safe}_{level}_{stamp}.pdf"


def render_roleplay_cards_pdf(
    *,
    level: str,
    scenario: str,
    cards_text: str,
    output_path: Path,
) -> None:
    render_quiz_pdf(
        title="Rol-Play Kartlari",
        subtitle=f"Senaryo: {scenario} • Seviye: {level}",
        body_text=cards_text,
        output_path=output_path,
    )
