import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Notebook from "./components/Notebook";
import "./index.css";

type MainTab = "home" | "ders" | "defter" | "guide";
type LessonSubTab =
  | "lesson"
  | "examples"
  | "exercises"
  | "worksheet"
  | "summary"
  | "program"
  | "quiz"
  | "scenarios";

function App() {
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [lessonTab, setLessonTab] = useState<LessonSubTab>("lesson");
  const [summaryPrefill, setSummaryPrefill] = useState<{
    studentName?: string;
    studentId?: string;
    notes?: string;
    nextTopics?: string;
  }>({});
  const [studentsIndex, setStudentsIndex] = useState<
    Record<
      string,
      {
        id: string;
        name: string;
        level: string;
      weekly_focus?: string;
      target?: string;
      struggle_areas?: string;
      assessment_note?: string;
      }
    >
  >({});
  const [scheduleEntries, setScheduleEntries] = useState<
    Array<{
      id: string;
      dayIndex: number;
      startTime: string;
      durationHours: number;
      studentName: string;
      title: string;
      isOnline: boolean;
      date: string;
    }>
  >([]);

  const openSummaryForStudent = (
    studentName?: string,
    studentId?: string,
    notes?: string,
    nextTopics?: string,
  ) => {
    setMainTab("ders");
    setLessonTab("summary");
    setSummaryPrefill({ studentName, studentId, notes, nextTopics });
  };

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const res = await fetch("http://localhost:8010/schedule");
        const data = await res.json();
        if (data?.entries) {
          setScheduleEntries(
            data.entries.map((e: any) => ({
              id: e.id,
              dayIndex: e.day_of_week,
              startTime: e.start_time,
              durationHours: e.duration_hours,
              studentName: e.student_name,
              title: e.title,
              isOnline: e.is_online ?? true,
              date: e.date ?? "",
            })),
          );
        }
      } catch {
        // ignore
      }
    };
    loadSchedule();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch("http://localhost:8010/students");
        const data = await res.json();
        if (data?.students) {
          const index = data.students.reduce(
            (acc: any, s: any) => ({
              ...acc,
              [s.name]: {
                id: s.id,
                name: s.name,
                level: s.level || "A2",
                weekly_focus: s.weekly_focus || "",
                target: s.target || "",
                struggle_areas: s.struggle_areas || "",
                assessment_note: s.assessment_note || "",
              },
            }),
            {},
          );
          setStudentsIndex(index);
        }
      } catch {
        // ignore
      }
    };
    loadStudents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md transition-transform duration-200 hover:-translate-y-0.5">
              <span className="rain-emoji text-white text-xl leading-none">
                🌧️
                <span className="rain-drop rain-drop-1">💧</span>
                <span className="rain-drop rain-drop-2">💧</span>
                <span className="rain-drop rain-drop-3">💧</span>
              </span>
            </div>
            <div>
              <div className="text-xl font-black tracking-tighter bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                Rain
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] -mt-1">
                Teacher Assistant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setMainTab("home")}
              className={`px-4 py-2 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 ${mainTab === "home"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
            >
              Anasayfa
            </button>
            <button
              onClick={() => setMainTab("ders")}
              className={`px-4 py-2 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 ${mainTab === "ders"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
            >
              Ders
            </button>
            <button
              onClick={() => setMainTab("defter")}
              className={`px-4 py-2 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 ${mainTab === "defter"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
            >
              Defter
            </button>
            <button
              onClick={() => setMainTab("guide")}
              className={`px-4 py-2 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 ${mainTab === "guide"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
            >
              Guide
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6">
        {mainTab === "home" && (
          <HomeView
            onStart={() => setMainTab("ders")}
            scheduleEntries={scheduleEntries}
            onOpenSummary={openSummaryForStudent}
            studentsIndex={studentsIndex}
          />
        )}
        {mainTab === "ders" && (
          <DersShell
            lessonTab={lessonTab}
            setLessonTab={setLessonTab}
            onOpenSummary={openSummaryForStudent}
            summaryPrefill={summaryPrefill}
          />
        )}
        {mainTab === "guide" && <GuideView />}
        {mainTab === "defter" && <Notebook />}
      </div>
    </div>
  );
}

function DersShell({
  lessonTab,
  setLessonTab,
  onOpenSummary,
  summaryPrefill,
}: {
  lessonTab: LessonSubTab;
  setLessonTab: (t: LessonSubTab) => void;
  onOpenSummary: (
    studentName?: string,
    studentId?: string,
    notes?: string,
    nextTopics?: string,
  ) => void;
  summaryPrefill: {
    studentName?: string;
    studentId?: string;
    notes?: string;
    nextTopics?: string;
  };
}) {
  return (
    <div className="space-y-10 flex flex-col items-center text-center">
      {/* Hero / tanıtım */}
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full text-[10px] font-bold text-teal-700 uppercase tracking-[0.22em] mb-4">
          <span className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
          RAIN
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
          Türkçe derslerin için{" "}
          <span className="text-indigo-600">kişisel AI beynin</span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
          Hedefini yaz; ders planı, örnek cümleler, alıştırmalar, worksheet ve
          ders sonrası özetini birkaç saniyede hazırla.
        </p>
      </div>

      {/* Ders alt sekmeleri */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { id: "lesson" as LessonSubTab, label: "Ders Planı" },
          { id: "examples" as LessonSubTab, label: "Örnek & Diyalog" },
          { id: "exercises" as LessonSubTab, label: "Alıştırma Motoru" },
          { id: "worksheet" as LessonSubTab, label: "Worksheet" },
          { id: "summary" as LessonSubTab, label: "Ders Özeti" },
          { id: "program" as LessonSubTab, label: "Program & Müfredat" },
          { id: "scenarios" as LessonSubTab, label: "Senaryo Diyalogları" },
          { id: "quiz" as LessonSubTab, label: "Quiz PDF" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setLessonTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] ${lessonTab === tab.id
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Seçili ders aracı */}
      <div className="w-full max-w-4xl mx-auto">
        {lessonTab === "lesson" && <LessonPlanner />}
        {lessonTab === "examples" && <ExamplesView />}
        {lessonTab === "exercises" && <ExerciseView />}
        {lessonTab === "worksheet" && <WorksheetView />}
        {lessonTab === "summary" && (
          <SummaryView
            prefillStudentName={summaryPrefill.studentName}
            prefillStudentId={summaryPrefill.studentId}
            prefillNotes={summaryPrefill.notes}
            prefillNextTopics={summaryPrefill.nextTopics}
          />
        )}
        {lessonTab === "program" && (
          <ProgramView onOpenSummary={onOpenSummary} />
        )}
        {lessonTab === "scenarios" && <ScenarioDialoguesView />}
        {lessonTab === "quiz" && <QuizPdfView />}
      </div>
    </div>
  );
}

function CardShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-10 flex flex-col gap-8 text-center items-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">{description}</p>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

function GuideView() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content: "Merhaba, ben Socrates. Bugün ne üzerinde düşünelim?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user" as const, content: trimmed };
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const historySnapshot = [...messages, userMsg].slice(-8);

    try {
      const res = await fetch("http://localhost:8010/guide-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: historySnapshot,
        }),
      });
      const data = await res.json();
      const reply =
        (data?.reply as string) || "Yanıt üretilemedi, tekrar dener misin?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e?.message ?? "İstek başarısız oldu");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Bir hata oluştu, tekrar dener misin?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-10 flex flex-col gap-6 text-center items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Socrates
          </h1>
          <p className="text-slate-500 italic">
            The unexamined life is not worth living.
          </p>
        </div>

        <div className="w-full text-left">
          <div className="h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-700"
                    }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Öğretmen istediği her şeyi yazabilir..."
            className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:bg-slate-800 transition disabled:opacity-40"
            >
              {loading ? "Yanıtlanıyor..." : "Gönder"}
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function useLLMRequest<TReq, TRes>(
  path: string,
): [
    (body: TReq) => Promise<void>,
    { loading: boolean; error: string | null; result: TRes | null },
  ] {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TRes | null>(null);

  const call = async (body: TReq) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8010${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "İstek başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  return [call, { loading, error, result }];
}

function MarkdownResult({ content }: { content: string }) {
  return (
    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-left shadow-inner prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed markdown-content animate-in fade-in slide-in-from-top-4 duration-500">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function LessonPlanner() {
  const [level, setLevel] = useState("A2");
  const [target, setTarget] = useState(
    "Bugün A2 öğrenciyle yönelme eki ve günlük rutin çalışacağım.",
  );
  const [duration, setDuration] = useState(30);
  const [send, state] = useLLMRequest<
    { level: string; target: string; duration_minutes: number },
    { plan: string }
  >("/lesson-plan");

  return (
    <CardShell
      title="Akıllı Ders Planlayıcı"
      description="Hedefini ve seviyeyi yaz, 30 dakikalık şık bir ders akışı al."
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
          <input
            type="number"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-24"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 30)}
          />
        </div>
        <textarea
          className="w-full min-h-[120px] text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button
          onClick={() => send({ level, target, duration_minutes: duration })}
          disabled={state.loading}
          className="mx-auto px-8 py-3 rounded-2xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg transition-all"
        >
          {state.loading ? "Plan Hazırlanıyor..." : "Ders Planı Oluştur"}
        </button>
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.result?.plan && <MarkdownResult content={state.result.plan} />}
      </div>
    </CardShell>
  );
}

function ExamplesView() {
  const [level, setLevel] = useState("A2");
  const [topic, setTopic] = useState("Yönelme eki -e/-a");
  const [send, state] = useLLMRequest<
    { level: string; topic: string; example_count: number },
    { dialogue: string }
  >("/examples");

  return (
    <CardShell
      title="Örnek Cümle + Diyalog"
      description="Belirli bir konu için seviyeye uygun örnekler ve diyalog üret."
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
        </div>
        <input
          className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={() => send({ level, topic, example_count: 20 })}
          disabled={state.loading}
          className="mx-auto px-8 py-3 rounded-2xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg transition-all"
        >
          {state.loading ? "Üretiliyor..." : "Örnek ve Diyalog Oluştur"}
        </button>
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.result?.dialogue && <MarkdownResult content={state.result.dialogue} />}
      </div>
    </CardShell>
  );
}

function ExerciseView() {
  const [level, setLevel] = useState("A2");
  const [topic, setTopic] = useState("Şimdiki zaman -iyor için 10 boşluk doldurma");
  const [send, state] = useLLMRequest<
    { level: string; topic: string; exercise_types: string[]; count: number },
    { exercises: string }
  >("/exercises");

  return (
    <CardShell
      title="Alıştırma Motoru"
      description="Boşluk doldurma, doğru/yanlış, cümle kurma ve daha fazlasını otomatik üret."
    >
      <div className="flex flex-col gap-3">
        <select
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-32"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
          <option>B2</option>
        </select>
        <textarea
          className="w-full min-h-[100px] text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={() =>
            send({
              level,
              topic,
              exercise_types: ["bosluk_doldurma", "dogru_yanlis", "cumle_kurma"],
              count: 10,
            })
          }
          disabled={state.loading}
          className="mx-auto px-8 py-3 rounded-2xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg transition-all"
        >
          {state.loading ? "Alıştırmalar Hazırlanıyor..." : "Alıştırma Üret"}
        </button>
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.result?.exercises && <MarkdownResult content={state.result.exercises} />}
      </div>
    </CardShell>
  );
}

function WorksheetView() {
  const [level, setLevel] = useState("A1");
  const [topic, setTopic] = useState("Şimdiki zaman -iyor genel pratik");
  const [send, state] = useLLMRequest<
    { level: string; topic: string; target_language?: string },
    { worksheet: string }
  >("/worksheet");

  return (
    <CardShell
      title="Worksheet Generator"
      description="Tek tıkla PDF'e dönüştürülebilir bir çalışma kağıdı metni üret."
    >
      <div className="flex flex-col gap-3">
        <select
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-32"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
        </select>
        <input
          className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={() => send({ level, topic })}
          disabled={state.loading}
          className="mx-auto px-8 py-3 rounded-2xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg transition-all"
        >
          {state.loading ? "Worksheet Hazırlanıyor..." : "Worksheet Oluştur"}
        </button>
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.result?.worksheet && <MarkdownResult content={state.result.worksheet} />}
      </div>
    </CardShell>
  );
}

function ProgramView({
  onOpenSummary,
}: {
  onOpenSummary: (
    studentName?: string,
    studentId?: string,
    notes?: string,
    nextTopics?: string,
  ) => void;
}) {
  const [level, setLevel] = useState("A2");
  const [nativeLanguage, setNativeLanguage] = useState("İngilizce");
  const [weeklyLessons, setWeeklyLessons] = useState(2);
  const [lessonDuration, setLessonDuration] = useState(60);
  const [target, setTarget] = useState(
    "Günlük hayatta akıcı Türkçe konuşmak ve temel dilbilgisi oturtmak.",
  );
  const [needs, setNeeds] = useState("Konuşma ve dinleme ağırlıklı");
  const [students, setStudents] = useState<
    Array<{
      id: string;
      name: string;
      level: string;
      native_language: string;
      weekly_lessons: number;
      lesson_duration_minutes: number;
      target: string;
      needs: string;
      weekly_focus: string;
      homework_preferences: string;
      struggle_areas: string;
      assessment_note: string;
      message_template: string;
    }>
  >([]);
  const [progressEntries, setProgressEntries] = useState<
    Array<{
      id: string;
      student_id: string;
      date: string;
      note: string;
      tags: string;
    }>
  >([]);
  const [progressDraft, setProgressDraft] = useState({
    student_id: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
    tags: "",
  });
  const [materials, setMaterials] = useState<
    Array<{
      id: string;
      title: string;
      type: string;
      url: string;
      notes: string;
      student_id?: string;
      date?: string;
    }>
  >([]);
  const [materialDraft, setMaterialDraft] = useState({
    title: "",
    type: "link",
    url: "",
    notes: "",
    student_id: "",
    date: new Date().toISOString().slice(0, 10),
  });
  type ScheduleSession = {
    id: string;
    dayIndex: number;
    startTime: string;
    durationHours: number;
    studentName: string;
    title: string;
    isOnline: boolean;
    date: string;
  };
  const [activeStudentId, setActiveStudentId] = useState("");
  const [studentDraft, setStudentDraft] = useState({
    id: "",
    name: "",
    level: "A2",
    native_language: "İngilizce",
    weekly_lessons: 2,
    lesson_duration_minutes: 60,
    target: "",
    needs: "",
    weekly_focus: "",
    homework_preferences: "",
    struggle_areas: "",
    assessment_note: "",
    message_template: "Bu derste ... Bir sonraki derste ...",
  });
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [studentFilter, setStudentFilter] = useState("Tümü");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [sessionDraft, setSessionDraft] = useState({
    dayIndex: 0,
    startTime: "18:00",
    durationHours: 1,
    studentName: "Öğrenci",
    title: "Birebir Türkçe dersi",
    isOnline: true,
    date: "",
    repeatWeekly: false,
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "add" | "update" | "delete" } | null>(null);
  const [pendingSession, setPendingSession] = useState<ScheduleSession | null>(
    null,
  );
  const [autoCancelSeconds, setAutoCancelSeconds] = useState<number | null>(
    null,
  );
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [send, state] = useLLMRequest<
    {
      level: string;
      native_language: string;
      weekly_lessons: number;
      lesson_duration_minutes: number;
      target: string;
      learner_needs?: string;
      assessment_note?: string;
    },
    { program: string }
  >("/program-plan");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:8010/schedule");
        const data = await res.json();
        if (data?.entries) {
          setSessions(
            data.entries.map((e: any) => ({
              id: e.id,
              dayIndex: e.day_of_week,
              startTime: e.start_time,
              durationHours: e.duration_hours,
              studentName: e.student_name,
              title: e.title,
              isOnline: e.is_online ?? true,
              date: e.date ?? "",
            })),
          );
        }
      } catch {
        // sessiz kal: demo modunda offline olabilir
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch("http://localhost:8010/students");
        const data = await res.json();
        if (data?.students) {
          setStudents(data.students);
        }
      } catch {
        // ignore
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch("http://localhost:8010/progress");
        const data = await res.json();
        if (data?.progress) {
          setProgressEntries(data.progress);
        }
      } catch {
        // ignore
      }
    };
    loadProgress();
  }, []);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const res = await fetch("http://localhost:8010/materials");
        const data = await res.json();
        if (data?.materials) {
          setMaterials(data.materials);
        }
      } catch {
        // ignore
      }
    };
    loadMaterials();
  }, []);

  useEffect(() => {
    if (!sessionError) return;
    if (sessionDraft.repeatWeekly || sessionDraft.date) {
      setSessionError(null);
    }
  }, [sessionDraft.repeatWeekly, sessionDraft.date, sessionError]);

  useEffect(() => {
    if (!activeStudentId) {
      return;
    }
    const student = students.find((s) => s.id === activeStudentId);
    if (!student) {
      return;
    }
    setLevel(student.level || "A2");
    setNativeLanguage(student.native_language || "İngilizce");
    setWeeklyLessons(student.weekly_lessons || 2);
    setLessonDuration(student.lesson_duration_minutes || 60);
    setTarget(student.target || "");
    setNeeds(student.needs || "");
    setStudentFilter(student.name);
  }, [activeStudentId, students]);

  const saveStudent = async () => {
    if (!studentDraft.name.trim()) {
      return;
    }
    const payload = {
      ...studentDraft,
      id:
        studentDraft.id ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: studentDraft.name.trim(),
      weekly_lessons: Number(studentDraft.weekly_lessons) || 1,
      lesson_duration_minutes: Number(studentDraft.lesson_duration_minutes) || 60,
    };
    try {
      const res = await fetch("http://localhost:8010/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.students) {
        setStudents(data.students);
        setStudentDraft({
          id: "",
          name: "",
          level: "A2",
          native_language: "İngilizce",
          weekly_lessons: 2,
          lesson_duration_minutes: 60,
          target: "",
          needs: "",
          weekly_focus: "",
          homework_preferences: "",
          struggle_areas: "",
          assessment_note: "",
          message_template: "Bu derste ... Bir sonraki derste ...",
        });
        return;
      }
    } catch {
      // ignore
    }
    setStudents((prev) => [...prev, payload]);
  };

  const saveProgress = async () => {
    if (!progressDraft.student_id || !progressDraft.note.trim()) return;
    const payload = {
      ...progressDraft,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    try {
      const res = await fetch("http://localhost:8010/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.progress) {
        setProgressEntries(data.progress);
        setProgressDraft((prev) => ({ ...prev, note: "", tags: "" }));
        return;
      }
    } catch {
      // ignore
    }
    setProgressEntries((prev) => [...prev, payload]);
  };

  const removeProgress = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8010/progress/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.progress) {
        setProgressEntries(data.progress);
        return;
      }
    } catch {
      // ignore
    }
    setProgressEntries((prev) => prev.filter((p) => p.id !== id));
  };

  const saveMaterial = async () => {
    if (!materialDraft.title.trim()) return;
    const payload = {
      ...materialDraft,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      student_id: materialDraft.student_id || undefined,
      date: materialDraft.date || undefined,
    };
    try {
      const res = await fetch("http://localhost:8010/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.materials) {
        setMaterials(data.materials);
        setMaterialDraft((prev) => ({
          ...prev,
          title: "",
          url: "",
          notes: "",
        }));
        return;
      }
    } catch {
      // ignore
    }
    setMaterials((prev) => [...prev, payload]);
  };

  const removeMaterial = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8010/materials/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.materials) {
        setMaterials(data.materials);
        return;
      }
    } catch {
      // ignore
    }
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const removeStudent = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8010/students/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.students) {
        setStudents(data.students);
        if (activeStudentId === id) {
          setActiveStudentId("");
        }
        return;
      }
    } catch {
      // ignore
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const days = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
  ];

  const levelBadgeClass = (level?: string) => {
    if (level === "A1") return "bg-emerald-600 text-white";
    if (level === "A2") return "bg-teal-600 text-white";
    if (level === "B1") return "bg-indigo-600 text-white";
    if (level === "B2") return "bg-purple-600 text-white";
    return "bg-slate-900 text-white";
  };

  const addSession = async () => {
    if (!sessionDraft.studentName.trim()) {
      return;
    }
    if (!sessionDraft.repeatWeekly && !sessionDraft.date) {
      setSessionError("Tek seans için tarih seçmelisin.");
      return;
    }
    setSessionError(null);
    const entry = {
      id:
        editingSessionId ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      dayIndex: sessionDraft.dayIndex,
      startTime: sessionDraft.startTime,
      durationHours: Math.max(0.5, sessionDraft.durationHours || 1),
      studentName: sessionDraft.studentName.trim(),
      title: sessionDraft.title.trim() || "Türkçe dersi",
      isOnline: sessionDraft.isOnline,
      date: sessionDraft.repeatWeekly ? "" : sessionDraft.date || "",
    };
    try {
      const res = await fetch("http://localhost:8010/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          day_of_week: entry.dayIndex,
          start_time: entry.startTime,
          duration_hours: entry.durationHours,
          student_name: entry.studentName,
          title: entry.title,
          is_online: entry.isOnline,
          date: entry.date || null,
        }),
      });
      const data = await res.json();
      if (data?.entries) {
        setSessions(
          data.entries.map((e: any) => ({
            id: e.id,
            dayIndex: e.day_of_week,
            startTime: e.start_time,
            durationHours: e.duration_hours,
            studentName: e.student_name,
            title: e.title,
            isOnline: e.is_online ?? true,
            date: e.date ?? "",
          })),
        );
        if (editingSessionId) {
          setToast({ message: "Ders güncellendi.", type: "update" });
        } else {
          setToast({ message: "Ders takvime eklendi.", type: "add" });
        }
        cancelEditSession();
        return;
      }
    } catch {
      // ignore
    }
    setSessions((prev) => [...prev, entry]);
    setToast({
      message: editingSessionId ? "Ders güncellendi." : "Ders takvime eklendi.",
      type: editingSessionId ? "update" : "add",
    });
    cancelEditSession();
  };

  const removeSession = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8010/schedule/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.entries) {
        setSessions(
          data.entries.map((e: any) => ({
            id: e.id,
            dayIndex: e.day_of_week,
            startTime: e.start_time,
            durationHours: e.duration_hours,
            studentName: e.student_name,
            title: e.title,
            isOnline: e.is_online ?? true,
            date: e.date ?? "",
          })),
        );
        return;
      }
    } catch {
      // ignore
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setToast({ message: "Ders silindi.", type: "delete" });
  };

  const startEditSession = (session: ScheduleSession) => {
    if (editingSessionId && editingSessionId !== session.id) {
      setPendingSession(session);
      return;
    }
    setEditingSessionId(session.id);
    setSessionDraft({
      dayIndex: session.dayIndex,
      startTime: session.startTime,
      durationHours: session.durationHours,
      studentName: session.studentName,
      title: session.title,
      isOnline: session.isOnline,
      date: session.date || "",
      repeatWeekly: !session.date,
    });
  };

  const cancelEditSession = () => {
    setEditingSessionId(null);
    setSessionDraft({
      dayIndex: 0,
      startTime: "18:00",
      durationHours: 1,
      studentName: "Öğrenci",
      title: "Birebir Türkçe dersi",
      isOnline: true,
      date: "",
      repeatWeekly: false,
    });
    setSessionError(null);
  };

  const saveAndSwitch = async () => {
    if (!pendingSession) return;
    await addSession();
    const next = pendingSession;
    setPendingSession(null);
    setAutoCancelSeconds(null);
    startEditSession(next);
  };

  const discardAndSwitch = () => {
    if (!pendingSession) return;
    cancelEditSession();
    const next = pendingSession;
    setPendingSession(null);
    setAutoCancelSeconds(null);
    startEditSession(next);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!editingSessionId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEditSession();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        addSession();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editingSessionId, addSession]);

  useEffect(() => {
    if (!pendingSession) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setPendingSession(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pendingSession]);

  useEffect(() => {
    if (!editingSessionId) {
      setAutoCancelSeconds(null);
      return;
    }
    setAutoCancelSeconds(90);
  }, [editingSessionId]);

  useEffect(() => {
    if (autoCancelSeconds === null) return;
    if (autoCancelSeconds <= 0) {
      cancelEditSession();
      setAutoCancelSeconds(null);
      setToast({ message: "Düzenleme iptal edildi.", type: "delete" });
      return;
    }
    const t = setTimeout(
      () =>
        setAutoCancelSeconds((s) => (s === null ? null : s - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [autoCancelSeconds]);

  const studentNames = Array.from(
    new Set(sessions.map((s) => s.studentName)),
  ).sort((a, b) => a.localeCompare(b));

  const allStudentNames = Array.from(
    new Set([...students.map((s) => s.name), ...studentNames]),
  ).sort((a, b) => a.localeCompare(b));

  const studentTotals = allStudentNames.map((name) => {
    const items = sessions.filter((s) => s.studentName === name);
    const totalHours = items.reduce((sum, s) => sum + s.durationHours, 0);
    return { name, totalLessons: items.length, totalHours };
  });

  const filteredSessions =
    studentFilter === "Tümü"
      ? sessions
      : sessions.filter((s) => s.studentName === studentFilter);

  const recurringSessionsByDay = days.map((_, idx) =>
    filteredSessions
      .filter((s) => s.dayIndex === idx && !s.date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );

  const monthLabel = currentMonth.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  const buildMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();
    const mondayIndex = (first.getDay() + 6) % 7;
    const totalCells = Math.ceil((mondayIndex + daysInMonth) / 7) * 7;
    const cells: Array<{ date: Date | null; dayOfMonth?: number }> = [];
    for (let i = 0; i < totalCells; i += 1) {
      const dayNum = i - mondayIndex + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        cells.push({ date: null });
      } else {
        cells.push({ date: new Date(year, month, dayNum), dayOfMonth: dayNum });
      }
    }
    return cells;
  };

  const monthCells = buildMonthGrid();

  return (
    <CardShell
      title="Program & Müfredat Taslağı"
      description="Seviye, anadil ve hedefe göre haftalık program, yaklaşımlara göre müfredat taslağı ve kişisel ders takvimi oluştur."
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
          <input
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-40"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            placeholder="Anadil"
          />
          <input
            type="number"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-36"
            value={weeklyLessons}
            onChange={(e) => setWeeklyLessons(Number(e.target.value) || 1)}
            placeholder="Haftalık ders"
          />
          <input
            type="number"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-36"
            value={lessonDuration}
            onChange={(e) => setLessonDuration(Number(e.target.value) || 60)}
            placeholder="Ders süresi"
          />
        </div>
        <textarea
          className="w-full min-h-[90px] text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Hedef"
        />
        <input
          className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={needs}
          onChange={(e) => setNeeds(e.target.value)}
          placeholder="İhtiyaçlar (opsiyonel)"
        />
        <button
          onClick={() =>
            send({
              level,
              native_language: nativeLanguage,
              weekly_lessons: weeklyLessons,
              lesson_duration_minutes: lessonDuration,
              target,
              learner_needs: needs || undefined,
              assessment_note:
                students.find((s) => s.id === activeStudentId)
                  ?.assessment_note || undefined,
            })
          }
          disabled={state.loading}
          className="mx-auto px-8 py-3 rounded-2xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg transition-all"
        >
          {state.loading ? "Program Hazırlanıyor..." : "Program Oluştur"}
        </button>
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.result?.program && (
          <MarkdownResult content={state.result.program} />
        )}
      </div>

      <div className="w-full pt-8 border-t border-slate-100">
        <div className="text-left space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Öğrenciler</h2>
            <p className="text-sm text-slate-500">
              Öğrenci profilleri, hedefler ve mesaj şablonları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.name}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Öğrenci adı"
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.level}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  level: e.target.value,
                }))
              }
            >
              <option>A1</option>
              <option>A2</option>
              <option>B1</option>
              <option>B2</option>
            </select>
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.native_language}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  native_language: e.target.value,
                }))
              }
              placeholder="Anadil"
            />
            <input
              type="number"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.weekly_lessons}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  weekly_lessons: Number(e.target.value) || 1,
                }))
              }
              placeholder="Haftalık ders"
            />
            <input
              type="number"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.lesson_duration_minutes}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  lesson_duration_minutes: Number(e.target.value) || 60,
                }))
              }
              placeholder="Ders süresi"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.target}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  target: e.target.value,
                }))
              }
              placeholder="Hedef"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.needs}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  needs: e.target.value,
                }))
              }
              placeholder="İhtiyaçlar"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.weekly_focus}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  weekly_focus: e.target.value,
                }))
              }
              placeholder="Haftalık odak"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.homework_preferences}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  homework_preferences: e.target.value,
                }))
              }
              placeholder="Ödev tercihleri"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.struggle_areas}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  struggle_areas: e.target.value,
                }))
              }
              placeholder="Zorlanılan alanlar"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.assessment_note}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  assessment_note: e.target.value,
                }))
              }
              placeholder="Ölçme notu"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={studentDraft.message_template}
              onChange={(e) =>
                setStudentDraft((prev) => ({
                  ...prev,
                  message_template: e.target.value,
                }))
              }
              placeholder="Mesaj şablonu"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveStudent}
              className="px-6 py-2 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all w-fit"
            >
              Öğrenci Kaydet
            </button>
            <div className="text-xs text-slate-400">
              Kaydedilen öğrenci profili program ve mesaj şablonlarında kullanılabilir.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {students.length === 0 && (
              <div className="text-sm text-slate-400">
                Henüz öğrenci yok.
              </div>
            )}
            {students.map((student) => (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">
                    {student.name}
                  </div>
                  <button
                    onClick={() => removeStudent(student.id)}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500"
                  >
                    Sil
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {student.level} • {student.native_language}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {student.weekly_lessons} ders/hafta •{" "}
                  {student.lesson_duration_minutes} dk
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {student.target || "Hedef belirtilmedi"}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Haftalık odak:{" "}
                  {student.weekly_focus || student.needs || "Belirtilmedi"}
                </div>
                {student.assessment_note && (
                  <div className="text-xs text-slate-400 mt-1">
                    Ölçme notu: {student.assessment_note}
                  </div>
                )}
                <button
                  onClick={() => {
                    setActiveStudentId(student.id);
                    setStudentFilter(student.name);
                  }}
                  className="mt-3 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Profili Kullan
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {studentTotals.map((stat) => (
              <div
                key={stat.name}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm text-left"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {stat.name}
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {stat.totalLessons} ders
                </div>
                <div className="text-sm text-slate-500">
                  Toplam {stat.totalHours} saat
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full pt-8 border-t border-slate-100">
        <div className="text-left space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Öğrenci Gelişim Notları
            </h2>
            <p className="text-sm text-slate-500">
              Öğrenci bazlı kısa gelişim notları ve etiketler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={progressDraft.student_id}
              onChange={(e) =>
                setProgressDraft((prev) => ({
                  ...prev,
                  student_id: e.target.value,
                }))
              }
            >
              <option value="">Öğrenci seç</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={progressDraft.date}
              onChange={(e) =>
                setProgressDraft((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={progressDraft.tags}
              onChange={(e) =>
                setProgressDraft((prev) => ({
                  ...prev,
                  tags: e.target.value,
                }))
              }
              placeholder="Etiketler (örn: telaffuz, akıcılık)"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={progressDraft.note}
              onChange={(e) =>
                setProgressDraft((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              placeholder="Kısa not"
            />
          </div>
          <button
            onClick={saveProgress}
            className="px-6 py-2 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all w-fit"
          >
            Gelişim Notu Ekle
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {progressEntries
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 9)
              .map((entry) => {
                const student = students.find((s) => s.id === entry.student_id);
                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left"
                  >
                    <div className="text-xs text-slate-400">
                      {entry.date}
                    </div>
                    <div className="font-semibold text-slate-900">
                      {student?.name || "Öğrenci"}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {entry.note}
                    </div>
                    {entry.tags && (
                      <div className="text-[10px] text-slate-400 mt-2">
                        {entry.tags}
                      </div>
                    )}
                    <button
                      onClick={() => removeProgress(entry.id)}
                      className="mt-2 text-[10px] font-semibold text-slate-400 hover:text-red-500"
                    >
                      Sil
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="w-full pt-8 border-t border-slate-100">
        <div className="text-left space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Materyal Bankası
            </h2>
            <p className="text-sm text-slate-500">
              Link, PDF veya notları öğrenciye göre sakla.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={materialDraft.title}
              onChange={(e) =>
                setMaterialDraft((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Başlık"
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={materialDraft.type}
              onChange={(e) =>
                setMaterialDraft((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
            >
              <option value="link">Link</option>
              <option value="pdf">PDF</option>
              <option value="image">Görsel</option>
              <option value="note">Not</option>
            </select>
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={materialDraft.url}
              onChange={(e) =>
                setMaterialDraft((prev) => ({
                  ...prev,
                  url: e.target.value,
                }))
              }
              placeholder="URL"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={materialDraft.notes}
              onChange={(e) =>
                setMaterialDraft((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Kısa not"
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={materialDraft.student_id}
              onChange={(e) =>
                setMaterialDraft((prev) => ({
                  ...prev,
                  student_id: e.target.value,
                }))
              }
            >
              <option value="">Öğrenci (opsiyonel)</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={saveMaterial}
            className="px-6 py-2 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all w-fit"
          >
            Materyal Ekle
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {materials.slice(0, 9).map((item) => {
              const student = students.find((s) => s.id === item.student_id);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left"
                >
                  <div className="text-xs text-slate-400">
                    {item.type.toUpperCase()}
                  </div>
                  <div className="font-semibold text-slate-900">
                    {item.title}
                  </div>
                  {item.url && (
                    <div className="text-xs text-slate-500 mt-1 break-all">
                      {item.url}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-sm text-slate-600 mt-1">
                      {item.notes}
                    </div>
                  )}
                  {student && (
                    <div className="text-[10px] text-slate-400 mt-2">
                      {student.name}
                    </div>
                  )}
                  <button
                    onClick={() => removeMaterial(item.id)}
                    className="mt-2 text-[10px] font-semibold text-slate-400 hover:text-red-500"
                  >
                    Sil
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full pt-8 border-t border-slate-100">
        <div className="text-left space-y-4">
          {editingSessionId && (
            <div className="inline-flex flex-wrap items-center gap-3 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
              <span>Düzenleme modu açık. Kaydet: Cmd/Ctrl + Enter • İptal: Esc</span>
              {autoCancelSeconds !== null && (
                <span className="text-[10px] text-amber-700">
                  Otomatik iptal: {autoCancelSeconds}s
                </span>
              )}
              <button
                onClick={addSession}
                className="px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-semibold"
              >
                Kaydet
              </button>
              <button
                onClick={cancelEditSession}
                className="px-3 py-1 rounded-full border border-amber-300 text-amber-800 text-[10px] font-semibold"
              >
                İptal
              </button>
            </div>
          )}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg ${toast.type === "add"
                  ? "bg-emerald-500 text-white"
                  : toast.type === "update"
                    ? "bg-sky-500 text-white"
                    : "bg-rose-500 text-white"
                }`}
              onTouchStart={(e) => {
                (e.currentTarget as any)._touchX = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const startX = (e.currentTarget as any)._touchX as
                  | number
                  | undefined;
                if (startX !== undefined) {
                  const diff = e.changedTouches[0].clientX - startX;
                  if (Math.abs(diff) > 60) {
                    setToast(null);
                  }
                }
              }}
            >
              <span className="text-xs">●</span>
              {toast.message}
              <button
                onClick={() => setToast(null)}
                className="ml-1 text-white/80 hover:text-white text-xs"
                aria-label="Bildirimi kapat"
              >
                Kapat
              </button>
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ders Takvimi</h2>
            <p className="text-sm text-slate-500">
              Öğrenci isimleriyle kişiselleştirilmiş haftalık ders planı.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={sessionDraft.dayIndex}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  dayIndex: Number(e.target.value),
                }))
              }
            >
              {days.map((day, idx) => (
                <option key={day} value={idx}>
                  {day}
                </option>
              ))}
            </select>
            <input
              type="time"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={sessionDraft.startTime}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  startTime: e.target.value,
                }))
              }
            />
            <input
              type="number"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={sessionDraft.durationHours}
              min={0.5}
              step={0.5}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  durationHours: Number(e.target.value) || 1,
                }))
              }
              placeholder="Saat"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={sessionDraft.studentName}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  studentName: e.target.value,
                }))
              }
              placeholder="Öğrenci adı"
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={sessionDraft.title}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Ders başlığı"
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={sessionDraft.isOnline ? "online" : "offline"}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  isOnline: e.target.value === "online",
                }))
              }
            >
              <option value="online">Online</option>
              <option value="offline">Yüz yüze</option>
            </select>
            <input
              type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              value={sessionDraft.date}
              disabled={sessionDraft.repeatWeekly}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
            />
            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={sessionDraft.repeatWeekly}
                onChange={(e) =>
                  setSessionDraft((prev) => ({
                    ...prev,
                    repeatWeekly: e.target.checked,
                    date: e.target.checked ? "" : prev.date,
                  }))
                }
              />
              Haftalık tekrar et
            </label>
          </div>

          {sessionError && (
            <div className="text-xs text-red-500">{sessionError}</div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={addSession}
              className="px-6 py-2 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all w-fit"
            >
              {editingSessionId ? "Güncelle" : "Takvime Ekle"}
            </button>
            {editingSessionId && (
              <button
                onClick={cancelEditSession}
                className="px-5 py-2 rounded-2xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Düzenlemeyi İptal Et
              </button>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Görünüm:</span>
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-3 py-1 rounded-full border ${viewMode === "weekly"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200"
                  }`}
              >
                Haftalık
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-1 rounded-full border ${viewMode === "monthly"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200"
                  }`}
              >
                Aylık
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Öğrenci:</span>
              <select
                className="px-3 py-1 rounded-full border border-slate-200 bg-white text-xs"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              >
                <option>Tümü</option>
                {allStudentNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {viewMode === "weekly" && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {days.map((day, idx) => (
                <div
                  key={day}
                  className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-2xl p-3 text-left shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {day}
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold">
                      {recurringSessionsByDay[idx].length} ders
                    </div>
                  </div>
                  <div className="space-y-2 min-h-[120px]">
                    {recurringSessionsByDay[idx].length === 0 && (
                      <div className="text-xs text-slate-400">
                        Bu gün için ders yok.
                      </div>
                    )}
                    {recurringSessionsByDay[idx].map((session) => (
                      <div
                        key={session.id}
                        className={`rounded-xl border px-3 py-2 shadow-sm ${editingSessionId === session.id
                          ? "border-emerald-300 bg-emerald-50/70"
                          : "border-slate-200 bg-white"
                          }`}
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {session.startTime} • {session.durationHours} saat
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditSession(session)}
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => removeSession(session.id)}
                              className="text-[10px] font-bold text-slate-400 hover:text-red-500"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {session.studentName}
                        </div>
                        {students.find((s) => s.name === session.studentName)
                          ?.level && (
                          <div
                            className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${levelBadgeClass(
                              students.find(
                                (s) => s.name === session.studentName,
                              )?.level,
                            )}`}
                          >
                            {
                              students.find(
                                (s) => s.name === session.studentName,
                              )?.level
                            }
                            {students.find((s) => s.name === session.studentName)
                              ?.weekly_focus
                              ? ` • ${students.find(
                                  (s) => s.name === session.studentName,
                                )?.weekly_focus}`
                              : ""}
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          {session.title} •{" "}
                          {session.isOnline ? "Online" : "Yüz yüze"}
                        </div>
                        {editingSessionId === session.id && (
                          <div className="mt-2 text-[10px] font-semibold text-emerald-600 uppercase tracking-[0.2em]">
                            Düzenleniyor
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const match = students.find(
                              (s) => s.name === session.studentName,
                            );
                            onOpenSummary(session.studentName, match?.id);
                          }}
                          className="mt-2 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                        >
                          Ders özeti aç
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "monthly" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Önceki
                </button>
                <div className="text-sm font-bold text-slate-900">
                  {monthLabel}
                </div>
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Sonraki
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-xs text-slate-500 font-semibold uppercase tracking-[0.2em]">
                {days.map((day) => (
                  <div key={day} className="text-center">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthCells.map((cell, idx) => {
                  const isoDate = cell.date
                    ? cell.date.toISOString().slice(0, 10)
                    : "";
                  const dayIndex =
                    cell.date === null ? -1 : (cell.date.getDay() + 6) % 7;
                  const daySessions =
                    cell.date === null
                      ? []
                      : filteredSessions.filter(
                          (s) =>
                            s.date === isoDate ||
                            (!s.date && s.dayIndex === dayIndex),
                        );
                  return (
                    <div
                      key={`cell-${idx}`}
                      className="min-h-[120px] rounded-2xl border border-slate-200 bg-white/90 p-2 text-xs"
                    >
                      {cell.date && (
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-700">
                            {cell.dayOfMonth}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {daySessions.length} ders
                          </span>
                        </div>
                      )}
                      {!cell.date && <div className="h-full" />}
                      <div className="space-y-1">
                        {daySessions.slice(0, 3).map((session) => {
                          const student =
                            students.find((s) => s.name === session.studentName) ||
                            undefined;
                          return (
                          <div
                            key={session.id}
                            className={`rounded-lg border px-2 py-1 ${editingSessionId === session.id
                              ? "border-emerald-300 bg-emerald-50/70"
                              : "border-slate-100 bg-slate-50"
                              }`}
                          >
                            <div className="font-semibold text-slate-800">
                              {session.studentName}
                            </div>
                            {student?.level && (
                              <div
                                className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${levelBadgeClass(
                                  student.level,
                                )}`}
                              >
                                {student.level}
                                {student.weekly_focus
                                  ? ` • ${student.weekly_focus}`
                                  : ""}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500">
                              {session.startTime} • {session.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditSession(session)}
                                className="mt-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                              >
                                Düzenle
                              </button>
                            <button
                              onClick={() =>
                                onOpenSummary(
                                  session.studentName,
                                  student?.id,
                                )
                              }
                              className="mt-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                            >
                              Özet
                            </button>
                            </div>
                            {editingSessionId === session.id && (
                              <div className="mt-2 text-[9px] font-semibold text-emerald-600 uppercase tracking-[0.2em]">
                                Düzenleniyor
                              </div>
                            )}
                          </div>
                        )})}
                        {daySessions.length > 3 && (
                          <div className="text-[10px] text-slate-400">
                            +{daySessions.length - 3} daha
                          </div>
                        )}
                        {cell.date && (
                          <button
                            onClick={() =>
                              setSessionDraft((prev) => ({
                                ...prev,
                                dayIndex: dayIndex < 0 ? 0 : dayIndex,
                                date: isoDate,
                                repeatWeekly: false,
                              }))
                            }
                            className="mt-2 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                          >
                            Bu tarihe ekle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {pendingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="text-lg font-bold text-slate-900">
              Düzenleme Değişikliği
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Başka bir dersi düzenlemek üzeresin. Mevcut değişiklikleri ne
              yapalım?
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={saveAndSwitch}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"
              >
                Kaydet ve geç
              </button>
              <button
                onClick={discardAndSwitch}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Kaydetmeden geç
              </button>
              <button
                onClick={() => setPendingSession(null)}
                className="px-4 py-2 rounded-full text-slate-400 text-xs font-semibold"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </CardShell>
  );
}

function QuizPdfView() {
  const [level, setLevel] = useState("A2");
  const [topic, setTopic] = useState("Yönelme eki -e/-a");
  const [count, setCount] = useState(10);
  const [includeKey, setIncludeKey] = useState(true);
  const [studentName, setStudentName] = useState("Öğrenci");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8010/quiz-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          topic,
          question_count: count,
          include_answer_key: includeKey,
          student_name: studentName || undefined,
        }),
      });
      const data = await res.json();
      if (!data?.content_base64) {
        throw new Error("PDF üretilemedi.");
      }
      const byteCharacters = atob(data.content_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "quiz.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message ?? "PDF üretilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardShell
      title="Quiz PDF Üretici"
      description="LLM ile pratik odaklı çalışma kağıdı oluştur ve PDF olarak indir."
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
          <input
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Öğrenci adı"
          />
          <input
            type="number"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-24"
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 10)}
          />
        </div>
        <input
          className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeKey}
            onChange={(e) => setIncludeKey(e.target.checked)}
          />
          Cevap anahtarı ekle
        </label>
        <button
          onClick={generatePdf}
          disabled={loading}
          className="mx-auto px-8 py-3 rounded-2xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg transition-all"
        >
          {loading ? "PDF Hazırlanıyor..." : "Quiz PDF Oluştur"}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </CardShell>
  );
}

function ScenarioDialoguesView() {
  const [level, setLevel] = useState("A2");
  const [scenario, setScenario] = useState("Markette alışveriş");
  const [customScenario, setCustomScenario] = useState("");
  const [turnCount, setTurnCount] = useState(12);
  const [lastDialogue, setLastDialogue] = useState<string | null>(null);
  const [lastCards, setLastCards] = useState<string | null>(null);
  const [includeExerciseKey, setIncludeExerciseKey] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [send, state] = useLLMRequest<
    {
      level: string;
      scenario: string;
      turn_count: number;
      avoid?: string;
      variation_token?: string;
    },
    { dialogue: string }
  >("/scenario-dialogue");

  const [sendCards, cardsState] = useLLMRequest<
    { level: string; scenario: string; card_count: number },
    { cards: string }
  >("/roleplay-cards");

  const [sendExercises, exercisesState] = useLLMRequest<
    { level: string; dialogue: string; include_key?: boolean },
    { exercises: string }
  >("/dialogue-exercises");

  const resolvedScenario =
    scenario === "Diğer" ? customScenario.trim() : scenario;
  const canGenerate = resolvedScenario.length > 0;

  const handleGenerate = (avoid?: string) => {
    if (!canGenerate || state.loading) return;
    const variation_token = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    send({
      level,
      scenario: resolvedScenario,
      turn_count: turnCount,
      avoid,
      variation_token,
    });
  };

  useEffect(() => {
    if (state.result?.dialogue) {
      setLastDialogue(state.result.dialogue);
    }
  }, [state.result?.dialogue]);

  useEffect(() => {
    if (cardsState.result?.cards) {
      setLastCards(cardsState.result.cards);
    }
  }, [cardsState.result?.cards]);

  useEffect(() => {
    setLastDialogue(null);
    setLastCards(null);
  }, [level, scenario, customScenario, turnCount]);

  const downloadCardsPdf = async () => {
    if (!canGenerate || pdfLoading) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("http://localhost:8010/roleplay-cards-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          scenario: resolvedScenario,
          card_count: 5,
          cards_text: lastCards || undefined,
        }),
      });
      const data = await res.json();
      if (!data?.content_base64) {
        throw new Error("PDF üretilemedi.");
      }
      const byteCharacters = atob(data.content_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "rol-play-kartlari.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setPdfError(e?.message ?? "PDF üretilemedi.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <CardShell
      title="Senaryo Diyalogları"
      description="Gerçek hayat senaryoları için seviyeye uygun, pratik diyaloglar üret."
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            <option>Markette alışveriş</option>
            <option>Restoranda sipariş</option>
            <option>Doktorda randevu</option>
            <option>Yol tarifi sorma</option>
            <option>İş görüşmesi</option>
            <option>Ev arkadaşıyla konuşma</option>
            <option>Ev sahibine mesaj/konuşma</option>
            <option>Telefon görüşmesi</option>
            <option>Kargoda sorun çözme</option>
            <option>Banka işlemi</option>
            <option>Otelde check-in</option>
            <option>Toplu taşıma</option>
            <option>Diğer</option>
          </select>
          <input
            type="number"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-24"
            value={turnCount}
            onChange={(e) => setTurnCount(Number(e.target.value) || 12)}
            min={8}
            max={24}
          />
        </div>

        {scenario === "Diğer" && (
          <input
            className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="Senaryoyu yaz (örn. Emlakçıyla ev bakma)"
          />
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleGenerate()}
            disabled={state.loading || !canGenerate}
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:bg-slate-800 transition disabled:opacity-40"
          >
            {state.loading ? "Üretiliyor..." : "Diyalog Oluştur"}
          </button>
          <button
            onClick={() => handleGenerate(lastDialogue ?? undefined)}
            disabled={state.loading || !canGenerate || !lastDialogue}
            className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition disabled:opacity-40"
          >
            Yeniden Üret
          </button>
        </div>

        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.result?.dialogue && (
          <MarkdownResult content={state.result.dialogue} />
        )}

        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() =>
              canGenerate &&
              sendCards({ level, scenario: resolvedScenario, card_count: 5 })
            }
            disabled={cardsState.loading || !canGenerate}
            className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:bg-emerald-500 transition disabled:opacity-40"
          >
            {cardsState.loading ? "Kartlar..." : "Rol-Play Kartları"}
          </button>
          <button
            onClick={() =>
              lastDialogue &&
              sendExercises({
                level,
                dialogue: lastDialogue,
                include_key: includeExerciseKey,
              })
            }
            disabled={exercisesState.loading || !lastDialogue}
            className="px-5 py-2 rounded-full border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-50 transition disabled:opacity-40"
          >
            {exercisesState.loading ? "Alıştırma..." : "Diyalogdan Alıştırma"}
          </button>
          <button
            onClick={downloadCardsPdf}
            disabled={pdfLoading || !canGenerate}
            className="px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition disabled:opacity-40"
          >
            {pdfLoading ? "PDF..." : "Kartları PDF İndir"}
          </button>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600 justify-center">
          <input
            type="checkbox"
            checked={includeExerciseKey}
            onChange={(e) => setIncludeExerciseKey(e.target.checked)}
          />
          Alıştırma için cevap anahtarı ekle
        </label>

        {cardsState.error && (
          <p className="text-xs text-red-500 mt-1">{cardsState.error}</p>
        )}
        {pdfError && <p className="text-xs text-red-500 mt-1">{pdfError}</p>}
        {cardsState.result?.cards && (
          <MarkdownResult content={cardsState.result.cards} />
        )}

        {exercisesState.error && (
          <p className="text-xs text-red-500 mt-1">{exercisesState.error}</p>
        )}
        {exercisesState.result?.exercises && (
          <MarkdownResult content={exercisesState.result.exercises} />
        )}
      </div>
    </CardShell>
  );
}

function SummaryView({
  prefillStudentName,
  prefillStudentId,
  prefillNotes,
  prefillNextTopics,
}: {
  prefillStudentName?: string;
  prefillStudentId?: string;
  prefillNotes?: string;
  prefillNextTopics?: string;
}) {
  const [notes, setNotes] = useState(
    "Bugün yönelme eki, günlük rutin ve konuşma pratiği yaptık.",
  );
  const [nextTopics, setNextTopics] = useState(
    "Gelecek ders: ayrılma eki -den/-dan ve geçmiş zaman.",
  );
  const [studentName, setStudentName] = useState("Öğrenci");
  const [level, setLevel] = useState("A2");
  const [messageTemplate, setMessageTemplate] = useState(
    "Bu derste ... Bir sonraki derste ...",
  );
  const [homeworkPreferences, setHomeworkPreferences] = useState("");
  const [struggleAreas, setStruggleAreas] = useState("");
  const [students, setStudents] = useState<
    Array<{
      id: string;
      name: string;
      level: string;
      message_template: string;
      homework_preferences: string;
      struggle_areas: string;
    }>
  >([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [send, state] = useLLMRequest<
    {
      notes: string;
      next_topics?: string;
      student_name?: string;
      level?: string;
      message_template?: string;
      homework_preferences?: string;
      struggle_areas?: string;
    },
    { summary: string }
  >("/summary");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch("http://localhost:8010/students");
        const data = await res.json();
        if (data?.students) {
          setStudents(data.students);
        }
      } catch {
        // ignore
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) {
      return;
    }
    setStudentName(student.name);
    setLevel(student.level || "A2");
    setMessageTemplate(
      student.message_template || "Bu derste ... Bir sonraki derste ...",
    );
    setHomeworkPreferences(student.homework_preferences || "");
    setStruggleAreas(student.struggle_areas || "");
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (prefillStudentId) {
      setSelectedStudentId(prefillStudentId);
      return;
    }
    if (prefillStudentName) {
      setStudentName(prefillStudentName);
    }
  }, [prefillStudentId, prefillStudentName]);

  useEffect(() => {
    if (prefillNotes) {
      setNotes(prefillNotes);
    }
  }, [prefillNotes]);

  useEffect(() => {
    if (prefillNextTopics) {
      setNextTopics(prefillNextTopics);
    }
  }, [prefillNextTopics]);

  return (
    <CardShell
      title="Ders Sonrası Özetleyici"
      description="Kendi notunu yaz; öğrenciye gidecek özet, ödev ve tekrar listesi üret."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "Konuşma Dersi",
              text: "Konuşma pratiği, akıcılık ve telaffuz odaklı ders yaptık.",
            },
            {
              label: "Dilbilgisi",
              text: "Dilbilgisi konusu işlendi, örnekler ve alıştırmalar yapıldı.",
            },
            {
              label: "Dinleme",
              text: "Dinleme parçası üzerinde çalışıldı, ana fikir ve detaylar çıkarıldı.",
            },
            {
              label: "Yazma",
              text: "Yazma pratiği yapıldı, cümle kurma ve paragraf yazımı çalışıldı.",
            },
          ].map((tpl) => (
            <button
              key={tpl.label}
              onClick={() =>
                setNotes((prev) =>
                  prev ? `${prev}\n${tpl.text}` : tpl.text,
                )
              }
              className="px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              {tpl.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Öğrenci seç (opsiyonel)</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
          <input
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm w-40"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Öğrenci adı (opsiyonel)"
          />
        </div>
        <textarea
          className="w-full min-h-[120px] text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <textarea
          className="w-full min-h-[90px] text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={nextTopics}
          onChange={(e) => setNextTopics(e.target.value)}
        />
        <input
          className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          placeholder="Mesaj şablonu"
        />
        <input
          className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={homeworkPreferences}
          onChange={(e) => setHomeworkPreferences(e.target.value)}
          placeholder="Ödev tercihleri"
        />
        <input
          className="w-full text-sm rounded-2xl border border-slate-200 px-3 py-2 outline-none bg-slate-50 focus:bg-white"
          value={struggleAreas}
          onChange={(e) => setStruggleAreas(e.target.value)}
          placeholder="Zorlanılan alanlar"
        />
        <button
          onClick={() =>
            send({
              notes,
              next_topics: nextTopics || undefined,
              student_name: studentName || undefined,
              level: level || undefined,
              message_template: messageTemplate || undefined,
              homework_preferences: homeworkPreferences || undefined,
              struggle_areas: struggleAreas || undefined,
            })
          }
          disabled={state.loading}
          className="mx-auto px-8 py-3 rounded-2xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg transition-all"
        >
          {state.loading ? "Özetleniyor..." : "Özet Oluştur"}
        </button>
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.error && (
          <p className="text-xs text-red-500 mt-1">{state.error}</p>
        )}
        {state.result?.summary && <MarkdownResult content={state.result.summary} />}
      </div>
    </CardShell>
  );
}

function HomeView({
  onStart,
  scheduleEntries,
  onOpenSummary,
  studentsIndex,
}: {
  onStart: () => void;
  scheduleEntries: Array<{
    id: string;
    dayIndex: number;
    startTime: string;
    durationHours: number;
    studentName: string;
    title: string;
    isOnline: boolean;
    date: string;
  }>;
  onOpenSummary: (
    studentName?: string,
    studentId?: string,
    notes?: string,
    nextTopics?: string,
  ) => void;
  studentsIndex: Record<
    string,
    {
      id: string;
      name: string;
      level: string;
      weekly_focus?: string;
      target?: string;
      struggle_areas?: string;
      assessment_note?: string;
    }
  >;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  const toUpcoming = (entry: (typeof scheduleEntries)[number]) => {
    const [h, m] = entry.startTime.split(":").map((n) => Number(n));
    if (entry.date) {
      const dt = new Date(`${entry.date}T${entry.startTime}:00`);
      return { ...entry, nextDate: dt };
    }
    const todayIndex = (now.getDay() + 6) % 7;
    let delta = entry.dayIndex - todayIndex;
    if (delta < 0) {
      delta += 7;
    }
    const candidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + delta,
      h,
      m,
      0,
      0,
    );
    if (candidate < now) {
      candidate.setDate(candidate.getDate() + 7);
    }
    return { ...entry, nextDate: candidate };
  };

  const upcoming = scheduleEntries
    .map(toUpcoming)
    .filter((e) => e.nextDate && e.nextDate >= now)
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, 6);

  const isToday = (d: Date) => dayLabel(d) === "Bugün";

  const formatDate = (d: Date) =>
    d.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const dayLabel = (d: Date) => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) {
      return "Bugün";
    }
    if (diffDays === 1) {
      return "Yarın";
    }
    return "";
  };

  const isWithinHour = (d: Date) => {
    const diff = d.getTime() - now.getTime();
    return diff >= 0 && diff <= 60 * 60 * 1000;
  };

  const minutesUntil = (d: Date) => {
    const diffMs = d.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (60 * 1000)));
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-3xl opacity-20 -z-10 rounded-full" />
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl mx-auto transform hover:rotate-12 transition-transform duration-500">
          <svg
            viewBox="0 0 24 24"
            className="h-14 w-14 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 17h16" />
            <path d="M6 17a6 6 0 0 1 12 0" />
            <path d="M12 5v3" />
            <path d="M7.5 7.5l2 2" />
            <path d="M16.5 7.5l-2 2" />
            <path d="M4 12h2" />
            <path d="M18 12h2" />
          </svg>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
          Selam! Senin İçin <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">Buradayım.</span> ✨
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Türkçe derslerini hazırlarken sana zaman kazandıracak küçük bir asistan.
          Ders planları, alıştırmalar ve her şey burada, senin için hazır.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
        {[
          {
            title: "Derslerini Planla",
            desc: "Dersin konusunu yaz, şık bir akış saniyeler içinde hazır olsun.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-teal-500">
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
                <line x1="17.5" y1="15" x2="9" y2="15" />
              </svg>
            ),
          },
          {
            title: "İçerik Hazırla",
            desc: "Öğrencilerin için yaratıcı örnekler ve materyaller üret.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-cyan-500">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            ),
          },
          {
            title: "Notlarını Tut",
            desc: "Tüm fikirlerini ve özetlerini dilediğin gibi güvenle sakla.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            ),
          },
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{feat.icon}</div>
            <h3 className="font-bold text-slate-900 mb-2 text-lg">{feat.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-5xl">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8 text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Yaklaşan Dersler
              </h2>
              <p className="text-sm text-slate-500">
                Tarih, gün ve saat bilgisiyle hızlı görünüm.
              </p>
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Online Dersler
            </div>
          </div>

          {upcoming.length === 0 && (
            <div className="text-sm text-slate-400">
              Henüz planlanmış ders yok.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcoming
              .sort((a, b) => {
                const aToday = isToday(a.nextDate);
                const bToday = isToday(b.nextDate);
                if (aToday && !bToday) return -1;
                if (!aToday && bToday) return 1;
                return a.nextDate.getTime() - b.nextDate.getTime();
              })
              .map((item) => {
              const label = dayLabel(item.nextDate);
              const withinHour = isWithinHour(item.nextDate);
              const minsLeft = withinHour ? minutesUntil(item.nextDate) : null;
              const labelStyle =
                label === "Bugün"
                  ? "bg-emerald-500 text-white"
                  : label === "Yarın"
                    ? "bg-amber-400 text-slate-900"
                    : "bg-slate-200 text-slate-600";
              const student = studentsIndex[item.studentName];
              const levelColor =
                student?.level === "A1"
                  ? "bg-emerald-600 text-white"
                  : student?.level === "A2"
                    ? "bg-teal-600 text-white"
                    : student?.level === "B1"
                      ? "bg-indigo-600 text-white"
                      : student?.level === "B2"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-900 text-white";
              return (
              <div
                key={item.id}
                className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ${withinHour ? "upcoming-shake" : ""} ${label === "Bugün"
                  ? "md:col-span-2 ring-2 ring-emerald-200"
                  : ""
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    {formatDate(item.nextDate)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${labelStyle}`}
                  >
                    {label || "Plan"}
                  </span>
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {item.studentName}
                </div>
                {student?.level && (
                  <div
                    className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${levelColor}`}
                  >
                    {student.level}
                  </div>
                )}
                <div className="text-sm text-slate-500">
                  {item.title || "Türkçe dersi"}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold">
                    {formatTime(item.nextDate)}
                  </span>
                  <span>• {item.durationHours} saat</span>
                  <span>• {item.isOnline ? "Online" : "Yüz yüze"}</span>
                  {minsLeft !== null && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500 text-white font-semibold upcoming-blink">
                      {minsLeft} dk kaldı
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    onOpenSummary(
                      item.studentName,
                      student?.id,
                      `Tarih: ${formatDate(item.nextDate)} ${formatTime(
                        item.nextDate,
                      )} — ${item.studentName} (${item.title || "Türkçe dersi"})`,
                      student?.weekly_focus && student?.struggle_areas
                        ? `Bir sonraki ders: ${student.weekly_focus}. Zorlanılan alan: ${student.struggle_areas}.`
                        : student?.weekly_focus
                          ? `Bir sonraki ders: ${student.weekly_focus}`
                          : student?.struggle_areas
                            ? `Bir sonraki ders: ${student.struggle_areas} tekrar`
                            : student?.target
                              ? `Bir sonraki ders: ${student.target}`
                              : `Bir sonraki ders: ${item.title || "Türkçe dersi"} devamı.`,
                    )
                  }
                  className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Ders Özeti Aç
                </button>
              </div>
            )})}
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="mt-12 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transform hover:scale-105 transition-all shadow-xl"
      >
        Haydi Başlayalım
      </button>
    </div>
  );
}

export default App;
