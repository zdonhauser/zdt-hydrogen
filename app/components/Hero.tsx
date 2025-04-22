import {useEffect, useRef} from 'react';
import {Link} from '@remix-run/react';

interface HeroProps {
  id: string;
}

export default function Hero({id}: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
  
    const scrollRange = 1000;
    const pauseTime = 1.6;
    let scrollActive = false;
    let scrollStartY = 0;
    let scrollStartTime = 0;
    let raf: number;
  
    const handleScroll = () => {
      if (!video || !scrollActive) return;
  
      if (!video.paused) video.pause();
  
      const scrollDelta = window.scrollY - scrollStartY;
      const duration = video.duration || 1;
  
      const loopedTime =
        (((scrollStartTime * scrollRange + scrollDelta) % scrollRange) /
          scrollRange) *
        duration;
  
      video.currentTime = loopedTime;
    };
  
    const startScrollPlayback = () => {
      if (!video) return;
      scrollActive = true;
      scrollStartY = window.scrollY;
      scrollStartTime = (video.currentTime || 0) / (video.duration || 1);
  
      video.pause();
      video.removeAttribute('autoplay');
      video.removeAttribute('loop');
      video.removeAttribute('muted');
  
      window.addEventListener('scroll', handleScroll, { passive: true });
    };
  
    const monitorPlayback = () => {
      if (!video || scrollActive) return;
  
      if (video.currentTime >= pauseTime) {
        startScrollPlayback();
        return;
      }
  
      raf = requestAnimationFrame(monitorPlayback);
    };
  
    const onMeta = () => {
      // Start playing from beginning
      video.currentTime = 0;
      video.play().catch(() => {});
  
      // Begin checking for pause point
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
  }, []);

  return (
    <div className="relative top-0 w-full overflow-hidden text-white">
      <div className="inset-0 w-full h-[80vh] z-0 p-0">
        <video
          id="hero-video"
          ref={videoRef}
          src="/video/switchback/sb_hero.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center md:object-[center_30%]"
          poster="/video/switchback/hero_poster.jpg"
        />
      </div>

      <div className="absolute h-screen inset-0 z-10 flex flex-col items-center justify-center px-6 text-center pointer-events-none bg-gradient-to-b from-transparent via-black/30 to-black/80">
        <br />
        <br />
        <img
          src="/logos/logo_zdts.png"
          alt="ZDT's Logo"
          className="w-64 md:w-80 mb-6 drop-shadow-[6px_6px_0_rgba(0,0,0,0.9)] pointer-events-auto"
        />
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] tracking-tight uppercase">
          FAMILY FUN AWAITS
        </h1>
        <p className="mt-4 max-w-xl text-base md:text-lg text-white font-semibold drop-shadow-md">
          Experience the thrill of our rides and attractions!
        </p>
        <Link
          to="/products/unlimitedwristband"
          className="mt-6 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 px-8 rounded-full text-lg shadow-[0_3px_0_rgba(0,0,0,0.8)] transition-all duration-150 pointer-events-auto uppercase tracking-wider"
        >
          TICKETS
        </Link>
      </div>
    </div>
  );
}
