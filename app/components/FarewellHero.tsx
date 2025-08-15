import {useEffect, useRef, useState} from 'react';

export default function FarewellHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLandscape, setIsLandscape] = useState(false);

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
    <div className="relative w-full bg-black" style={{ height: '400vh' }}>
      {/* Video Background - Fixed in viewport */}
      <div className="fixed inset-0 w-full h-full">
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover object-center md:object-[center_30%]"
          poster="https://cdn.shopify.com/s/files/1/0038/2527/0897/files/hero_poster.jpg"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Farewell Message - Fixed in viewport */}
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] tracking-tight">
            ZDT's Amusement Park is now closed
          </h1>
          
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] mb-12">
            Thank you for 18 amazing years
          </p>
          
          <div className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto space-y-4">
            <p className="font-medium">
            For more than 18 years, we've had the privilege of filling your days with smiles, thrills, and unforgettable memories.
            </p>
            <p className="font-medium">
              To every child who conquered their fears on the Switchback, every family who celebrated together, 
              and every one of you who made ZDT's your happy place - thank you from the bottom of our hearts.
            </p>
            <p className="font-bold text-xl md:text-2xl mt-8 text-[var(--color-brand-yellow)]">
              The adventure may be over, but the memories will last forever.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Fixed in viewport */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce z-20">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2">Scroll</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}