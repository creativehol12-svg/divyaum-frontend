"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchSearchResults, getSearchResultHref } from "@/lib/searchApi";
import styles from "./HeaderSearch.module.scss";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 320;

export default function HeaderSearch({ onOpenChange }) {
  const listboxId = useId();
  const router = useRouter();
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigableResults = results.filter((item) => getSearchResultHref(item));

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setError("");
    setLoading(false);
    setActiveIndex(-1);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        closeSearch();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeSearch();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeSearch]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!isOpen || trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError("");
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      fetchSearchResults(trimmed, { signal: controller.signal })
        .then((items) => {
          setResults(items);
          setActiveIndex(-1);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setResults([]);
          setError("Could not load results. Please try again.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen]);

  const goToResult = useCallback(
    (item) => {
      const href = getSearchResultHref(item);
      if (!href) return;
      closeSearch();
      router.push(href);
    },
    [closeSearch, router]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeIndex >= 0 && navigableResults[activeIndex]) {
      goToResult(navigableResults[activeIndex]);
      return;
    }
    if (navigableResults[0]) goToResult(navigableResults[0]);
  };

  const handleInputKeyDown = (event) => {
    if (!navigableResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev < navigableResults.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : navigableResults.length - 1
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      goToResult(navigableResults[activeIndex]);
    }
  };

  const showPanel =
    isOpen &&
    (loading || error || query.trim().length >= MIN_QUERY_LENGTH);

  const trimmedQuery = query.trim();
  const showEmpty =
    !loading &&
    !error &&
    trimmedQuery.length >= MIN_QUERY_LENGTH &&
    results.length === 0;

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isOpen ? styles.rootOpen : ""}`}
    >
      {!isOpen ? (
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={openSearch}
          aria-label="Open search"
        >
          <svg viewBox="0 0 24 24" className={styles.searchIcon} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20 16.5 16.5" />
          </svg>
        </button>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} role="search">
          <span className={styles.inputIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20 16.5 16.5" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            className={styles.input}
            placeholder="Search pooja, products.."
            aria-label="Search"
            aria-expanded={showPanel}
            aria-controls={showPanel ? listboxId : undefined}
            aria-autocomplete="list"
            autoComplete="off"
          />
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeSearch}
            aria-label="Close search"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6 18 18M18 6 6 18" />
            </svg>
          </button>

          {showPanel ? (
            <div
              id={listboxId}
              className={styles.panel}
              role="listbox"
              aria-label="Search results"
            >
              {loading ? (
                <div className={styles.status}>
                  <span className={styles.spinner} aria-hidden="true" />
                  Searching…
                </div>
              ) : null}

              {error ? <p className={styles.status}>{error}</p> : null}

              {showEmpty ? (
                <p className={styles.status}>
                  No results for &ldquo;{trimmedQuery}&rdquo;
                </p>
              ) : null}

              {!loading && !error && results.length > 0 ? (
                <ul className={styles.resultList}>
                  {results.map((item, index) => {
                    const href = getSearchResultHref(item);
                    const navIndex = navigableResults.indexOf(item);
                    const isActive = navIndex >= 0 && navIndex === activeIndex;

                    if (!href) {
                      return (
                        <li
                          key={`${item.type}-${item.id}-${index}`}
                          className={styles.resultItemDisabled}
                        >
                          <span className={styles.resultName}>{item.name}</span>
                        </li>
                      );
                    }

                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <Link
                          href={href}
                          className={`${styles.resultLink} ${isActive ? styles.resultLinkActive : ""}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIndex(navIndex)}
                          onClick={() => closeSearch()}
                        >
                          <span className={styles.resultName}>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
