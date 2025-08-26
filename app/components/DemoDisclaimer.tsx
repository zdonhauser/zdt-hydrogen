import { useState, useEffect, useRef } from 'react';

/**
 * DemoDisclaimer Component
 * Shows a modal disclaimer on first visit to demo site
 * Uses localStorage to track if user has already seen the disclaimer
 */
export default function DemoDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsOpen(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
    }, 300); 
  };

  // Focus the dialog when it opens and handle Escape key
  useEffect(() => {
    if (isOpen && !isClosing) {
      if (dialogRef.current) {
        dialogRef.current.focus();
      }
      
      // Add escape key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isClosing]);

  useEffect(() => {
    // Check if user has already seen the disclaimer
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDemoDisclaimer');
    
    if (!hasSeenDisclaimer) {
      setIsOpen(true);
      localStorage.setItem('hasSeenDemoDisclaimer', 'true');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className={`
          fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 ease-in-out
          ${isClosing ? 'opacity-0' : 'opacity-100'}
        `}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          fixed inset-0 z-[101] flex items-center justify-center p-4
          pointer-events-none
        `}
      >
        <div 
          className={`
            pointer-events-auto
            bg-white rounded-2xl border-4 border-black shadow-2xl
            max-w-lg w-full p-8 md:p-10
            transform transition-all duration-300 ease-out
            ${isClosing 
              ? 'scale-95 opacity-0' 
              : 'scale-100 opacity-100 animate-in zoom-in-95'
            }
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-dialog-title"
          ref={dialogRef}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 id="demo-dialog-title" className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">
              Demo Site
            </h2>
            <div className="mt-2 h-1 w-24 mx-auto bg-[var(--color-brand-yellow)]" />
          </div>

          {/* Content */}
          <div className="space-y-4 text-gray-700">
            <p className="text-lg leading-relaxed">
              This is a portfolio demonstration of the <span className="font-bold text-black">ZDT&apos;s Amusement Park</span> website.
            </p>
            
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                ⚠️ Please Note:
              </p>
              <ul className="text-sm space-y-1 text-yellow-800">
                <li>• This is a demonstration site only</li>
                <li>• The park is permanently closed</li>
                <li>• No real transactions can be completed</li>
                <li>• All features are for portfolio purposes</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              Built with Shopify Hydrogen, React Router 7, and TypeScript to showcase modern e-commerce 
              and booking system capabilities.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="
                flex-1 px-6 py-3 
                bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)]
                border-3 border-black rounded-lg
                font-black text-black uppercase tracking-wider
                transform transition-all duration-200
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
              "
            >
              I Understand
            </button>
            
            <a
              href="https://www.donrey.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex-1 px-6 py-3
                bg-gray-900 hover:bg-gray-800
                border-3 border-black rounded-lg
                font-bold text-white uppercase tracking-wider text-center
                transform transition-all duration-200
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
              "
            >
              View Portfolio
            </a>
          </div>
        </div>
      </div>
    </>
  );
}