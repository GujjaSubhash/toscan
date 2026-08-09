import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Download,
  Check,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import {
  getDocument,
  extractErrorMessage,
  DocumentDetail,
  Clause,
} from "@/lib/api";
import {
  riskColor,
  riskLabel,
  riskTint,
  categoryColor,
  documentTitle,
} from "@/lib/risk";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RiskBadge({ score }: { score: number | null }) {
  const color = riskColor(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: riskTint(score, 0.15), color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {riskLabel(score)} · {score ?? "?"}/5
    </span>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  const color = categoryColor(category);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {category ?? "Other"}
    </span>
  );
}

export default function Results() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;
    setLoading(true);
    getDocument(documentId)
      .then((d) => {
        if (!cancelled) setDoc(d);
      })
      .catch((err) => {
        if (!cancelled)
          setError(extractErrorMessage(err, "Could not load this report."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const categories = useMemo(() => {
    if (!doc) return [] as string[];
    const set = new Set<string>();
    doc.clauses.forEach((c) => c.category && set.add(c.category));
    return Array.from(set).sort();
  }, [doc]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    doc?.clauses.forEach((c) => {
      const key = c.category ?? "Other";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [doc]);

  const filteredClauses = useMemo(() => {
    if (!doc) return [] as Clause[];
    if (!activeCategory) return doc.clauses;
    return doc.clauses.filter((c) => c.category === activeCategory);
  }, [doc, activeCategory]);

  const selectedClause = useMemo(
    () => doc?.clauses.find((c) => c.id === selectedId) ?? null,
    [doc, selectedId]
  );

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8" data-testid="results-loading">
        <div className="shimmer h-10 w-1/3 rounded-lg" />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card space-y-3 p-5">
                <div className="shimmer h-4 w-24 rounded" />
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="glass-card h-72 p-6">
              <div className="shimmer h-full w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="glass-card w-full p-8" data-testid="results-error">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#EF4444]">
            <AlertTriangle size={20} />
          </div>
          <h2 className="font-heading text-xl font-semibold">Report unavailable</h2>
          <p className="mt-2 text-sm text-[#71717A]">
            {error ?? "This document could not be found."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            data-testid="results-error-back"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4F46E5]"
          >
            <ArrowLeft size={16} /> Back to home
          </button>
        </div>
      </div>
    );
  }

  const overall = doc.overall_risk_score ?? 0;
  const overallRounded = Math.round(overall);
  const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8" data-testid="results-page">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-[rgba(255,255,255,0.07)] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            data-testid="results-back"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#111118] text-[#71717A] hover:text-[#F4F4F5]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight" data-testid="results-title">
              {documentTitle(doc.source_url)}
            </h1>
            <p className="text-xs text-[#71717A]" data-testid="results-date">
              Analyzed {formatDate(doc.created_at)} · {doc.clause_count ?? doc.clauses.length} clauses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            data-testid="share-button"
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#111118] px-3.5 py-2 text-sm font-medium hover:border-[rgba(99,102,241,0.4)]"
          >
            {copied ? <Check size={15} className="text-[#22C55E]" /> : <Share2 size={15} />}
            {copied ? "Copied!" : "Share"}
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            data-testid="download-pdf-button"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#111118] px-3.5 py-2 text-sm font-medium text-[#52525B]"
          >
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mb-6 flex flex-wrap gap-2" data-testid="category-filters">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          data-testid="filter-all"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            activeCategory === null
              ? "border-[#6366F1] bg-[rgba(99,102,241,0.15)] text-[#F4F4F5]"
              : "border-[rgba(255,255,255,0.07)] bg-[#111118] text-[#71717A] hover:text-[#F4F4F5]"
          }`}
        >
          All ({doc.clauses.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            data-testid={`filter-${cat.replace(/\s+/g, "-").toLowerCase()}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              activeCategory === cat
                ? "border-[#6366F1] bg-[rgba(99,102,241,0.15)] text-[#F4F4F5]"
                : "border-[rgba(255,255,255,0.07)] bg-[#111118] text-[#71717A] hover:text-[#F4F4F5]"
            }`}
          >
            {cat} ({categoryCounts[cat] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left panel — clauses (60%) */}
        <div className="space-y-3 lg:col-span-3" data-testid="clause-list">
          {filteredClauses.map((clause) => {
            const isSelected = clause.id === selectedId;
            const color = riskColor(clause.risk_score);
            return (
              <motion.button
                key={clause.id}
                layoutId={`clause-${clause.id}`}
                type="button"
                onClick={() => setSelectedId(clause.id)}
                data-testid={`clause-item-${clause.clause_index}`}
                className="block w-full rounded-xl border p-4 text-left"
                style={{
                  backgroundColor: riskTint(clause.risk_score, 0.15),
                  borderColor: isSelected ? color : "rgba(255,255,255,0.07)",
                }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <CategoryBadge category={clause.category} />
                  <motion.div layoutId={`badge-${clause.id}`}>
                    <RiskBadge score={clause.risk_score} />
                  </motion.div>
                </div>
                <p className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-[#F4F4F5]">
                  {clause.clause_text}
                </p>
              </motion.button>
            );
          })}
          {filteredClauses.length === 0 && (
            <div className="glass-card p-8 text-center text-sm text-[#71717A]">
              No clauses in this category.
            </div>
          )}
        </div>

        {/* Right panel — summary / detail (40%) */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <AnimatePresence mode="wait">
              {selectedClause ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="glass-card p-6"
                  data-testid="clause-detail"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    data-testid="detail-back-to-summary"
                    className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-[#71717A] hover:text-[#F4F4F5]"
                  >
                    <ChevronLeft size={14} /> Back to summary
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={selectedClause.category} />
                    <RiskBadge score={selectedClause.risk_score} />
                  </div>
                  <div className="mt-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[#71717A]">
                      Plain English
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#F4F4F5]" data-testid="detail-explanation">
                      {selectedClause.plain_explanation}
                    </p>
                  </div>
                  <div className="mt-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[#71717A]">
                      Why this score
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#F4F4F5]" data-testid="detail-reason">
                      {selectedClause.risk_reason}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="glass-card p-6"
                  data-testid="summary-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A]">
                        Overall Risk
                      </p>
                      <div className="mt-2 flex items-end gap-2">
                        <span
                          className="font-heading text-5xl font-extrabold leading-none"
                          style={{ color: riskColor(overallRounded) }}
                          data-testid="overall-risk-score"
                        >
                          {overall.toFixed(1)}
                        </span>
                        <span className="mb-1 text-sm text-[#71717A]">/ 5</span>
                      </div>
                      <div className="mt-2">
                        <RiskBadge score={overallRounded} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-4 py-3 text-center">
                      <p className="font-heading text-2xl font-bold text-[#EF4444]" data-testid="high-risk-count">
                        {doc.high_risk_count ?? 0}
                      </p>
                      <p className="text-[11px] text-[#71717A]">high-risk</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[rgba(255,255,255,0.07)] pt-5">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#71717A]">
                      Category Breakdown
                    </h4>
                    <div className="space-y-3" data-testid="category-breakdown">
                      {Object.entries(categoryCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cat, count]) => (
                          <div key={cat}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-[#F4F4F5]">{cat}</span>
                              <span className="font-mono text-[#71717A]">{count}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#0A0A0F]">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: categoryColor(cat) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / maxCategoryCount) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <p className="mt-6 text-xs text-[#52525B]">
                    Select any clause on the left to see its plain-English breakdown.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
