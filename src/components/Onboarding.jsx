import { useState, useEffect } from 'react';

const STORAGE_KEY = 'storycards_onboarding_dismissed';

/**
 * Onboarding overlay for first-time visitors
 * Shows a brief introduction to the app and the index card method
 */
function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed onboarding before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (dontShowAgain = false) => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 animate-fade-in">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-plot/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-plot" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-ink">Welcome to Storycards</h2>
        </div>

        {/* Description */}
        <p className="text-muted leading-relaxed mb-6">
          Storycards brings the classic screenwriter's index card method to your browser.
          Create cards for your story beats, drag them to reorder your narrative,
          filter by category or character, and let AI summarize your story arc.
          Your deck auto-saves and can be shared with a simple link.
        </p>

        {/* Quick tips */}
        <div className="bg-cream/50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-ink mb-2">Quick Tips</h3>
          <ul className="text-sm text-muted space-y-1">
            <li className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono border border-faint">N</kbd>
              <span>Create a new card</span>
            </li>
            <li className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white rounded text-xs font-mono border border-faint">Cmd+Z</kbd>
              <span>Undo last reorder</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </span>
              <span>Drag cards to reorder your story</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => handleDismiss(false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-ink text-cream rounded-lg font-medium hover:bg-ink/90 transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={() => handleDismiss(true)}
            className="w-full sm:w-auto px-6 py-2.5 text-muted hover:text-ink transition-colors text-sm"
          >
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
