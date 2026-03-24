from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.lesson_planner import LessonPlanRequest, generate_lesson_plan
from core.exercise_generator import ExerciseRequest, generate_exercises
from core.dialogue_generator import DialogueRequest, generate_dialogue
from core.notebook_assistant import NotebookEntry, process_notebook_entry
from core.worksheet_generator import WorksheetRequest, generate_worksheet
from core.summary_generator import SummaryRequest, generate_lesson_summary
from core.program_planner import ProgramPlanRequest, generate_program_plan
from core.quiz_generator import QuizRequest, generate_quiz
from core.quiz_pdf import render_quiz_pdf, default_quiz_filename
from core.guide_chat import GuideChatRequest, generate_guide_reply
from core.scenario_dialogue import (
    ScenarioDialogueRequest,
    generate_scenario_dialogue,
)
from core.roleplay_cards import (
    RoleplayCardsRequest,
    RoleplayCardsPdfRequest,
    generate_roleplay_cards,
)
from core.roleplay_pdf import default_roleplay_filename, render_roleplay_cards_pdf
from core.dialogue_exercises import (
    DialogueExercisesRequest,
    generate_dialogue_exercises,
)
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from core.schedule_store import load_schedule, save_schedule
from core.students_store import load_students, save_students
from core.materials_store import load_materials, save_materials
from core.progress_store import load_progress, save_progress
import base64
from pathlib import Path


app = FastAPI(title="Teacher Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/lesson-plan")
async def lesson_plan(req: LessonPlanRequest):
    return {"plan": await generate_lesson_plan(req)}


@app.post("/examples")
async def examples(req: DialogueRequest):
    # examples + dialogue aynı yapıdan beslendiği için tek endpoint
    return {"dialogue": await generate_dialogue(req)}


@app.post("/exercises")
async def exercises(req: ExerciseRequest):
    return {"exercises": await generate_exercises(req)}


@app.post("/notebook")
async def notebook(req: NotebookEntry):
    return {"content": await process_notebook_entry(req)}


@app.post("/worksheet")
async def worksheet(req: WorksheetRequest):
    return {"worksheet": await generate_worksheet(req)}


@app.post("/summary")
async def summary(req: SummaryRequest):
    return {"summary": await generate_lesson_summary(req)}


@app.post("/program-plan")
async def program_plan(req: ProgramPlanRequest):
    return {"program": await generate_program_plan(req)}


@app.post("/guide-chat")
async def guide_chat(req: GuideChatRequest):
    return {"reply": await generate_guide_reply(req)}


@app.post("/scenario-dialogue")
async def scenario_dialogue(req: ScenarioDialogueRequest):
    return {"dialogue": await generate_scenario_dialogue(req)}


@app.post("/roleplay-cards")
async def roleplay_cards(req: RoleplayCardsRequest):
    return {"cards": await generate_roleplay_cards(req)}


@app.post("/dialogue-exercises")
async def dialogue_exercises(req: DialogueExercisesRequest):
    return {"exercises": await generate_dialogue_exercises(req)}


@app.post("/roleplay-cards-pdf")
async def roleplay_cards_pdf(req: RoleplayCardsPdfRequest):
    cards_text = req.cards_text or await generate_roleplay_cards(
        RoleplayCardsRequest(
            level=req.level,
            scenario=req.scenario,
            card_count=req.card_count,
        )
    )
    filename = default_roleplay_filename(req.scenario, req.level)
    output_path = Path("output/pdf") / filename
    render_roleplay_cards_pdf(
        level=req.level,
        scenario=req.scenario,
        cards_text=cards_text,
        output_path=output_path,
    )
    data = output_path.read_bytes()
    encoded = base64.b64encode(data).decode("ascii")
    return {"filename": filename, "content_base64": encoded}


# --- Basit Not Defteri API'si (in-memory + demo amaçlı) ---


class Note(BaseModel):
    id: str
    date: str  # YYYY-MM-DD
    title: str = ""
    content: str = ""


NOTES: List[Note] = []


@app.get("/notes")
async def list_notes(date: str):
    notes_for_day = [n for n in NOTES if n.date == date]
    return {"notes": notes_for_day}


@app.post("/notes")
async def upsert_note(note: Note):
    global NOTES
    if not note.id:
        note.id = f"{note.date}-{len(NOTES)+1}-{int(datetime.utcnow().timestamp())}"
        NOTES.append(note)
    else:
        NOTES = [n for n in NOTES if n.id != note.id] + [note]
    notes_for_day = [n for n in NOTES if n.date == note.date]
    return {"notes": notes_for_day, "last_id": note.id}


@app.get("/health")
async def health():
    return {"status": "ok"}


# --- Ders Takvimi (in-memory + demo amaçlı) ---


class ScheduleEntry(BaseModel):
    id: str
    day_of_week: int  # 0=Mon ... 6=Sun
    start_time: str  # "HH:MM"
    duration_hours: float
    student_name: str
    title: str = ""
    is_online: bool = True
    date: Optional[str] = None  # YYYY-MM-DD tek seans için


SCHEDULE: List[ScheduleEntry] = [
    ScheduleEntry(**e) for e in load_schedule()
]


@app.get("/schedule")
async def list_schedule(student: Optional[str] = None):
    entries = SCHEDULE
    if student:
        entries = [e for e in entries if e.student_name == student]
    return {"entries": entries}


@app.post("/schedule")
async def add_schedule(entry: ScheduleEntry):
    global SCHEDULE
    SCHEDULE = [e for e in SCHEDULE if e.id != entry.id] + [entry]
    save_schedule(SCHEDULE)
    return {"entries": SCHEDULE}


@app.delete("/schedule/{entry_id}")
async def delete_schedule(entry_id: str):
    global SCHEDULE
    SCHEDULE = [e for e in SCHEDULE if e.id != entry_id]
    save_schedule(SCHEDULE)
    return {"entries": SCHEDULE}


# --- Öğrenciler (kalıcı JSON) ---


class Student(BaseModel):
    id: str
    name: str
    level: str = "A2"
    native_language: str = "İngilizce"
    weekly_lessons: int = 2
    lesson_duration_minutes: int = 60
    target: str = ""
    needs: str = ""
    weekly_focus: str = ""
    homework_preferences: str = ""
    struggle_areas: str = ""
    assessment_note: str = ""
    message_template: str = "Bu derste ... Bir sonraki derste ..."


STUDENTS: List[Student] = [Student(**s) for s in load_students()]


@app.get("/students")
async def list_students():
    return {"students": STUDENTS}


@app.post("/students")
async def upsert_student(student: Student):
    global STUDENTS
    STUDENTS = [s for s in STUDENTS if s.id != student.id] + [student]
    save_students(STUDENTS)
    return {"students": STUDENTS}


@app.delete("/students/{student_id}")
async def delete_student(student_id: str):
    global STUDENTS
    STUDENTS = [s for s in STUDENTS if s.id != student_id]
    save_students(STUDENTS)
    return {"students": STUDENTS}


# --- Materyal Bankası ---


class Material(BaseModel):
    id: str
    title: str
    type: str  # "link" | "pdf" | "image" | "note"
    url: str = ""
    notes: str = ""
    student_id: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD


MATERIALS: List[Material] = [Material(**m) for m in load_materials()]


@app.get("/materials")
async def list_materials(student_id: Optional[str] = None):
    items = MATERIALS
    if student_id:
        items = [m for m in items if m.student_id == student_id]
    return {"materials": items}


@app.post("/materials")
async def upsert_material(material: Material):
    global MATERIALS
    MATERIALS = [m for m in MATERIALS if m.id != material.id] + [material]
    save_materials(MATERIALS)
    return {"materials": MATERIALS}


@app.delete("/materials/{material_id}")
async def delete_material(material_id: str):
    global MATERIALS
    MATERIALS = [m for m in MATERIALS if m.id != material_id]
    save_materials(MATERIALS)
    return {"materials": MATERIALS}


# --- Öğrenci Gelişim Timeline ---


class ProgressEntry(BaseModel):
    id: str
    student_id: str
    date: str  # YYYY-MM-DD
    note: str
    tags: str = ""


PROGRESS: List[ProgressEntry] = [ProgressEntry(**p) for p in load_progress()]


@app.get("/progress")
async def list_progress(student_id: Optional[str] = None):
    items = PROGRESS
    if student_id:
        items = [p for p in items if p.student_id == student_id]
    return {"progress": items}


@app.post("/progress")
async def upsert_progress(entry: ProgressEntry):
    global PROGRESS
    PROGRESS = [p for p in PROGRESS if p.id != entry.id] + [entry]
    save_progress(PROGRESS)
    return {"progress": PROGRESS}


@app.delete("/progress/{entry_id}")
async def delete_progress(entry_id: str):
    global PROGRESS
    PROGRESS = [p for p in PROGRESS if p.id != entry_id]
    save_progress(PROGRESS)
    return {"progress": PROGRESS}


# --- LLM Quiz PDF ---


@app.post("/quiz-pdf")
async def quiz_pdf(req: QuizRequest):
    quiz_text = await generate_quiz(req)
    filename = default_quiz_filename(req.student_name, req.topic)
    output_path = Path("output/pdf") / filename
    render_quiz_pdf(
        title="Türkçe Çalışma Kağıdı",
        subtitle=f"Konu: {req.topic} • Seviye: {req.level}",
        body_text=quiz_text,
        output_path=output_path,
    )
    data = output_path.read_bytes()
    encoded = base64.b64encode(data).decode("ascii")
    return {"filename": filename, "content_base64": encoded}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8010, reload=True)
