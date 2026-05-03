import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

/**
 * PWA Install Prompt Component
 * Shows an installation prompt for the Progressive Web App
 * Allows users to install the app to their home screen
 * 
 * @component
 * @returns {JSX.Element|null} Install prompt banner or null if not installable
 */
const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user is on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || localStorage.getItem('pwa-installed');

    if (isInstalled) {
      return;
    }

    // Check if user dismissed the prompt
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show manual install instructions
    if (iOS && !isInstalled) {
      setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installed');
      localStorage.setItem('pwa-installed', 'true');
    }

    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS && !installPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border-2 border-sage-300 rounded-lg shadow-xl p-4 z-50 animate-slide-up">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="bg-sage-100 p-2 rounded-lg">
            <Download className="w-6 h-6 text-sage-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-1">Install WellSpring App</h3>
            <p className="text-sm text-gray-600 mb-2">
              Install this app on your iPhone: tap 
              <svg className="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
              </svg>
              then "Add to Home Screen"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Standard Install Prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-sage-600 to-sage-700 rounded-lg shadow-xl p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-sage-100 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">Install WellSpring App</h3>
          <p className="text-sm text-sage-50 mb-3">
            Install our app for quick access and offline support!
          </p>
          <button
            onClick={handleInstall}
            className="bg-white text-sage-700 px-4 py-2 rounded-lg font-medium hover:bg-sage-50 transition active:scale-95 text-sm"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
