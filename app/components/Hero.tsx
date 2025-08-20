import {useEffect, useRef, useState} from 'react';
import { Link } from 'react-router';

interface HeroProps {
  id: string;
}

export default function Hero({id}: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLandscape, setIsLandscape] = useState(false); // default true to avoid SSR flicker

  useEffect(() => {
    const handleResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscape);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const scrollRange = 1000;
    const pauseTime = 1.6;
    let scrollStartY = 0;
    let scrollStartTime = 0;
    let raf: number;
    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;

    // Reduce scroll sensitivity on desktop / landscape
    const scrollDampener = isLandscape ? 0.4 : 1; // tweak to taste

    const handleScroll = () => {
      targetScroll = window.scrollY;
    };

    const smoothScrollUpdate = () => {
      if (!video) return;

      currentScroll += (targetScroll - currentScroll) * 0.1;

      const scrollDelta = (currentScroll - scrollStartY) * scrollDampener;
      const duration = video.duration || 1;

      const loopedTime =
        (((scrollStartTime * scrollRange + scrollDelta) % scrollRange) /
          scrollRange) *
        duration;

      video.currentTime = loopedTime;
      raf = requestAnimationFrame(smoothScrollUpdate);
    };

    const startScrollPlayback = () => {
      if (!video) return;

      scrollStartY = window.scrollY;
      scrollStartTime = (video.currentTime || 0) / (video.duration || 1);

      video.pause();
      video.removeAttribute('autoplay');
      video.removeAttribute('loop');
      video.removeAttribute('muted');

      window.addEventListener('scroll', handleScroll, {passive: true});
      raf = requestAnimationFrame(smoothScrollUpdate);
    };

    const monitorPlayback = () => {
      if (!video) return;

      if (video.currentTime >= pauseTime) {
        startScrollPlayback();
        return;
      }

      raf = requestAnimationFrame(monitorPlayback);
    };

    const onMeta = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
      raf = requestAnimationFrame(monitorPlayback);
    };

    if (video.readyState >= 1) {
      onMeta();
    } else {
      video.addEventListener('loadedmetadata', onMeta);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleScroll);
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [isLandscape]);

  const videoUrl = isLandscape
    ? 'https://cdn.shopify.com/videos/c/o/v/94b01b5f92834ddd8e7b39ee06b2e09c.mp4'
    : 'https://cdn.shopify.com/videos/c/o/v/71c337e0417740ba91b5041e49237449.mp4';

  return (
    <div className="relative top-0 w-full overflow-hidden text-white">
      <div className="inset-0 w-full h-[80vh] z-0 p-0">
        <video
          id="hero-video"
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center md:object-[center_30%]"
          poster="https://cdn.shopify.com/s/files/1/0038/2527/0897/files/hero_poster.jpg"
        />
      </div>

      <div
        className={`absolute inset-0 h-screen z-10 pointer-events-none ${
          isLandscape
            ? 'flex flex-row items-center'
            : 'flex flex-col justify-center text-center'
        }`}
      >
        {isLandscape && (
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-black via-black/90 to-transparent z-0 pointer-events-none" />
        )}

        {/* Content wrapper */}
        <div
          className={`relative z-10 px-6 ${
            isLandscape ? 'w-1/2 text-left pl-12' : 'items-center'
          } flex flex-col pointer-events-auto`}
        >
          <img
            src="/logos/logo_zdts.png"
            alt="ZDT's Logo"
            className="w-64 md:w-80 mb-6 drop-shadow-[6px_6px_0_rgba(0,0,0,0.9)] mx-auto"
          />
          <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] tracking-tight uppercase text-center">
            AS OF AUGUST 17, 2025<br />
            <span className="text-4xl md:text-6xl text-[var(--color-brand-yellow)] drop-shadow-[4px_4px_0_rgba(0,0,0,0.9)]">
              ZDT'S IS NOW CLOSED
            </span>
          </h1>
          <p className="mt-4  text-base md:text-lg text-white font-bold [text-shadow:_1px_1px_0_rgb(0_0_0),_-1px_-1px_0_rgb(0_0_0),_1px_-1px_0_rgb(0_0_0),_-1px_1px_0_rgb(0_0_0),_2px_2px_4px_rgba(0,0,0,0.8)] md:drop-shadow-md text-center">
            Thank you for 18 amazing years!
          </p>
          {/*
          <Link
            to="/products/unlimitedwristband"
            onMouseDown={(e) => {
              e.currentTarget.click();
            }}
            className="mt-6 bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-black font-black py-3 px-8 rounded-full text-lg shadow-[0_3px_0_rgba(0,0,0,0.8)] transition-all duration-150 uppercase tracking-wider"
          >
            TICKETS
          </Link>
          */}
        </div>
      </div>
    </div>
  );
}
