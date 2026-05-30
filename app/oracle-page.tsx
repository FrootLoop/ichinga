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
      className={`relative flex justify-center items-center my-2 ${animate ? "line-draw" : ""}`}
      style={{ animationDelay: animate ? `${index * 0.05}s` : undefined }}
    >
      <div style={{ width: "75%" }}>
        {isYang ? (
          <div className="h-5 w-full rounded" style={{ backgroundColor: color }} />
        ) : (
          <div className="flex w-full gap-4">
            <div className="h-5 flex-1 rounded" style={{ backgroundColor: color }} />
            <div className="h-5 flex-1 rounded" style={{ backgroundColor: color }} />
          </div>
        )}
      </div>
      {isChanging && (
        <span
          className="absolute right-0 text-sm font-bold leading-none"
          style={{ color: "#f97316" }}
        >
          ○
        </span>
      )}
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
  onSavePrivate,
}: {
  onSave: (note: string) => void;
  onSavePrivate: () => void;
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
          remember what it was about — or save it as a private reading.
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
            onClick={onSavePrivate}
            className="flex-1 border border-oracle-border hover:border-oracle-gold/40 text-oracle-muted hover:text-oracle-text py-2.5 rounded-lg transition-all text-sm"
          >
            Save as Private
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
  pendingSave,
}: {
  onClose: () => void;
  onAuth: (user: User) => void;
  pendingSave: boolean;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) onAuth(data.user);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
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
        <h2 className="text-2xl font-serif text-oracle-gold mb-1">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h2>
        <p className="text-oracle-muted text-sm mb-6">
          {pendingSave
            ? "Sign in to save this reading to your history"
            : mode === "login"
            ? "Access your reading history"
            : "Save your readings for future reflection"}
        </p>

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
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-oracle-muted text-sm mt-4">
          {mode === "login" ? "No account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-oracle-gold hover:text-oracle-gold-light underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── History Panel ───────────────────────────────────────────────────────────

function HistoryPanel({
  history,
  onSelect,
}: {
  history: Reading[];
  onSelect: (r: Reading) => void;
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
        const transformed = r.transformed_hexagram
          ? getHexagram(r.transformed_hexagram)
          : null;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full text-left bg-oracle-surface hover:bg-oracle-card border border-oracle-border hover:border-oracle-gold/40 rounded-xl p-3 transition-all group"
          >
            <p className="text-xs text-oracle-muted mb-1">
              {new Date(r.created_at).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
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
        );
      })}
    </div>
  );
}

// ─── Main Oracle Page ─────────────────────────────────────────────────────────

export default function OraclePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<LineValue[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [history, setHistory] = useState<Reading[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedThisReading, setSavedThisReading] = useState(false);

  const [primaryHex, setPrimaryHex] = useState<Hexagram | null>(null);
  const [transformedHex, setTransformedHex] = useState<Hexagram | null>(null);
  const [resultLines, setResultLines] = useState<LineValue[]>([]);

  const entropyRef = useRef<number[]>([]);
  const entropyIndexRef = useRef(0);
  const generatingRef = useRef(false);

  // Keep stable refs so save callbacks always have current values
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

  // ── Auth bootstrap ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        loadHistory(data.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) loadHistory(u.id);
        else setHistory([]);
      }
    );

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

  // ── Auto-save when result arrives for already-logged-in users ───────────
  // Only depends on `phase` — sign-in flow handles its own save path
  useEffect(() => {
    if (phase !== "result") return;
    if (!user || !primaryHex || savedThisReading) return;
    startSaveFlow(user);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mouse entropy ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "oracle") return;

    const handler = (e: MouseEvent) => {
      entropyRef.current.push(
        (e.clientX ^ e.clientY ^ (Date.now() & 0xffff)) >>> 0
      );
      if (entropyRef.current.length > 500) {
        entropyRef.current = entropyRef.current.slice(-200);
      }
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [phase]);

  // ── Line generation sequence ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "oracle") return;
    if (generatingRef.current) return;

    generatingRef.current = true;
    let lineCount = 0;
    const generatedLines: LineValue[] = [];
    let cancelled = false;

    function scheduleNext() {
      if (cancelled) return;

      if (lineCount >= 6) {
        const primaryNum = getHexagramNumber(generatedLines);
        const transformedNum = getTransformedHexagramNumber(generatedLines);
        setResultLines([...generatedLines]);
        setPrimaryHex(getHexagram(primaryNum));
        setTransformedHex(transformedNum ? getHexagram(transformedNum) : null);
        setPhase("result");
        generatingRef.current = false;
        return;
      }

      const delay = lineCount === 0 ? 2200 : 1000 + Math.random() * 800;

      setTimeout(() => {
        if (cancelled) return;
        const val = generateLineValue();
        generatedLines.push(val);
        lineCount++;
        setLines([...generatedLines]);
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      cancelled = true;
      generatingRef.current = false;
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function generateLineValue(): LineValue {
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
    return sum as LineValue;
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    setLines([]);
    setPrimaryHex(null);
    setTransformedHex(null);
    setResultLines([]);
    setSavedThisReading(false);
    setPendingSave(false);
    setShowSavePrompt(false);
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
    setPendingSave(false);
    setShowSavePrompt(false);
    entropyRef.current = [];
    entropyIndexRef.current = 0;
    generatingRef.current = false;
    setPhase("intro");
  }

  function handleSignInToSave() {
    setPendingSave(true);
    setShowAuth(true);
  }

  function handlePostAuth(u: User) {
    setUser(u);
    setShowAuth(false);
    loadHistory(u.id);

    // If triggered from "Sign in to Save", resume the save flow now
    if (pendingSave && phase === "result" && primaryHexRef.current && !savedRef.current) {
      setPendingSave(false);
      startSaveFlow(u);
    } else {
      setPendingSave(false);
    }
  }

  function handleSavePromptSubmit(note: string) {
    setShowSavePrompt(false);
    if (user) performSave(user, note || "");
  }

  function handleSavePrivate() {
    setShowSavePrompt(false);
    if (user) performSave(user, "");
  }

  function handleSelectHistory(r: Reading) {
    const lv = r.lines as LineValue[];
    setResultLines(lv);
    setLines(lv);
    setQuestion(r.question);
    setPrimaryHex(getHexagram(r.primary_hexagram));
    setTransformedHex(
      r.transformed_hexagram ? getHexagram(r.transformed_hexagram) : null
    );
    setSavedThisReading(true);
    setPhase("result");
    setShowHistory(false);
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
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-oracle-gold hover:text-oracle-gold-light border border-oracle-border hover:border-oracle-gold/40 rounded-lg px-3 py-1.5 transition-all"
              >
                {showHistory ? "Close History" : "My History"}
              </button>
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

      {/* History slide-down */}
      {showHistory && user && (
        <div className="border-b border-oracle-border/40 bg-oracle-surface/80 px-6 py-4 fade-in">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-oracle-gold font-serif mb-3 text-sm uppercase tracking-widest">
              Your Reading History
            </h3>
            <HistoryPanel history={history} onSelect={handleSelectHistory} />
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
                    Optionally, form a question in your mind and type it below —
                    or leave it blank to cast a private reading.
                  </li>
                  <li>
                    Press <em>Ask the Oracle</em> and move your mouse in free,
                    wandering circles to cast the lines.
                  </li>
                  <li>
                    Six lines will be revealed one by one, building the hexagram
                    from the ground up.
                  </li>
                  <li>
                    <span className="text-orange-400 font-semibold">Orange lines</span>{" "}
                    are changing lines — they transform the hexagram into a
                    second one, showing your situation in motion.
                  </li>
                </ol>
              </div>

              <form
                onSubmit={handleAskQuestion}
                className="max-w-lg mx-auto space-y-4"
              >
                <div>
                  <label className="block text-xs text-oracle-muted mb-2 uppercase tracking-widest">
                    Your Question — Optional
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Leave blank for a private casting, or write your question here…"
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

              {lines.length < 6 && (
                <div className="border border-oracle-gold/30 rounded-2xl px-6 py-4 text-center max-w-sm bg-oracle-surface/40">
                  <p className="text-oracle-gold text-sm font-semibold mb-1 animate-pulse">
                    ✦ Move your mouse freely ✦
                  </p>
                  <p className="text-oracle-muted text-xs leading-relaxed">
                    Let your hand wander without purpose. Your movement casts
                    the hexagram lines through the wisdom of chance.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-oracle-muted text-sm">
                {lines.length < 6 ? (
                  <>
                    <span className="animate-pulse">●</span>
                    <span>Line {lines.length + 1} of 6 forming…</span>
                  </>
                ) : (
                  <span className="text-oracle-gold">Hexagram complete</span>
                )}
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-2xl w-80">
                <div className="space-y-1">
                  {Array.from({ length: 6 }).map((_, displayIdx) => {
                    const lineIdx = 5 - displayIdx;
                    const lineVal = lines[lineIdx];

                    if (lineVal === undefined) {
                      return (
                        <div key={displayIdx} className="relative flex justify-center items-center my-2 h-5">
                          <div
                            className="border-b-2 border-dashed border-gray-200"
                            style={{ width: "75%" }}
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
                  transformedHex
                    ? "flex-col md:flex-row"
                    : "justify-center max-w-sm mx-auto"
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
                      lines={
                        resultLines.map((l) =>
                          l === 6 ? 7 : l === 9 ? 8 : l
                        ) as LineValue[]
                      }
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
                {!user && (
                  <button
                    onClick={handleSignInToSave}
                    className="border border-oracle-gold/40 hover:border-oracle-gold text-oracle-gold hover:text-oracle-gold-light px-6 py-2.5 rounded-xl transition-all text-sm"
                  >
                    Sign in to Save
                  </button>
                )}
                {user && savedThisReading && (
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
          onClose={() => { setShowAuth(false); setPendingSave(false); }}
          onAuth={handlePostAuth}
          pendingSave={pendingSave}
        />
      )}

      {showSavePrompt && (
        <SavePromptModal
          onSave={handleSavePromptSubmit}
          onSavePrivate={handleSavePrivate}
        />
      )}
    </div>
  );
}
