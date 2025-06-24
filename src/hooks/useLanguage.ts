import { useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dreamers-language') as Language;
    
    // Always default to English unless explicitly saved as French
    const initialLanguage = savedLanguage === 'fr' ? 'fr' : 'en';
    setLanguage(initialLanguage);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'fr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('dreamers-language', newLanguage);
  };

  return { language, toggleLanguage };
};