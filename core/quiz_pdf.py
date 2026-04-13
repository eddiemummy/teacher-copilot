from __future__ import annotations

from datetime import datetime
import os
import re
from pathlib import Path


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _find_font_path() -> str | None:
    env_path = os.getenv("QUIZ_PDF_FONT_PATH")
    if env_path and Path(env_path).exists():
        return env_path

    candidates = [
        # macOS common
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/Library/Fonts/NotoSans-Regular.ttf",
        "/Library/Fonts/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Neue.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        # Linux common
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        # Windows common
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\arialuni.ttf",
        "C:\\Windows\\Fonts\\times.ttf",
    ]

    for path in candidates:
        if Path(path).exists():
            return path
    return None


def _apply_turkish_font(styles) -> None:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    font_path = _find_font_path()
    if not font_path:
        return

    font_name = "TeacherCopilotSans"
    pdfmetrics.registerFont(TTFont(font_name, font_path))
    for style_name in ("Title", "Italic", "BodyText"):
        if style_name in styles:
            styles[style_name].fontName = font_name


_BOLD_ITALIC_PATTERN = re.compile(r"(\*\*.+?\*\*|\*.+?\*)")


def _inline_markdown_to_rl(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        token = match.group(0)
        if token.startswith("**") and token.endswith("**") and len(token) > 4:
            inner = token[2:-2]
            return f"<b>{inner}</b>"
        if token.startswith("*") and token.endswith("*") and len(token) > 2:
            inner = token[1:-1]
            return f"<i>{inner}</i>"
        return token

    return _BOLD_ITALIC_PATTERN.sub(repl, text)


def render_quiz_pdf(title: str, subtitle: str, body_text: str, output_path: Path) -> None:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except Exception as e:
        raise RuntimeError(
            "reportlab bulunamadı. PDF üretmek için reportlab gerekli."
        ) from e

    _ensure_dir(output_path.parent)

    styles = getSampleStyleSheet()
    _apply_turkish_font(styles)
    story = []
    story.append(Paragraph(title, styles["Title"]))
    story.append(Paragraph(subtitle, styles["Italic"]))
    story.append(Spacer(1, 12))

    heading_styles = {
        "#": "Heading1",
        "##": "Heading2",
        "###": "Heading3",
    }

    lines = body_text.splitlines()
    idx = 0
    while idx < len(lines):
        line = lines[idx].rstrip()

        if line.strip() == "":
            story.append(Spacer(1, 6))
            idx += 1
            continue

        # Table detection: lines with | and optional separator row
        if "|" in line:
            table_lines = []
            while idx < len(lines) and "|" in lines[idx]:
                table_lines.append(lines[idx].strip())
                idx += 1

            # Remove markdown separator row if present
            if len(table_lines) >= 2:
                sep = table_lines[1].replace("|", "").strip()
                if set(sep) <= {"-", ":"}:
                    table_lines.pop(1)

            rows = []
            for raw in table_lines:
                cells = [c.strip() for c in raw.split("|")]
                if cells and cells[0] == "":
                    cells = cells[1:]
                if cells and cells[-1] == "":
                    cells = cells[:-1]
                rows.append(cells)

            if rows:
                table = Table(rows, hAlign="LEFT")
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                            ("FONT", (0, 0), (-1, -1), styles["BodyText"].fontName),
                            ("FONTSIZE", (0, 0), (-1, -1), 10),
                            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                            ("LEFTPADDING", (0, 0), (-1, -1), 6),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                            ("TOPPADDING", (0, 0), (-1, -1), 4),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ]
                    )
                )
                story.append(table)
                story.append(Spacer(1, 8))
            continue

        # Headings
        for prefix, style_name in heading_styles.items():
            if line.startswith(prefix + " "):
                text = line[len(prefix) + 1 :].strip()
                story.append(Paragraph(text, styles[style_name]))
                story.append(Spacer(1, 4))
                break
        else:
            # Lists
            if line.lstrip().startswith(("-", "*")):
                text = line.lstrip()[1:].strip()
                story.append(
                    Paragraph(f"• {_inline_markdown_to_rl(text)}", styles["BodyText"])
                )
            else:
                story.append(
                    Paragraph(
                        _inline_markdown_to_rl(line.replace("  ", "&nbsp;&nbsp;")),
                        styles["BodyText"],
                    )
                )

        idx += 1
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        title=title,
        author="Rain",
    )
    doc.build(story)


def default_quiz_filename(student_name: str | None, topic: str) -> str:
    safe = "".join(c for c in topic if c.isalnum() or c in (" ", "-", "_")).strip()
    safe = safe.replace(" ", "_")[:40] or "quiz"
    who = "".join(c for c in (student_name or "") if c.isalnum())[:20]
    stamp = datetime.utcnow().strftime("%Y%m%d_%H%M")
    return f"{safe}_{who}_{stamp}.pdf" if who else f"{safe}_{stamp}.pdf"
