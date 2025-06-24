import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex items-center gap-2"
      title={`Switch to ${language === 'en' ? 'French' : 'English'}`}
      aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
    >
      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[24px]">
        {language.toUpperCase()}
      </span>
    </button>
  );
};

export default LanguageToggle;