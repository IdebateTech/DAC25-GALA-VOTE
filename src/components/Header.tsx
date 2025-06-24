import React from 'react';
import { Trophy, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../utils/translations';

const Header: React.FC = () => {
  const { language } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-orange-900 via-orange-800 to-yellow-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white transition-colors duration-300" style={{
      background: 'linear-gradient(to right, #7c2d12, #9a3412, #a16333)'
    }}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-400 mr-3" style={{ color: '#f4be68' }} />
            <h1 className="text-4xl md:text-5xl font-bold">
              {t('title', language)}
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: '#f4be68' }}>
            {t('subtitle', language)}
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-lg">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" style={{ color: '#f4be68' }} />
              <span>{t('location', language)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" style={{ color: '#f4be68' }} />
              <span>{t('date', language)}</span>
            </div>
          </div>
          <p className="mt-6 text-xl font-medium" style={{ color: '#f4be68' }}>
            {t('tagline', language)}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;