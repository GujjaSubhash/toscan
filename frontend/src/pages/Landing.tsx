import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Link2,
  FileText,
  ListChecks,
  Gauge,
  Sparkles,
  ArrowRight,
  Github,
} from "lucide-react";

type Mode = "url" | "text";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Clause-by-Clause Breakdown",
    body: "Every paragraph parsed, categorized and inspected individually — no fine print left behind.",
  },
  {
    icon: Gauge,
    title: "Risk Scoring 1–5",
    body: "Each clause gets a clear risk score so you instantly see what deserves your attention.",
  },
  {
    icon: Sparkles,
    title: "Plain English Summaries",
    body: "Dense legalese rewritten into 2–3 sentences a human can actually understand.",
  },
];

const DEMOS = [
  { slug: "spotify", label: "Try with Spotify ToS" },
  { slug: "twitter", label: "Try with Twitter ToS" },
  { slug: "whatsapp", label: "Try with WhatsApp ToS" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canAnalyze =
    mode === "url" ? url.trim().length > 0 : rawText.trim().length > 0;

  const handleAnalyze = () => {
    setError(null);
    if (!canAnalyze) {
      setError(
        mode === "url"
          ? "Please paste a Terms of Service URL."
          : "Please paste some Terms of Service text."
      );
      return;
    }
    const payload =
      mode === "url" ? { url: url.trim() } : { raw_text: rawText.trim() };
    navigate("/loading", { state: { mode: "analyze", payload } });
  };

  const handleDemo = (slug: string) => {
    navigate("/loading", { state: { mode: "demo", slug } });
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
      {/* Hero */}
      <section className="flex flex-col items-start pt-20 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111118] px-3 py-1 text-xs text-[#71717A]"
          data-testid="hero-badge"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1]" />
          Terms of Service, decoded
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          className="mt-6 max-w-3xl font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
          data-testid="hero-headline"
        >
          Stop Signing Away Your Rights.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
          className="mt-5 max-w-xl text-base text-[#71717A] sm:text-lg"
          data-testid="hero-subtext"
        >
          Paste any Terms of Service URL and get a plain-English risk report in
          seconds.
        </motion.p>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
          className="glass-card mt-10 w-full max-w-2xl p-4 sm:p-5"
          data-testid="analyze-card"
        >
          <div className="mb-4 inline-flex rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0A0A0F] p-1">
            <button
              type="button"
              onClick={() => setMode("url")}
              data-testid="toggle-url"
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
                mode === "url"
                  ? "bg-[#6366F1] text-white"
                  : "text-[#71717A] hover:text-[#F4F4F5]"
              }`}
            >
              <Link2 size={15} /> URL
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              data-testid="toggle-text"
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
                mode === "text"
                  ? "bg-[#6366F1] text-white"
                  : "text-[#71717A] hover:text-[#F4F4F5]"
              }`}
            >
              <FileText size={15} /> Raw Text
            </button>
          </div>

          {mode === "url" ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/terms"
              data-testid="url-input"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F4F4F5] outline-none placeholder:text-[#52525B] focus:border-[#6366F1]"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          ) : (
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full Terms of Service text here…"
              data-testid="text-input"
              rows={6}
              className="w-full resize-y rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0A0A0F] px-4 py-3 font-mono text-sm text-[#F4F4F5] outline-none placeholder:text-[#52525B] focus:border-[#6366F1]"
            />
          )}

          {error && (
            <p className="mt-3 text-sm text-[#EF4444]" data-testid="analyze-error">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            data-testid="analyze-button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4F46E5] sm:w-auto"
          >
            Analyze Now <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="features">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            className="glass-card p-6 hover:border-[rgba(99,102,241,0.4)]"
            data-testid={`feature-card-${i}`}
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0A0A0F] text-[#6366F1]">
              <f.icon size={18} />
            </div>
            <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#71717A]">{f.body}</p>
          </motion.div>
        ))}
      </section>

      {/* Demo section */}
      <section className="mt-20" data-testid="demo-section">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          See it in action
        </h2>
        <p className="mt-2 text-sm text-[#71717A]">
          Explore a pre-analyzed report — no waiting required.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DEMOS.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => handleDemo(d.slug)}
              data-testid={`demo-card-${d.slug}`}
              className="glass-card group flex items-center justify-between p-5 text-left hover:border-[rgba(99,102,241,0.4)]"
            >
              <span className="font-medium">{d.label}</span>
              <ArrowRight
                size={16}
                className="text-[#71717A] group-hover:translate-x-1 group-hover:text-[#6366F1]"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-[rgba(255,255,255,0.07)] py-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-bold">ClarityToS</span>
          <span className="text-sm text-[#71717A]">· Built for transparency</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="footer-github-link"
          className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#F4F4F5]"
        >
          <Github size={16} /> GitHub
        </a>
      </footer>
    </div>
  );
}
