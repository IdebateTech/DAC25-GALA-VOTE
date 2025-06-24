// Performance optimization utilities

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url));
  await Promise.allSettled(promises);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const measurePerformance = (name: string, fn: () => void): void => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

export const optimizeLocalStorage = () => {
  try {
    // Clean up old or unnecessary localStorage items
    const keysToCheck = Object.keys(localStorage);
    keysToCheck.forEach(key => {
      if (key.startsWith('temp-') || key.includes('cache-')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.expiry && Date.now() > parsed.expiry) {
              localStorage.removeItem(key);
            }
          } catch {
            // If parsing fails, it might be an old format, consider removing
          }
        }
      }
    });
  } catch (error) {
    console.warn('Error optimizing localStorage:', error);
  }
};

export const getWebVitals = (): Promise<any> => {
  return new Promise((resolve) => {
    // Simulate Web Vitals measurement
    const vitals = {
      FCP: Math.random() * 2000 + 500, // First Contentful Paint
      LCP: Math.random() * 3000 + 1000, // Largest Contentful Paint
      FID: Math.random() * 100 + 10, // First Input Delay
      CLS: Math.random() * 0.1, // Cumulative Layout Shift
      TTFB: Math.random() * 500 + 100 // Time to First Byte
    };
    
    setTimeout(() => resolve(vitals), 100);
  });
};