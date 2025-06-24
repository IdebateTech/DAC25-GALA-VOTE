import React from 'react';
import { Mail, Heart, Star } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../utils/translations';

const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" style={{ color: '#f4be68' }} />
              {t('questions', language)}
            </h3>
            <p className="text-gray-300 mb-4">
              {t('questionsDescription', language)}
            </p>
            <a
              href="mailto:dreamers@idebaterwanda.org"
              className="flex items-center hover:opacity-80 transition-colors"
              style={{ color: '#eb754f' }}
            >
              <Mail className="w-4 h-4 mr-2" />
              dreamers@idebaterwanda.org
            </a>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">{t('howItWorks', language)}</h3>
            <ol className="text-gray-300 space-y-2">
              <li>{t('step1', language)}</li>
              <li>{t('step2', language)}</li>
              <li>{t('step3', language)}</li>
              <li>{t('step4', language)}</li>
            </ol>
          </div>
        </div>
        
        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-5 h-5 mr-2" style={{ color: '#eb754f' }} />
            <span className="text-gray-300">{t('poweredBy', language)}</span>
          </div>
          <p className="font-medium text-2xl mb-2" style={{ color: '#f4be68' }}>
            {t('motto', language)}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {t('copyright', language)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;