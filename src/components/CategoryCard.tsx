import React from 'react';
import { ChevronRight, Check, Award } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../utils/translations';

interface CategoryCardProps {
  category: {
    id: string;
    title: string;
    icon: string;
    description: string;
    nominees: string[];
    isAward?: boolean;
  };
  onClick: () => void;
  hasVoted: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, hasVoted }) => {
  const { language } = useLanguage();

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl mb-2">{category.icon}</div>
          <div className="flex items-center gap-2">
            {category.isAward ? (
              <div className="text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{
                backgroundColor: '#f4be68'
              }}>
                <Award className="w-3 h-3" />
                {t('specialAward', language)}
              </div>
            ) : hasVoted ? (
              <div className="text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{
                backgroundColor: '#a16333'
              }}>
                <Check className="w-3 h-3" />
                {t('voted', language)}
              </div>
            ) : null}
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
          {category.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 transition-colors duration-300">
          {category.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {category.isAward ? t('specialAward', language) : `${category.nominees.length} ${t('nominees', language)}`}
          </span>
          <button className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90" style={{
            background: category.isAward 
              ? 'linear-gradient(to right, #f4be68, #eb754f)' 
              : 'linear-gradient(to right, #eb754f, #f4be68)'
          }}>
            {category.isAward 
              ? t('viewAward', language) 
              : hasVoted 
                ? t('viewVote', language) 
                : t('voteNow', language)
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;