import React, { useEffect } from 'react';
import { isTauri } from '../utils/platform';

interface PresentationWindowProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export const PresentationWindow: React.FC<PresentationWindowProps> = ({
  children,
  backgroundColor = '#ffffff',
}) => {
  useEffect(() => {
    if (!isTauri()) return;

    // Import Tauri window API dynamically
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
      const tauriWindow = getCurrentWindow();

      // F11 - Toggle fullscreen, ESC - Exit fullscreen
      const handleKeyDown = async (e: KeyboardEvent) => {
        if (e.key === 'F11') {
          e.preventDefault();
          const isFullscreen = await tauriWindow.isFullscreen();
          await tauriWindow.setFullscreen(!isFullscreen);
        } else if (e.key === 'Escape') {
          const isFullscreen = await tauriWindow.isFullscreen();
          if (isFullscreen) {
            await tauriWindow.setFullscreen(false);
          }
        }
      };

      // Add event listener to DOM window (not Tauri window!)
      window.addEventListener('keydown', handleKeyDown);

      // Cleanup
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    });
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
};
