"use client";

import type { AiLessonDTO, AiQuizDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { Mic, Volume2 } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";

type Tab = "lessons" | "quizzes" | "assistant";

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const emptyLesson = { title: "", subject_id: "", class_id: "", topic: "", duration: "45", content: "", status: "draft" };
const emptyQuiz = { title: "", subject_id: "", class_id: "", topic: "", difficulty: "medium", questions: "", status: "draft" };
const emptyForm = { ...emptyLesson, ...emptyQuiz };

export default function ManagementAiPage() {
  const { t, lang } = useI18n();
  const lessons = useApi<{ lessons: AiLessonDTO[] }>("/api/v1/ai/lessons");
  const quizzes = useApi<{ quizzes: AiQuizDTO[] }>("/api/v1/ai/quizzes");

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const [tab, setTab] = useState<Tab>("lessons");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [query, setQuery] = useState("");
  const [chatting, setChatting] = useState(false);
  const [listening, setListening] = useState(false);

  const speechLang = lang === "hi" ? "hi-IN" : "en-IN";

  const lessonList = lessons.data?.lessons ?? [];
  const quizList = quizzes.data?.quizzes ?? [];
  const classList = [...new Set(lessonList.map((l) => l.class_id).concat(quizList.map((q) => q.class_id)).filter(Boolean))];
  const classCount = classList.length;

  const RecognitionCtor =
    typeof window !== "undefined"
      ? (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
          .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition
      : undefined;

  function startListening() {
    if (!RecognitionCtor) {
      alert(t("ai.micUnsupported"));
      return;
    }
    const rec = new RecognitionCtor();
    recRef.current = rec;
    rec.lang = speechLang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    rec.start();
    setListening(true);
  }

  function stopListening() {
    const rec = recRef.current;
    recRef.current = null;
    setListening(false);
    if (rec) {
      try {
        rec.stop();
      } catch {
        // already stopped
      }
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function isQuizTab() {
    return tab === "quizzes";
  }

  async function submitCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (tab === "lessons") {
        await apiClient("/api/v1/ai/lessons", {
          method: "POST",
          body: {
            title: form.title,
            subject_id: form.subject_id || undefined,
            class_id: form.class_id || undefined,
            topic: form.topic || undefined,
            duration: form.duration ? Number(form.duration) : undefined,
            content: form.content || undefined,
            status: form.status,
          },
        });
        lessons.reload();
      } else if (tab === "quizzes") {
        const parsed = (() => {
          try {
            const rows = JSON.parse(form.questions || "[]");
            return Array.isArray(rows) ? rows : [];
          } catch {
            return form.questions
              .split("\n")
              .filter((line) => line.trim())
              .map((line) => ({ question: line.trim() }));
          }
        })();
        await apiClient("/api/v1/ai/quizzes", {
          method: "POST",
          body: {
            title: form.title,
            subject_id: form.subject_id || undefined,
            class_id: form.class_id || undefined,
            topic: form.topic || undefined,
            difficulty: form.difficulty,
            questions: parsed,
            status: form.status,
          },
        });
        quizzes.reload();
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("ai.createFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function sendQuery(event: FormEvent) {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setQuery("");
    setChatting(true);
    try {
      const reply = await apiClient<{ response: string }>("/api/v1/ai/chat", { method: "POST", body: { query: text } });
      setMessages((m) => [...m, { role: "assistant", text: reply.response }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: err instanceof Error ? err.message : t("ai.chatFailed") }]);
    } finally {
      setChatting(false);
    }
  }

  const combinedError = lessons.error ?? quizzes.error;
  const combinedLoading = lessons.loading || quizzes.loading;

  const tabsArr: { key: Tab; label: string; count: number }[] = [
    { key: "lessons", label: t("ai.tab.lessons"), count: lessonList.length },
    { key: "quizzes", label: t("ai.tab.quizzes"), count: quizList.length },
    { key: "assistant", label: t("ai.tab.assistant"), count: messages.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("ai.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("ai.subtitle")}</p>
        </div>
        {tab !== "assistant" ? (
          <button
            type="button"
            onClick={() => {
              setShowForm((s) => !s);
              setForm(emptyForm);
            }}
            className={buttonClasses("primary")}
          >
            {showForm ? t("common.cancel") : isQuizTab() ? t("ai.addQuiz") : t("ai.addLesson")}
          </button>
        ) : null}
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-px dark:border-slate-800">
        {tabsArr.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setShowForm(false);
            }}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
              tab === item.key
                ? "border-b-2 border-indigo-600 bg-indigo-50/60 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {item.label} {item.key !== "assistant" ? <span className="ml-1 text-xs text-slate-400">{item.count}</span> : null}
          </button>
        ))}
      </div>

      <PageState state={{ loading: combinedLoading, error: combinedError }} />

      {tab === "assistant" ? (
        <Card className="p-0">
          <CardHeader title={t("ai.assistantName")} subtitle={t("ai.assistantSubtitle")} />
          <div className="max-h-96 space-y-3 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">{t("ai.hint")}</p>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                      m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "assistant" ? (
                    <button
                      type="button"
                      onClick={() => speak(m.text)}
                      aria-label={t("ai.listen")}
                      className="ml-1.5 self-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))
            )}
            {chatting ? <div className="text-xs text-slate-400 dark:text-slate-500">{t("ai.typing")}</div> : null}
          </div>
          <form onSubmit={sendQuery} className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder={t("ai.placeholder")}
            />
            <button
              type="button"
              onClick={() => (listening ? stopListening() : startListening())}
              aria-label={t("ai.mic")}
              className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 ${
                listening
                  ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40"
                  : "border-slate-300 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button type="submit" disabled={chatting || !query.trim()} className={buttonClasses("primary")}>
              {chatting ? "…" : t("ai.send")}
            </button>
          </form>
        </Card>
      ) : showForm ? (
        <Card>
          <CardHeader title={isQuizTab() ? t("ai.newQuiz") : t("ai.newLesson")} />
          <form onSubmit={submitCreate} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("field.title")} *</label>
              <input value={form.title} onChange={(e) => setF("title", e.target.value)} className={inputCls} required />
            </div>
            <InputField label={t("field.topic")} value={form.topic} onChange={(v) => setF("topic", v)} />
            {isQuizTab() ? (
              <div>
                <label className={labelCls}>{t("field.difficulty")}</label>
                <select value={form.difficulty} onChange={(e) => setF("difficulty", e.target.value)} className={inputCls}>
                  {["easy", "medium", "hard"].map((d) => (
                    <option key={d} value={d}>
                      {t(`val.${d}`)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <InputField label={t("field.duration")} value={form.duration} onChange={(v) => setF("duration", v)} />
            )}
            {isQuizTab() ? (
              <div className="sm:col-span-2">
                <label className={labelCls}>{t("field.questions")}</label>
                <textarea value={form.questions} onChange={(e) => setF("questions", e.target.value)} className={inputCls} rows={5} />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className={labelCls}>{t("field.content")}</label>
                <textarea value={form.content} onChange={(e) => setF("content", e.target.value)} className={inputCls} rows={5} />
              </div>
            )}
            {formError ? (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">
                {formError}
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                {saving ? t("ai.creating") : isQuizTab() ? t("ai.createQuiz") : t("ai.createLesson")}
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <>
          {lessonList.length && !isQuizTab() ? (
            <Card>
              <CardHeader title={t("ai.lessonsTitle").replace("{n}", String(lessonList.length))} />
              <Table
                headers={[t("field.title"), t("field.topic"), t("field.duration"), t("field.status")]}
                rows={lessonList.map((l) => [
                  <div key={`${l.id}-t`}>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{l.title}</div>
                    {l.content ? <div className="mt-0.5 line-clamp-1 text-xs text-slate-400">{l.content}</div> : null}
                  </div>,
                  l.topic ?? "—",
                  l.duration != null ? `${l.duration} min` : "—",
                  <Badge key={`${l.id}-s`} tone={l.status === "published" ? "green" : "amber"}>
                    {l.status === "published" ? t("val.published") : t("val.draft")}
                  </Badge>,
                ])}
              />
            </Card>
          ) : null}
          {quizList.length && isQuizTab() ? (
            <Card>
              <CardHeader title={t("ai.quizzesTitle").replace("{n}", String(quizList.length))} />
              <Table
                headers={[t("field.title"), t("field.topic"), t("field.difficulty"), t("field.questions"), t("field.status")]}
                rows={quizList.map((q) => [
                  <div key={`${q.id}-t`}>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{q.title}</div>
                    {classCount ? <div className="text-xs text-slate-400">{t("ai.targetClass").replace("{n}", String(classCount))}</div> : null}
                  </div>,
                  q.topic ?? "—",
                  <Badge key={`${q.id}-d`} tone={q.difficulty === "easy" ? "green" : q.difficulty === "hard" ? "rose" : "amber"}>
                    {q.difficulty ? t(`val.${q.difficulty}`) : "-"}
                  </Badge>,
                  q.question_count ?? 0,
                  <Badge key={`${q.id}-s`} tone={q.status === "published" ? "green" : "amber"}>
                    {q.status === "published" ? t("val.published") : t("val.draft")}
                  </Badge>,
                ])}
              />
            </Card>
          ) : null}
          {lessonList.length === 0 && quizList.length === 0 ? (
            <Card>
              <CardHeader title={t("ai.emptyTitle")} subtitle={t("ai.emptySubtitle")} />
            </Card>
          ) : null}
        </>
      )}
    </div>
  );

  function setF<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
}

const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
    </div>
  );
}