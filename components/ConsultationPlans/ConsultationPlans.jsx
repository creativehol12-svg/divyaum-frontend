"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import styles from "./ConsultationPlans.module.scss";

const DURATION_EVENT = "divyaum:consultation-duration";
const DURATION_SYNC_EVENT = "divyaum:consultation-duration-changed";

function formatNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : "0";
}

function normalizePlan(raw) {
  const minutes = Number(raw?.minutes ?? raw?.duration ?? 0);
  const feeRaw = raw?.fee ?? raw?.price ?? raw?.amount ?? 0;
  const fee = Number(String(feeRaw).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (!Number.isFinite(fee) || fee < 0) return null;
  return { minutes, fee };
}

const SLOT_DURATIONS = new Set([15, 30, 45]);

/** Short plan name shown on each card; varies by session length. */
function planTitleForDuration(minutes) {
  const m = Number(minutes);
  switch (m) {
    case 15:
      return "Express consultation";
    case 30:
      return "Standard consultation";
    case 45:
      return "Extended consultation";
    default:
      return `${m}-minute consultation`;
  }
}

function buildFallbackPlans(baseFee) {
  const base = Number(baseFee);
  if (!Number.isFinite(base) || base <= 0) return [];
  return [15, 30, 45].map((minutes) => ({
    minutes,
    fee: Math.round((base * minutes) / 15),
  }));
}

export default function ConsultationPlans({ fees = [], fallbackBaseFee }) {
  const plans = useMemo(() => {
    let list;
    if (Array.isArray(fees) && fees.length) {
      const mapped = fees.map(normalizePlan).filter(Boolean);
      mapped.sort((a, b) => a.minutes - b.minutes);
      const bookable = mapped.filter((p) => SLOT_DURATIONS.has(p.minutes));
      list = bookable.length ? bookable : mapped;
    } else {
      list = buildFallbackPlans(fallbackBaseFee);
    }
    return list;
  }, [fees, fallbackBaseFee]);

  const defaultHighlight = useMemo(() => {
    const has30 = plans.some((p) => p.minutes === 30);
    if (has30) return 30;
    return plans[0]?.minutes ?? null;
  }, [plans]);

  const [highlightMinutes, setHighlightMinutes] = useState(defaultHighlight);

  useEffect(() => {
    setHighlightMinutes(defaultHighlight);
  }, [defaultHighlight]);

  useEffect(() => {
    const onSync = (e) => {
      const next = Number(e?.detail);
      if (!Number.isFinite(next)) return;
      if (!plans.some((p) => p.minutes === next)) return;
      setHighlightMinutes(next);
    };
    window.addEventListener(DURATION_SYNC_EVENT, onSync);
    return () => window.removeEventListener(DURATION_SYNC_EVENT, onSync);
  }, [plans]);

  const announceAndScroll = useCallback((minutes) => {
    setHighlightMinutes(minutes);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(DURATION_EVENT, { detail: minutes }));
      document.getElementById("slots")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (!plans.length) return null;

  return (
    <section className={styles.section} aria-labelledby="consultation-plans-heading">
      <div className="container">
        <header className={styles.header}>
          
          <div className={styles.headerText}>
            <h2 id="consultation-plans-heading" className={styles.title}>
              Consultation Plans
            </h2>
            <p className={styles.subtitle}>
              Transparent pricing by session length. Choose a plan, then pick your slot below.
            </p>
          </div>
          
        </header>

        <ul className={styles.grid} role="list">
          {plans.map((plan) => {
            const isStarter = plan.minutes === 15;
            const isPopular = plan.minutes === 30;
            const isBestValue =
              plan.minutes === 45 && plans.some((p) => p.minutes === 30);
            const isSelected = highlightMinutes === plan.minutes;
            const showRibbon = isStarter || isPopular || isBestValue;

            return (
              <li key={plan.minutes} className={styles.cell}>
                <article
                  className={`${styles.card} ${isSelected ? styles.cardSelected : ""} ${isPopular ? styles.cardPopular : ""} ${isStarter ? styles.cardStarter : ""}`.trim()}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => announceAndScroll(plan.minutes)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      announceAndScroll(plan.minutes);
                    }
                  }}
                >
                  {showRibbon ? (
                    <div className={styles.ribbonRow}>
                      {isPopular ? (
                        <span className={isSelected ? styles.badgePopular : styles.badgeValue}>Most popular</span>
                      ) : isStarter ? (
                        <span className={isSelected ? styles.badgePopular : styles.badgeValue}>Quick start</span>
                      ) : (
                        <span className={isSelected? styles.badgePopular:styles.badgeValue}>Deepest session</span>
                      )}
                    </div>
                  ) : null}

                  <div className={styles.cardTop}>
                   

                    <h3 className={styles.planHeadline}>{planTitleForDuration(plan.minutes)}</h3>
                    <p className={styles.planMinutes}>{plan.minutes} minutes</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.priceBlock}>
                      <span className={styles.currency}>₹</span>
                      <span className={styles.price}>{formatNumber(plan.fee)}</span>
                    </div>

                    <Button
                      type="button"
                      variant="unstyled"
                      className={styles.cta}
                      aria-pressed={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        announceAndScroll(plan.minutes);
                      }}
                    >
                      {isSelected ? "Selected — pick a slot" : "Select & book"}
                      <span className={styles.ctaArrow} aria-hidden="true">›</span>
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
