"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import {
  getHexagramNumber,
  getTransformedHexagramNumber,
  getHexagram,
  type Hexagram,
} from "@/lib/iching-data";
import type { User } from "@supabase/supabase-js";

type Phase = "intro" | "oracle" | "result";
type LineValue = 6 | 7 | 8 | 9;

interface Reading {
  id: string;
  question: string;
  lines: number[];
  primary_hexagram: number;
  transformed_hexagram: number | null;
  created_at: string;
}

interface DebugEntry {
  line: number;
  x: number;
  y: number;
  rng: number;
  value: LineValue;
}

interface AppConfig {
  admin_user_id: string | null;
  disable_signup: boolean;
  show_casting_debug: boolean;
}

interface Profile {
  id: string;
  email: string;
  created_at: string;
}

// ─── Hexagram Line Visual ────────────────────────────────────────────────────

function HexagramLine({
  value,
  index,
  animate,
}: {
  value: LineValue;
  index: number;
  animate?: boolean;
}) {
  const isChanging = value === 6 || value === 9;
  const isYang = value === 7 || value === 9;
  const color = isChanging ? "#f97316" : "#1a1a1a";

  return (
    <div
      className={`flex justify-center items-center ${animate ? "line-draw" : ""}`}
      style={{ marginTop: "0.65rem", marginBottom: "0.65rem", animationDelay: animate ? `${index * 0.05}s` : undefined }}
    >
      <div className="relative" style={{ width: "56%" }}>
        {isYang ? (
          <div className="h-5 w-full rounded" style={{ backgroundColor: color }} />
        ) : (
          <div className="flex w-full" style={{ gap: "21px" }}>
            <div className="h-5 flex-1 rounded" style={{ backgroundColor: color }} />
            <div className="h-5 flex-1 rounded" style={{ backgroundColor: color }} />
          </div>
        )}
        {isChanging && (
          <span
            className="absolute top-1/2 -translate-y-1/2 text-sm font-bold leading-none select-none"
            style={{ color: "#f97316", left: "calc(100% + 6px)" }}
          >
            ○
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Hexagram Display Card ───────────────────────────────────────────────────

function HexagramCard({
  hexagram,
  lines,
  title,
  changingLineIndices,
}: {
  hexagram: Hexagram;
  lines: LineValue[];
  title: string;
  changingLineIndices?: number[];
}) {
  const displayLines = [...lines].reverse();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl flex-1 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {title}
      </p>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-4xl font-bold text-gray-800">{hexagram.number}</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-serif leading-tight">
            {hexagram.name}
          </h2>
          <p className="text-sm text-gray-500">{hexagram.chineseName}</p>
        </div>
      </div>

      <div className="my-5 px-1">
        {displayLines.map((val, idx) => (
          <HexagramLine key={5 - idx} value={val} index={idx} animate />
        ))}
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">
        {hexagram.judgment}
      </p>

      {changingLineIndices && changingLineIndices.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-3">
            Changing Lines
          </p>
          <div className="space-y-2">
            {changingLineIndices.map((lineIdx) => (
              <div key={lineIdx} className="flex gap-2">
                <span className="text-orange-500 font-bold text-sm flex-shrink-0 mt-0.5">
                  {lineIdx + 1}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {hexagram.lines[lineIdx]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Save Prompt Modal ───────────────────────────────────────────────────────

function SavePromptModal({
  onSave,
  onCancel,
}: {
  onSave: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-oracle-card border border-oracle-border rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-serif text-oracle-gold mb-1">
          Add Context to This Reading
        </h2>
        <p className="text-oracle-muted text-sm mb-5 leading-relaxed">
          You cast this reading without a question. Add a note to help you
          remember what it was about — or save it without one.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was this reading about? (optional)"
          rows={3}
          autoFocus
          className="w-full bg-oracle-surface border border-oracle-border focus:border-oracle-gold rounded-xl px-4 py-3 text-oracle-text placeholder-oracle-muted/60 focus:outline-none transition-colors resize-none text-sm mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={() => onSave(note.trim())}
            className="flex-1 bg-oracle-gold hover:bg-oracle-gold-light text-oracle-bg font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            {note.trim() ? "Save with Note" : "Save Reading"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-oracle-border hover:border-oracle-gold/40 text-oracle-muted hover:text-oracle-text py-2.5 rounded-lg transition-all text-sm"
          >
            Don't Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────

function AuthModal({
  onClose,
  onAuth,
}: {
  onClose: () => void;
  onAuth: (user: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    for (let i = 0; i < password.length; i++) {
      if (password.charCodeAt(i) > 255) {
        setError(
          "Your password contains an unsupported character. " +
            "Please type it manually rather than pasting, or use only " +
            "standard letters, numbers, and symbols."
        );
        return;
      }
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) onAuth(data.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      if (/email.*not.*confirmed|not.*confirmed/i.test(msg)) {
        setError(
          "Your email address has not been confirmed yet. " +
            "Please check your inbox for the confirmation link and click it before signing in."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-oracle-card border border-oracle-border rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h2 className="text-2xl font-serif text-oracle-gold mb-1">Sign In</h2>
        <p className="text-oracle-muted text-sm mb-6">Access your reading history</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-oracle-muted mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-oracle-surface border border-oracle-border rounded-lg px-4 py-2.5 text-oracle-text focus:outline-none focus:border-oracle-gold text-sm"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs text-oracle-muted mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-oracle-surface border border-oracle-border rounded-lg px-4 py-2.5 text-oracle-text focus:outline-none focus:border-oracle-gold text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-oracle-gold hover:bg-oracle-gold-light disabled:opacity-50 text-oracle-bg font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? "Please wait…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── History Panel ───────────────────────────────────────────────────────────

function HistoryPanel({
  history,
  onSelect,
  onDelete,
}: {
  history: Reading[];
  onSelect: (r: Reading) => void;
  onDelete: (id: string) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-oracle-muted text-sm italic text-center py-8">
        No readings yet. Consult the Oracle for the first time.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {history.map((r) => {
        const primary = getHexagram(r.primary_hexagram);
        const transformed = r.transformed_hexagram ? getHexagram(r.transformed_hexagram) : null;
        return (
          <div key={r.id} className="relative group/row">
            <button
              onClick={() => onSelect(r)}
              className="w-full text-left bg-oracle-surface hover:bg-oracle-card border border-oracle-border hover:border-oracle-gold/40 rounded-xl p-3 pr-9 transition-all group"
            >
              <p className="text-xs text-oracle-muted mb-1">
                {new Date(r.created_at).toLocaleString(undefined, {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-oracle-text line-clamp-2 mb-1 group-hover:text-oracle-gold-light transition-colors">
                {r.question || "Private Reading"}
              </p>
              <p className="text-xs text-oracle-gold">
                {primary.number}. {primary.name}
                {transformed && ` → ${transformed.number}. ${transformed.name}`}
              </p>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md text-oracle-muted hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover/row:opacity-100 transition-all text-sm leading-none"
              title="Delete reading"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────

function AdminPanel({
  profiles,
  appConfig,
  currentUserId,
  onSetAdmin,
  onToggleDisableSignup,
  onToggleCastingDebug,
  onClose,
}: {
  profiles: Profile[];
  appConfig: AppConfig;
  currentUserId: string;
  onSetAdmin: (userId: string) => void;
  onToggleDisableSignup: () => void;
  onToggleCastingDebug: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto"
      style={{ background: "linear-gradient(135deg, #0f0e0c 0%, #1a1510 50%, #0f0e0c 100%)" }}
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-oracle-border/40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☯</span>
          <div>
            <h1 className="text-xl font-serif text-oracle-gold tracking-wide">Admin</h1>
            <p className="text-xs text-oracle-muted">I Ching Oracle</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-oracle-muted hover:text-oracle-text border border-oracle-border hover:border-oracle-gold/40 rounded-lg px-3 py-1.5 transition-all"
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full space-y-6">
        {/* User accounts */}
        <div className="bg-oracle-card border border-oracle-border rounded-2xl p-6">
          <h2 className="text-oracle-gold font-serif text-lg mb-1">User Accounts</h2>
          <p className="text-oracle-muted text-sm mb-5 leading-relaxed">
            Select which account holds admin privileges. There can be only one admin.
          </p>
          {profiles.length === 0 ? (
            <p className="text-oracle-muted text-sm italic">No accounts found.</p>
          ) : (
            <div className="space-y-2">
              {profiles.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 bg-oracle-surface hover:bg-oracle-bg border border-oracle-border hover:border-oracle-gold/40 rounded-xl px-4 py-3 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="admin-user"
                    value={p.id}
                    checked={appConfig.admin_user_id === p.id}
                    onChange={() => onSetAdmin(p.id)}
                    className="w-4 h-4 flex-shrink-0 accent-[#c9a84c]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-oracle-text text-sm truncate">{p.email}</p>
                    <p className="text-oracle-muted text-xs">
                      Joined {new Date(p.created_at).toLocaleDateString()}
                      {p.id === currentUserId && " · You"}
                    </p>
                  </div>
                  {appConfig.admin_user_id === p.id && (
                    <span className="text-xs text-oracle-gold font-semibold uppercase tracking-wider flex-shrink-0">
                      Admin
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-oracle-card border border-oracle-border rounded-2xl p-6">
          <h2 className="text-oracle-gold font-serif text-lg mb-5">Settings</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-oracle-text text-sm font-medium">Disable New Account Creation</p>
                <p className="text-oracle-muted text-xs mt-1 leading-relaxed">
                  Prevent new users from signing up. Existing accounts are unaffected.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={appConfig.disable_signup}
                onClick={onToggleDisableSignup}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                  appConfig.disable_signup ? "bg-oracle-gold" : "bg-oracle-border"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    appConfig.disable_signup ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-6 pt-4 border-t border-oracle-border/40">
              <div>
                <p className="text-oracle-text text-sm font-medium">Show Casting Debug Panel</p>
                <p className="text-oracle-muted text-xs mt-1 leading-relaxed">
                  Display real-time casting data and the Proceed button during oracle readings.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={appConfig.show_casting_debug}
                onClick={onToggleCastingDebug}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                  appConfig.show_casting_debug ? "bg-oracle-gold" : "bg-oracle-border"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    appConfig.show_casting_debug ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Main Oracle Page ─────────────────────────────────────────────────────────

export default function OraclePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<LineValue[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [history, setHistory] = useState<Reading[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedThisReading, setSavedThisReading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [primaryHex, setPrimaryHex] = useState<Hexagram | null>(null);
  const [transformedHex, setTransformedHex] = useState<Hexagram | null>(null);
  const [resultLines, setResultLines] = useState<LineValue[]>([]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [debugEntries, setDebugEntries] = useState<DebugEntry[]>([]);
  const [needsMovement, setNeedsMovement] = useState(true);
  const [pendingResult, setPendingResult] = useState<{
    primary: Hexagram;
    transformed: Hexagram | null;
    lines: LineValue[];
  } | null>(null);

  const entropyRef = useRef<number[]>([]);
  const entropyIndexRef = useRef(0);
  const generatingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const castingDebugActiveRef = useRef(false);

  const questionRef = useRef(question);
  const resultLinesRef = useRef(resultLines);
  const primaryHexRef = useRef(primaryHex);
  const transformedHexRef = useRef(transformedHex);
  const savedRef = useRef(savedThisReading);

  useEffect(() => { questionRef.current = question; }, [question]);
  useEffect(() => { resultLinesRef.current = resultLines; }, [resultLines]);
  useEffect(() => { primaryHexRef.current = primaryHex; }, [primaryHex]);
  useEffect(() => { transformedHexRef.current = transformedHex; }, [transformedHex]);
  useEffect(() => { savedRef.current = savedThisReading; }, [savedThisReading]);

  const supabase = createClient();

  // Admin when logged in AND (no admin set yet OR this user is the admin)
  const isAdmin =
    user !== null &&
    appConfig !== null &&
    (appConfig.admin_user_id === null || appConfig.admin_user_id === user.id);

  useEffect(() => {
    castingDebugActiveRef.current = isAdmin && (appConfig?.show_casting_debug ?? false);
  }, [isAdmin, appConfig]);

  // ── Data loaders ─────────────────────────────────────────────────────────

  async function loadAppConfig(): Promise<AppConfig | null> {
    const { data } = await supabase.from("app_config").select("*").single();
    if (data) {
      const cfg = data as AppConfig;
      setAppConfig(cfg);
      return cfg;
    }
    return null;
  }

  async function loadProfiles() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setProfiles(data as Profile[]);
  }

  async function upsertProfile(u: User) {
    if (!u.email) return;
    await supabase
      .from("profiles")
      .upsert({ id: u.id, email: u.email }, { onConflict: "id", ignoreDuplicates: true });
  }

  // If no admin is set and there's exactly one profile, auto-promote that user.
  async function checkAutoAdmin(userId: string, cfg: AppConfig | null) {
    if (!cfg || cfg.admin_user_id !== null) return;
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    if (count === 1) {
      await supabase.from("app_config").update({ admin_user_id: userId }).eq("id", 1);
      await loadAppConfig();
    }
  }

  // ── Auth bootstrap ──────────────────────────────────────────────────────
  useEffect(() => {
    loadAppConfig();

    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        loadHistory(data.user.id);
        await upsertProfile(data.user);
        const cfg = await loadAppConfig();
        await checkAutoAdmin(data.user.id, cfg);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadHistory(u.id);
        if (event === "SIGNED_IN") {
          // Runs on normal sign-in AND after email confirmation redirect —
          // ensures the profile row exists regardless of signup path.
          await upsertProfile(u);
          const cfg = await loadAppConfig();
          await checkAutoAdmin(u.id, cfg);
        }
      } else {
        setHistory([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadHistory(userId: string) {
    const { data } = await supabase
      .from("readings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as Reading[]);
  }

  // ── Save helpers ─────────────────────────────────────────────────────────

  function performSave(u: User, questionText: string) {
    if (savedRef.current) return;
    setSavedThisReading(true);
    supabase
      .from("readings")
      .insert({
        user_id: u.id,
        question: questionText,
        lines: resultLinesRef.current,
        primary_hexagram: primaryHexRef.current!.number,
        transformed_hexagram: transformedHexRef.current?.number ?? null,
      })
      .then(({ error }) => {
        if (!error) loadHistory(u.id);
      });
  }

  function startSaveFlow(u: User) {
    if (savedRef.current) return;
    if (!questionRef.current.trim()) {
      setShowSavePrompt(true);
    } else {
      performSave(u, questionRef.current);
    }
  }

  // ── Pause-driven casting: move mouse → pause → line cast, repeat 6× ────
  useEffect(() => {
    if (phase !== "oracle") return;

    let lineCount = 0;
    const generatedLines: LineValue[] = [];
    let cancelled = false;
    let awaitingMove = true; // user must move before first pause registers
    let pauseTimer: ReturnType<typeof setTimeout> | null = null;

    setNeedsMovement(true);

    function castLine() {
      if (cancelled || lineCount >= 6) return;

      const pos = { ...lastMousePosRef.current };
      const { value: val, rng } = generateLineValue();
      generatedLines.push(val);
      lineCount++;
      setLines([...generatedLines]);
      setDebugEntries(prev => [...prev, { line: lineCount, x: pos.x, y: pos.y, rng, value: val }]);

      // After casting, user must move again before next line
      awaitingMove = true;
      setNeedsMovement(true);

      if (lineCount >= 6) {
        generatingRef.current = false;
        const primaryNum = getHexagramNumber(generatedLines);
        const transformedNum = getTransformedHexagramNumber(generatedLines);
        const primary = getHexagram(primaryNum);
        const transformed = transformedNum ? getHexagram(transformedNum) : null;
        const castLines = [...generatedLines];

        if (castingDebugActiveRef.current) {
          setPendingResult({ primary, transformed, lines: castLines });
        } else {
          // 0.7 s pause so the last line is visible before result appears
          setTimeout(() => {
            if (cancelled) return;
            setResultLines(castLines);
            setPrimaryHex(primary);
            setTransformedHex(transformed);
            setPhase("result");
          }, 700);
        }
      }
    }

    const handler = (e: MouseEvent) => {
      if (cancelled || lineCount >= 6) return;

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
      entropyRef.current.push((e.clientX ^ e.clientY ^ (Date.now() & 0xffff)) >>> 0);
      if (entropyRef.current.length > 500) entropyRef.current = entropyRef.current.slice(-200);

      // Clear any pending pause timer
      if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }

      // First move after a cast — unlock pause detection
      if (awaitingMove) {
        awaitingMove = false;
        setNeedsMovement(false);
      }

      // Schedule pause detection: if mouse stops for 400 ms, cast the line
      pauseTimer = setTimeout(() => {
        if (cancelled || awaitingMove || lineCount >= 6) return;
        castLine();
      }, 400);
    };

    window.addEventListener("mousemove", handler);
    return () => {
      cancelled = true;
      if (pauseTimer) clearTimeout(pauseTimer);
      window.removeEventListener("mousemove", handler);
      generatingRef.current = false;
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function generateLineValue(): { value: LineValue; rng: number } {
    const buf = entropyRef.current;
    let a: number, b: number, c: number;
    if (buf.length >= 3) {
      const i = entropyIndexRef.current;
      a = buf[i % buf.length];
      b = buf[(i + 1) % buf.length];
      c = buf[(i + 2) % buf.length];
      entropyIndexRef.current = (i + 3) % buf.length;
    } else {
      a = (Math.random() * 0xffff) | 0;
      b = (Math.random() * 0xffff) | 0;
      c = (Math.random() * 0xffff) | 0;
    }
    const coin1 = (a >> (entropyIndexRef.current % 8)) & 1;
    const coin2 = (b >> ((entropyIndexRef.current + 1) % 8)) & 1;
    const coin3 = (c >> ((entropyIndexRef.current + 2) % 8)) & 1;
    const sum = (coin1 ? 3 : 2) + (coin2 ? 3 : 2) + (coin3 ? 3 : 2);
    return { value: sum as LineValue, rng: a };
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    setLines([]);
    setPrimaryHex(null);
    setTransformedHex(null);
    setResultLines([]);
    setSavedThisReading(false);
    setShowSavePrompt(false);
    setDebugEntries([]);
    setMousePos({ x: 0, y: 0 });
    setNeedsMovement(true);
    setPendingResult(null);
    entropyRef.current = [];
    entropyIndexRef.current = 0;
    generatingRef.current = false;
    setPhase("oracle");
  }

  function handleAskAgain() {
    setQuestion("");
    setLines([]);
    setPrimaryHex(null);
    setTransformedHex(null);
    setResultLines([]);
    setSavedThisReading(false);
    setShowSavePrompt(false);
    setShowHistory(false);
    setDebugEntries([]);
    setMousePos({ x: 0, y: 0 });
    setNeedsMovement(true);
    setPendingResult(null);
    entropyRef.current = [];
    entropyIndexRef.current = 0;
    generatingRef.current = false;
    setPhase("intro");
  }

  function handleProceed() {
    if (!pendingResult) return;
    setResultLines(pendingResult.lines);
    setPrimaryHex(pendingResult.primary);
    setTransformedHex(pendingResult.transformed);
    setPendingResult(null);
    setPhase("result");
  }

  function handlePostAuth(_u: User) {
    // onAuthStateChange SIGNED_IN handles profile upsert, config load, and admin check
    setShowAuth(false);
  }

  function handleSavePromptSubmit(note: string) {
    setShowSavePrompt(false);
    if (user) performSave(user, note || "");
  }

  async function handleDeleteReading(id: string) {
    if (!user) return;
    await supabase.from("readings").delete().eq("id", id).eq("user_id", user.id);
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSelectHistory(r: Reading) {
    const lv = r.lines as LineValue[];
    setResultLines(lv);
    setLines(lv);
    setQuestion(r.question);
    setPrimaryHex(getHexagram(r.primary_hexagram));
    setTransformedHex(r.transformed_hexagram ? getHexagram(r.transformed_hexagram) : null);
    setSavedThisReading(true);
    setPhase("result");
    setShowHistory(false);
  }

  async function handleSetAdmin(userId: string) {
    await supabase.from("app_config").update({ admin_user_id: userId }).eq("id", 1);
    await loadAppConfig();
  }

  async function handleToggleDisableSignup() {
    if (!appConfig) return;
    await supabase
      .from("app_config")
      .update({ disable_signup: !appConfig.disable_signup })
      .eq("id", 1);
    await loadAppConfig();
  }

  async function handleToggleCastingDebug() {
    if (!appConfig) return;
    await supabase
      .from("app_config")
      .update({ show_casting_debug: !appConfig.show_casting_debug })
      .eq("id", 1);
    await loadAppConfig();
  }

  async function openAdminPanel() {
    await loadProfiles();
    setShowAdminPanel(true);
  }

  const changingLineIndices = resultLines
    .map((v, i) => (v === 6 || v === 9 ? i : -1))
    .filter((i) => i !== -1);

  const questionDisplay = question.trim() ? `"${question}"` : "The Question is Private";

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #0f0e0c 0%, #1a1510 50%, #0f0e0c 100%)" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-oracle-border/40">
        <button
          onClick={handleAskAgain}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">☯</span>
          <div className="text-left">
            <h1
              className="text-xl font-serif text-oracle-gold tracking-wide"
              style={{ textShadow: "0 0 20px rgba(201,168,76,0.4)" }}
            >
              I Ching Oracle
            </h1>
            <p className="text-xs text-oracle-muted">The Book of Changes</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-oracle-gold hover:text-oracle-gold-light border border-oracle-border hover:border-oracle-gold/40 rounded-lg px-3 py-1.5 transition-all"
                >
                  {showHistory ? "Close History" : "My History"}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={openAdminPanel}
                  className="text-sm text-oracle-muted hover:text-oracle-gold border border-oracle-border hover:border-oracle-gold/40 rounded-lg px-3 py-1.5 transition-all"
                >
                  Admin
                </button>
              )}
              <span className="text-oracle-muted text-sm hidden sm:block truncate max-w-32">
                {user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-oracle-muted hover:text-oracle-text transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm text-oracle-gold hover:text-oracle-gold-light border border-oracle-gold/40 hover:border-oracle-gold rounded-lg px-4 py-1.5 transition-all"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* History slide-down — admin only */}
      {showHistory && user && isAdmin && (
        <div className="border-b border-oracle-border/40 bg-oracle-surface/80 px-6 py-4 fade-in">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-oracle-gold font-serif mb-3 text-sm uppercase tracking-widest">
              Your Reading History
            </h3>
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteReading}
            />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-4xl">

          {/* ── Intro ─────────────────────────────────────────────────── */}
          {phase === "intro" && (
            <div className="fade-in space-y-10">
              <div className="text-center space-y-3">
                <h2
                  className="text-4xl font-serif text-oracle-gold"
                  style={{ textShadow: "0 0 30px rgba(201,168,76,0.3)" }}
                >
                  Consult the Oracle
                </h2>
                <p className="text-oracle-muted max-w-lg mx-auto leading-relaxed">
                  The I Ching — the ancient Book of Changes — offers guidance
                  through the casting of hexagrams. Still your mind and let the
                  Oracle speak.
                </p>
              </div>

              <div className="bg-oracle-card border border-oracle-border rounded-2xl p-6 max-w-lg mx-auto space-y-4">
                <h3 className="text-oracle-gold font-serif text-lg">How to Consult</h3>
                <ol className="space-y-2 text-oracle-text text-sm list-decimal list-inside leading-relaxed">
                  <li>
                    In your mind, form a question to ask the Oracle. Type it
                    below — or leave it blank to cast a private reading.
                  </li>
                  <li>
                    Press <em>Ask the Oracle</em>. Move your mouse freely,
                    then pause — each pause casts one line. Repeat for all six.
                  </li>
                  <li>
                    Six lines will be revealed one by one, building the hexagram
                    from the ground up.
                  </li>
                  <li>
                    <span className="text-orange-400 font-semibold">Orange lines</span>{" "}
                    are changing lines — they transform the hexagram into a second
                    one, showing your situation in motion.
                  </li>
                </ol>
              </div>

              <form onSubmit={handleAskQuestion} className="max-w-lg mx-auto space-y-4">
                <div>
                  <label className="block text-xs text-oracle-muted mb-2 uppercase tracking-widest">
                    Your Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Leave blank for a private reading, or write your question here…"
                    rows={3}
                    className="w-full bg-oracle-surface border border-oracle-border focus:border-oracle-gold rounded-xl px-4 py-3 text-oracle-text placeholder-oracle-muted/60 focus:outline-none transition-colors resize-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-oracle-gold hover:bg-oracle-gold-light text-oracle-bg font-bold py-3 rounded-xl transition-all text-sm tracking-wide"
                >
                  Ask the Oracle
                </button>
                {!user && (
                  <p className="text-center text-oracle-muted text-xs">
                    <button
                      type="button"
                      onClick={() => setShowAuth(true)}
                      className="text-oracle-gold hover:underline"
                    >
                      Sign in
                    </button>{" "}
                    to save your readings to your personal history
                  </p>
                )}
              </form>
            </div>
          )}

          {/* ── Oracle ────────────────────────────────────────────────── */}
          {phase === "oracle" && (
            <div className="fade-in flex flex-col items-center gap-8">
              <div className="text-center space-y-2">
                <h2
                  className="text-3xl font-serif text-oracle-gold"
                  style={{ textShadow: "0 0 20px rgba(201,168,76,0.3)" }}
                >
                  The Oracle is Speaking…
                </h2>
                <p className="text-oracle-muted text-sm italic max-w-sm">
                  {questionDisplay}
                </p>
              </div>

              {/* Casting Status panel — fixed size, height locked to "Move your mouse" state */}
              <div className="border border-oracle-gold/30 rounded-2xl px-10 py-4 text-center w-80 h-24 flex flex-col items-center justify-center bg-oracle-surface/40">
                {lines.length >= 6 ? (
                  <p className="text-oracle-gold text-sm font-semibold">
                    ✦ Hexagram complete. ✦
                  </p>
                ) : needsMovement ? (
                  <>
                    <p className="text-oracle-gold text-sm font-semibold mb-1 animate-pulse">
                      ✦ Move your mouse ✦
                    </p>
                    <p className="text-oracle-muted text-xs leading-relaxed">
                      Move your mouse freely to gather energy for line {lines.length + 1}.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-oracle-gold text-sm font-semibold mb-1">
                      ✦ Pause to cast ✦
                    </p>
                    <p className="text-oracle-muted text-xs leading-relaxed">
                      Hold your mouse still to cast line {lines.length + 1}.
                    </p>
                  </>
                )}
              </div>

              <div className={`flex gap-5 items-start ${isAdmin && appConfig?.show_casting_debug ? "" : "justify-center"}`}>
                {/* Hexagram card */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl w-80">
                  <div className="space-y-1">
                    {Array.from({ length: 6 }).map((_, displayIdx) => {
                      const lineIdx = 5 - displayIdx;
                      const lineVal = lines[lineIdx];
                      if (lineVal === undefined) {
                        return (
                          <div key={displayIdx} className="flex justify-center items-center my-2 h-5">
                            <div
                              className="border-b-2 border-dashed border-gray-200"
                              style={{ width: "56%" }}
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={displayIdx} className="slide-up">
                          <HexagramLine value={lineVal} index={displayIdx} animate />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-gray-400 text-xs mt-4">
                    {lines.length} / 6
                  </p>
                </div>

                {/* Casting Debug panel — admin only, when enabled in Admin settings */}
                {isAdmin && appConfig?.show_casting_debug && <div className="bg-oracle-card border border-oracle-border rounded-2xl p-4 w-52 font-mono text-xs flex flex-col gap-3">
                  <p className="text-oracle-gold uppercase tracking-widest text-xs font-semibold">
                    Casting Debug
                  </p>
                  <div className="pb-3 border-b border-oracle-border/60">
                    <span className="text-oracle-muted">mouse </span>
                    <span className="text-oracle-text">
                      {mousePos.x}, {mousePos.y}
                    </span>
                  </div>
                  {/* Entries reversed so L6 is at top, L1 at bottom — matches hexagram visual */}
                  <div className="space-y-2 flex-1">
                    {[...debugEntries].reverse().map((e) => {
                      const isChanging = e.value === 6 || e.value === 9;
                      return (
                        <div key={e.line}>
                          <div className="text-oracle-muted">
                            <span className="text-oracle-gold">L{e.line}</span>
                            {" "}({e.x}, {e.y})
                          </div>
                          <div className="text-oracle-muted pl-3">
                            rng <span className="text-oracle-text">{e.rng}</span>
                            {" → "}
                            <span className={isChanging ? "text-orange-400" : "text-oracle-text"}>
                              {e.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleProceed}
                    disabled={pendingResult === null}
                    className="w-full bg-oracle-gold hover:bg-oracle-gold-light disabled:opacity-30 disabled:cursor-not-allowed text-oracle-bg font-bold py-2 rounded-lg transition-all text-xs tracking-wide"
                  >
                    Proceed
                  </button>
                </div>}
              </div>
            </div>
          )}

          {/* ── Result ────────────────────────────────────────────────── */}
          {phase === "result" && primaryHex && (
            <div className="fade-in space-y-8">
              <div className="text-center space-y-2">
                <h2
                  className="text-3xl font-serif text-oracle-gold"
                  style={{ textShadow: "0 0 20px rgba(201,168,76,0.3)" }}
                >
                  The Oracle Has Spoken
                </h2>
                <p className="text-oracle-muted text-sm italic max-w-md mx-auto">
                  {questionDisplay}
                </p>
              </div>

              <div
                className={`flex gap-6 ${
                  transformedHex ? "flex-col md:flex-row" : "justify-center max-w-sm mx-auto"
                }`}
              >
                <HexagramCard
                  hexagram={primaryHex}
                  lines={resultLines}
                  title={transformedHex ? "Present Hexagram" : "Your Hexagram"}
                  changingLineIndices={transformedHex ? changingLineIndices : undefined}
                />

                {transformedHex && (
                  <>
                    <div className="flex md:flex-col items-center justify-center gap-2 text-oracle-gold/50 flex-shrink-0">
                      <div className="hidden md:block h-12 w-px bg-oracle-gold/20" />
                      <span className="text-2xl md:rotate-0 rotate-90">→</span>
                      <div className="hidden md:block h-12 w-px bg-oracle-gold/20" />
                    </div>
                    <HexagramCard
                      hexagram={transformedHex}
                      lines={resultLines.map((l) => (l === 6 ? 7 : l === 9 ? 8 : l)) as LineValue[]}
                      title="Transformed Hexagram"
                    />
                  </>
                )}
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleAskAgain}
                  className="bg-oracle-gold hover:bg-oracle-gold-light text-oracle-bg font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                >
                  Ask Again
                </button>
                {isAdmin && !savedThisReading && (
                  <button
                    onClick={() => startSaveFlow(user!)}
                    className="border border-oracle-gold/40 hover:border-oracle-gold text-oracle-gold hover:text-oracle-gold-light px-6 py-2.5 rounded-xl transition-all text-sm"
                  >
                    Save Reading
                  </button>
                )}
                {isAdmin && savedThisReading && (
                  <span className="text-oracle-muted text-sm self-center">
                    ✓ Saved to your history
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-oracle-muted/40 text-xs border-t border-oracle-border/20">
        I Ching Oracle · The Book of Changes · Est. ~1000 BCE
      </footer>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={handlePostAuth}
        />
      )}

      {showSavePrompt && (
        <SavePromptModal
          onSave={handleSavePromptSubmit}
          onCancel={() => setShowSavePrompt(false)}
        />
      )}

      {showAdminPanel && user && appConfig && (
        <AdminPanel
          profiles={profiles}
          appConfig={appConfig}
          currentUserId={user.id}
          onSetAdmin={handleSetAdmin}
          onToggleDisableSignup={handleToggleDisableSignup}
          onToggleCastingDebug={handleToggleCastingDebug}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
}
