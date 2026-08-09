import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import {
  analyzeDocument,
  getDemo,
  extractErrorMessage,
  AnalyzePayload,
} from "@/lib/api";

const MESSAGES = [
  "Fetching document…",
  "Segmenting clauses…",
  "Classifying with AI…",
  "Building your report…",
];

type LocationState =
  | { mode: "analyze"; payload: AnalyzePayload }
  | { mode: "demo"; slug: string }
  | undefined;

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  // Kick off the request once.
  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
      return;
    }
    if (started.current) return;
    started.current = true;

    let cancelled = false;
    (async () => {
      try {
        let documentId: string;
        if (state.mode === "demo") {
          documentId = (await getDemo(state.slug)).document_id;
        } else {
          documentId = (await analyzeDocument(state.payload)).document_id;
        }
        if (!cancelled) navigate(`/results/${documentId}`, { replace: true });
      } catch (err) {
        if (!cancelled)
          setError(extractErrorMessage(err, "Something went wrong analyzing this document."));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle status messages every 2s.
  useEffect(() => {
    if (error) return;
    const id = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 2000);
    return () => clearInterval(id);
  }, [error]);

  const progress = error
    ? 100
    : Math.min(((messageIndex + 1) / MESSAGES.length) * 92, 92);

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="glass-card w-full p-8" data-testid="loading-error">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#EF4444]">
            <AlertTriangle size={20} />
          </div>
          <h2 className="font-heading text-xl font-semibold">Analysis failed</h2>
          <p className="mt-2 text-sm text-[#71717A]">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            data-testid="loading-error-back"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F46E5]"
          >
            <ArrowLeft size={16} /> Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" data-testid="loading-page">
      {/* Progress + status */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="font-medium"
            data-testid="loading-status"
          >
            {MESSAGES[messageIndex]}
          </motion.p>
          <span className="font-mono text-sm text-[#71717A]" data-testid="loading-percent">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#0A0A0F]">
          <motion.div
            className="h-full rounded-full bg-[#6366F1]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            data-testid="loading-progress-bar"
          />
        </div>
      </div>

      {/* Full page skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <SkeletonBlock className="h-8 w-1/2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card space-y-3 p-5">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-11/12" />
              <SkeletonBlock className="h-3 w-4/5" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="glass-card space-y-4 p-6">
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-4 w-1/2" />
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
