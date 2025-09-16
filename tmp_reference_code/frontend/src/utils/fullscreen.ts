/**
 * Utility functions for managing browser fullscreen mode
 */

/**
 * Request fullscreen mode for the entire document
 * Note: This must be called from a user interaction (click, touch, etc.)
 * @returns Promise that resolves when fullscreen is entered
 */
export const enterFullscreen = async (): Promise<void> => {
  try {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      // Safari/old Chrome
      await (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      // Firefox
      await (elem as any).mozRequestFullScreen();
    } else if ((elem as any).msRequestFullscreen) {
      // IE/Edge
      await (elem as any).msRequestFullscreen();
    }
    
    console.log('Entered fullscreen mode');
  } catch (error) {
    console.error('Failed to enter fullscreen:', error);
    // Fullscreen API requires user interaction
    // It will fail if not triggered by user action
  }
};

/**
 * Exit fullscreen mode
 * @returns Promise that resolves when fullscreen is exited
 */
export const exitFullscreen = async (): Promise<void> => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      // Safari/old Chrome
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      // Firefox
      await (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      // IE/Edge
      await (document as any).msExitFullscreen();
    }
    
    console.log('Exited fullscreen mode');
  } catch (error) {
    console.error('Failed to exit fullscreen:', error);
  }
};

/**
 * Check if the browser is currently in fullscreen mode
 * @returns boolean indicating fullscreen state
 */
export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

/**
 * Toggle fullscreen mode
 * @returns Promise that resolves when toggle is complete
 */
export const toggleFullscreen = async (): Promise<void> => {
  if (isFullscreen()) {
    await exitFullscreen();
  } else {
    await enterFullscreen();
  }
};

/**
 * Check if fullscreen API is supported
 * @returns boolean indicating support
 */
export const isFullscreenSupported = (): boolean => {
  return !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as any).webkitRequestFullscreen ||
    (document.documentElement as any).mozRequestFullScreen ||
    (document.documentElement as any).msRequestFullscreen
  );
};

/**
 * Note on browser support:
 * - Desktop browsers: Full support
 * - iOS Safari: Limited support (videos only)
 * - Android Chrome: Full support
 * - iPad Safari: Limited support (requires user gesture)
 * 
 * The Fullscreen API requires user interaction (click/touch) to work.
 * It cannot be triggered automatically on page load.
 */