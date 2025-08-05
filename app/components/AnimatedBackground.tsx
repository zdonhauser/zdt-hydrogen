import { useEffect, useState, useRef } from 'react';

interface AnimatedBackgroundProps {
  text: string;
  className?: string;
  textColor?: string;
  opacity?: string;
}

export function AnimatedBackground({ 
  text, 
  className = '', 
  textColor = 'text-blue-200',
  opacity = 'opacity-20'
}: AnimatedBackgroundProps) {
  const [lineCount, setLineCount] = useState(30);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create alternating opacities based on the input
  const getOpacityClasses = (index: number) => {
    if (opacity === 'opacity-10') {
      return index % 2 === 0 ? 'opacity-10' : 'opacity-40';
    } else if (opacity === 'opacity-20') {
      return index % 2 === 0 ? 'opacity-20' : 'opacity-60';
    } else {
      return index % 2 === 0 ? opacity : opacity; // fallback to same opacity if unknown
    }
  };

  useEffect(() => {
    const updateLineCount = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        const lineHeight = 80; // Approximate height of each text line in pixels
        const calculatedLineCount = Math.ceil(containerHeight / lineHeight) + 5; // Add extra for overlap
        setLineCount(calculatedLineCount);
      }
    };

    // Initial calculation
    updateLineCount();

    // Recalculate on window resize
    window.addEventListener('resize', updateLineCount);
    
    // Use ResizeObserver if available for better accuracy
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateLineCount);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateLineCount);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col items-center ${className}`}>
      {[...Array(lineCount)].map((_, idx) => (
        <div
          key={idx}
          className={`flex whitespace-nowrap text-6xl md:text-8xl font-extrabold leading-none ${
            idx % 2 === 0 ? 'animate-[scroll-left_linear_infinite]' : 'animate-[scroll-right_linear_infinite]'
          } ${getOpacityClasses(idx)} ${textColor}`}
          style={{
            animationDuration: `${40 + idx * 5}s`,
          }}
        >
          {text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;
        </div>
      ))}
    </div>
  );
}