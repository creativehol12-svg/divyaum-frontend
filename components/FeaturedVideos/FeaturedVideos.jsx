"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import VideoModal from "@/components/VideoModel/VideoModel";
import FeaturedHero from "@/components/FeaturedVideos/FeaturedHero";
import FeaturedSideCard from "@/components/FeaturedVideos/FeaturedSideCard";
import styles from "./FeaturedVideos.module.scss";

export default function FeaturedVideos({ videos = [] }) {
  const [activeId, setActiveId] = useState(videos[0]?.id ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVideoId, setModalVideoId] = useState(null);

  useEffect(() => {
    if (!videos.length) {
      setActiveId("");
      return;
    }
    const stillExists = videos.some((v) => v.id === activeId);
    if (!stillExists) {
      setActiveId(videos[0].id);
    }
  }, [videos, activeId]);

  const activeVideo = useMemo(
    () => videos.find((v) => v.id === activeId) ?? videos[0],
    [videos, activeId],
  );

  const sideVideos = useMemo(
    () => videos.filter((v) => v.id !== activeVideo?.id).slice(0, 3),
    [videos, activeVideo?.id],
  );

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setModalVideoId(null);
  }, []);

  const handlePlay = useCallback((video) => {
    if (!video?.videoId) return;
    setActiveId(video.id);
    setModalVideoId(video.videoId);
    setIsModalOpen(true);
  }, []);

  if (!videos.length) return null;

  return (
    <section className={styles.section} aria-labelledby="featured-videos-heading">
      <div className="container">
        <header className={styles.header}>
          <p className={styles.subtitle}>Video Insights</p>
          <h2 id="featured-videos-heading" className={styles.title}>
            Sanatan Gyan
          </h2>
          <p className={styles.description}>
            Distilled wisdom and conversation.
          </p>
        </header>

        <div className={styles.showcase}>
          <div className={styles.heroColumn}>
            <FeaturedHero
              video={activeVideo}
              onPlay={() => handlePlay(activeVideo)}
            />
          </div>

          <aside className={styles.sideColumn} aria-label="More videos">
            <div className={styles.sideList}>
              {sideVideos.map((video) => (
                <FeaturedSideCard
                  key={video.id}
                  video={video}
                  onPlay={() => handlePlay(video)}
                />
              ))}
            </div>
          </aside>
        </div>

        <div className={styles.mobileRail} aria-label="More videos">
          {sideVideos.map((video) => (
            <div key={video.id} className={styles.mobileRailItem}>
              <FeaturedSideCard
                video={video}
                onPlay={() => handlePlay(video)}
              />
            </div>
          ))}
        </div>

        <VideoModal
          isOpen={isModalOpen}
          onClose={handleClose}
          videoId={modalVideoId}
        />
      </div>
    </section>
  );
}
