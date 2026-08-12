"use client";

import type { EventDTO, ClubDTO, SportsTeamDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

type Tab = "events" | "clubs" | "teams";

const emptyEvent = { title: "", description: "", event_type: "academic", start_date: "", end_date: "", location: "", status: "planned" };
const emptyClub = { name: "", description: "", coordinator: "" };
const emptyTeam = { name: "", sport_type: "", coach: "", max_players: "", status: "active" };

const EVENT_TYPE_KEYS = ["academic", "cultural", "sports", "holiday", "exam", "other"];

export default function ManagementActivitiesPage() {
  const { t } = useI18n();
  const data = useApi<{ events: EventDTO[]; clubs: ClubDTO[]; teams: SportsTeamDTO[] }>("/api/v1/activities");

  const [tab, setTab] = useState<Tab>("events");
  const [showForm, setShowForm] = useState(false);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [clubForm, setClubForm] = useState(emptyClub);
  const [teamForm, setTeamForm] = useState(emptyTeam);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const events = data.data?.events ?? [];
  const clubs = data.data?.clubs ?? [];
  const teams = data.data?.teams ?? [];

  const eventType = (v: string) => (EVENT_TYPE_KEYS.includes(v) ? t(`val.${v}`) : v);
  const eventStatus = (v: string) => (["planned", "confirmed", "completed", "cancelled"].includes(v) ? t(`val.${v}`) : v);
  const teamStatus = (v: string) => (["active", "inactive"].includes(v) ? t(`val.${v}`) : v);

  async function submitEvent(e: FormEvent) {
    e.preventDefault();
    await post("/api/v1/activities/events", eventForm, () => setEventForm(emptyEvent));
  }
  async function submitClub(e: FormEvent) {
    e.preventDefault();
    await post("/api/v1/activities/clubs", clubForm, () => setClubForm(emptyClub));
  }
  async function submitTeam(e: FormEvent) {
    e.preventDefault();
    await post("/api/v1/activities/teams", { ...teamForm, max_players: teamForm.max_players ? Number(teamForm.max_players) : undefined }, () => setTeamForm(emptyTeam));
  }

  async function post(path: string, body: unknown, reset: () => void) {
    setSaving(true);
    setFormError(null);
    try {
      await apiClient(path, { method: "POST", body });
      reset();
      setShowForm(false);
      data.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "events", label: t("activities.tab.events"), count: events.length },
    { key: "clubs", label: t("activities.tab.clubs"), count: clubs.length },
    { key: "teams", label: t("activities.tab.teams"), count: teams.length },
  ];

  const addLabel = showForm
    ? t("common.cancel")
    : tab === "events"
      ? t("activities.addEvent")
      : tab === "clubs"
        ? t("activities.addClub")
        : t("activities.addTeam");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("activities.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("activities.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>{addLabel}</button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-px dark:border-slate-800">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => { setTab(tb.key); setShowForm(false); }}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
              tab === tb.key
                ? "border-b-2 border-indigo-600 bg-indigo-50/60 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tb.label} <span className="ml-1 text-xs text-slate-400">{tb.count}</span>
          </button>
        ))}
      </div>

      <PageState state={{ loading: data.loading, error: data.error }} />

      {showForm ? renderForm() : null}

      {tab === "events" && events.length ? (
        <Card>
          <CardHeader title={t("activities.eventsTitle").replace("{n}", String(events.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("activities.col.title"), t("activities.col.type"), t("activities.col.date"), t("activities.col.location"), t("activities.col.status")]}
              rows={events.map((ev) => [
                <div key={`${ev.id}-n`}>
                  <div className="font-medium text-slate-800 dark:text-slate-100">{ev.title}</div>
                  {ev.description ? <div className="mt-0.5 line-clamp-1 text-xs text-slate-400 dark:text-slate-500">{ev.description}</div> : null}
                </div>,
                ev.event_type ? eventType(ev.event_type) : "—",
                `${(ev.start_date ?? "").slice(0, 10)}${ev.end_date && ev.end_date !== ev.start_date ? ` → ${ev.end_date.slice(0, 10)}` : ""}`,
                ev.location ?? "—",
                <Badge key={`${ev.id}-s`} tone={ev.status === "completed" ? "green" : ev.status === "cancelled" ? "rose" : "indigo"}>{ev.status ? eventStatus(ev.status) : "-"}</Badge>,
              ])}
            />
          </div>
        </Card>
      ) : null}

      {tab === "clubs" && clubs.length ? (
        <Card>
          <CardHeader title={t("activities.clubsTitle").replace("{n}", String(clubs.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("activities.col.club"), t("activities.col.coordinator"), t("activities.col.description")]}
              rows={clubs.map((c) => [
                <div key={`${c.id}-n`} className="font-medium text-slate-800 dark:text-slate-100">{c.name}</div>,
                c.coordinator ?? "—",
                c.description ?? "—",
              ])}
            />
          </div>
        </Card>
      ) : null}

      {tab === "teams" && teams.length ? (
        <Card>
          <CardHeader title={t("activities.teamsTitle").replace("{n}", String(teams.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("activities.col.team"), t("activities.col.sport"), t("activities.col.coach"), t("activities.col.maxPlayers"), t("activities.col.status")]}
              rows={teams.map((tm) => [
                <div key={`${tm.id}-n`} className="font-medium text-slate-800 dark:text-slate-100">{tm.name}</div>,
                tm.sport_type ?? "—",
                tm.coach ?? "—",
                tm.max_players ?? "—",
                <Badge key={`${tm.id}-s`} tone={tm.status === "active" ? "green" : "slate"}>{tm.status ? teamStatus(tm.status) : "-"}</Badge>,
              ])}
            />
          </div>
        </Card>
      ) : null}

      {!events.length && !clubs.length && !teams.length ? (
        <Card>
          <CardHeader title={t("activities.empty")} subtitle={t("activities.emptyHint")} />
        </Card>
      ) : null}
    </div>
  );

  function renderForm() {
    if (tab === "events") {
      return (
        <Card>
          <CardHeader title={t("activities.form.event")} />
          <form onSubmit={submitEvent} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label={`${t("field.title")} *`} value={eventForm.title} onChange={(v) => setEventForm((f) => ({ ...f, title: v }))} required /></div>
            <div className="sm:col-span-2"><Field label={t("field.description")} value={eventForm.description} onChange={(v) => setEventForm((f) => ({ ...f, description: v }))} /></div>
            <div>
              <label className={labelCls}>{t("field.type")}</label>
              <select value={eventForm.event_type} onChange={(e) => setEventForm((f) => ({ ...f, event_type: e.target.value }))} className={inputCls}>
                {["academic", "cultural", "sports", "parent", "holiday", "exam", "other"].map((v) => <option key={v} value={v}>{eventType(v)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("field.status")}</label>
              <select value={eventForm.status} onChange={(e) => setEventForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                {["planned", "confirmed", "completed", "cancelled"].map((s) => <option key={s} value={s}>{eventStatus(s)}</option>)}
              </select>
            </div>
            <Field label={t("activities.form.startDate")} value={eventForm.start_date} onChange={(v) => setEventForm((f) => ({ ...f, start_date: v }))} placeholder="YYYY-MM-DD" />
            <Field label={t("activities.form.endDate")} value={eventForm.end_date} onChange={(v) => setEventForm((f) => ({ ...f, end_date: v }))} placeholder="YYYY-MM-DD" />
            <div className="sm:col-span-2"><Field label={t("field.location")} value={eventForm.location} onChange={(v) => setEventForm((f) => ({ ...f, location: v }))} /></div>
            {errorRow()}
            <div className="sm:col-span-2"><Submit saving={saving} label={t("activities.form.createEvent")} savingLabel={t("activities.saving")} /></div>
          </form>
        </Card>
      );
    }
    if (tab === "clubs") {
      return (
        <Card>
          <CardHeader title={t("activities.form.club")} />
          <form onSubmit={submitClub} className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label={`${t("field.name")} *`} value={clubForm.name} onChange={(v) => setClubForm((f) => ({ ...f, name: v }))} required />
            <Field label={t("field.coordinator")} value={clubForm.coordinator} onChange={(v) => setClubForm((f) => ({ ...f, coordinator: v }))} />
            <div className="sm:col-span-2"><Field label={t("field.description")} value={clubForm.description} onChange={(v) => setClubForm((f) => ({ ...f, description: v }))} /></div>
            {errorRow()}
            <div className="sm:col-span-2"><Submit saving={saving} label={t("activities.form.createClub")} savingLabel={t("activities.saving")} /></div>
          </form>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader title={t("activities.form.team")} />
        <form onSubmit={submitTeam} className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label={`${t("activities.form.teamName")} *`} value={teamForm.name} onChange={(v) => setTeamForm((f) => ({ ...f, name: v }))} required />
          <Field label={t("field.sport")} value={teamForm.sport_type} onChange={(v) => setTeamForm((f) => ({ ...f, sport_type: v }))} placeholder="e.g. Cricket" />
          <Field label={t("field.coach")} value={teamForm.coach} onChange={(v) => setTeamForm((f) => ({ ...f, coach: v }))} />
          <Field label={t("field.maxPlayers")} value={teamForm.max_players} onChange={(v) => setTeamForm((f) => ({ ...f, max_players: v }))} />
          <div>
            <label className={labelCls}>{t("field.status")}</label>
            <select value={teamForm.status} onChange={(e) => setTeamForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
              {["active", "inactive"].map((s) => <option key={s} value={s}>{teamStatus(s)}</option>)}
            </select>
          </div>
          {errorRow()}
          <div className="sm:col-span-2"><Submit saving={saving} label={t("activities.form.createTeam")} savingLabel={t("activities.saving")} /></div>
        </form>
      </Card>
    );
  }

  function errorRow() {
    return formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null;
  }
}

const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} required={required} />
    </div>
  );
}

function Submit({ saving, label, savingLabel }: { saving: boolean; label: string; savingLabel: string }) {
  return <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? savingLabel : label}</button>;
}