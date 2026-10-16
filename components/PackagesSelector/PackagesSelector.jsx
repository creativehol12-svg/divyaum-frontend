"use client";

import React from "react";
import styles from "./PackagesSelector.module.scss";

export default function PackagesSelector() {
  const [selected, setSelected] = React.useState(null);
  const [packages, setPackages] = React.useState([]);

  React.useEffect(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";

    fetch(`${baseUrl}/api/packages`)
      .then((res) => res.json())
      .then((json) => {
        const apiPackages = Array.isArray(json) ? json : [];

        
        const formatted = apiPackages.map((pkg) => ({
          id: pkg.id,
          title: pkg.name,
          price: pkg.price,
          description: pkg.description,   
          features: pkg.benefits || [],   
        }));

        setPackages(formatted);

        // choose default package: prefer one with 'premium' in title, otherwise first
        const premiumIndex = formatted.findIndex((p) =>
          String(p.title || "").toLowerCase().includes("premium")
        );
        const defaultIdx = premiumIndex >= 0 ? premiumIndex : 0;
        setSelected(defaultIdx);
        if (formatted[defaultIdx]) {
          const pkg = formatted[defaultIdx];
          localStorage.setItem(
            "selectedPackage",
            JSON.stringify({ id: pkg.id, name: pkg.title, price: pkg.price })
          );
        }
      })
      .catch((err) => {
        console.error("Package fetch error:", err);
      });
  }, []);

  const handleSelect = (idx, pkg) => {
    // clicking the already-selected package should NOT unselect it
    if (selected === idx) return;

    setSelected(idx);

    localStorage.setItem(
      "selectedPackage",
      JSON.stringify({ id: pkg.id, name: pkg.title, price: pkg.price })
    );
  };

  return (
    <div className={styles.packagesSelector}>
      <div className={styles.cardsContainer}>
        {packages.map((pkg, idx) => (
          <div
            key={pkg.id}
            className={`${styles.card} ${selected === idx ? styles.active : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => handleSelect(idx, pkg)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect(idx, pkg);
            }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{pkg.title}</span>
              <span className={styles.cardPrice}>
                ₹ {(pkg.price ?? 0).toLocaleString("en-IN")}
              </span>
            </div>

           
            <p className={styles.cardDesc}>{pkg.description}</p>

            
            <ul className={styles.features}>
              {pkg.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            <button
              className={styles.selectBtn}
              onClick={() => handleSelect(idx, pkg)}
            >
              {selected === idx ? "Selected" : "Select ›"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}