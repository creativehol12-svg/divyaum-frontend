"use client";

import { useEffect } from "react";
import styles from "./VideoModel.module.scss";

export default function VideoModal({ isOpen, onClose, videoId }) {
  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        {/* Video */}
        <div className={styles.videoWrap}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}