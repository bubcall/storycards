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
          Write your story beats like physical index cards, flip them over to add notes,
          and drag to arrange your narrative. Your deck auto-saves and can be shared with a link.
        </p>

        {/* Quick tips */}
        <div className="bg-cream/50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-ink mb-3">How it works</h3>
          <ul className="text-sm text-muted space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-ink font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-faint mt-0.5">1</span>
              <span><strong>Write</strong> your story beat on the front of the card</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ink font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-faint mt-0.5">2</span>
              <span><strong>Flip</strong> to add notes, tags, and link characters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ink font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-faint mt-0.5">3</span>
              <span><strong>Place</strong> the card and drag to arrange your story</span>
            </li>
          </ul>

          <div className="border-t border-faint/50 mt-3 pt-3">
            <h4 className="text-xs font-medium text-muted mb-2">Keyboard Shortcuts</h4>
            <div className="flex flex-wrap gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white rounded font-mono border border-faint">N</kbd>
                New card
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white rounded font-mono border border-faint">F</kbd>
                Flip card
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white rounded font-mono border border-faint">Esc</kbd>
                Cancel
              </span>
            </div>
          </div>
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
