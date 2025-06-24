import React, { useState } from 'react';
import { X, Vote, Check, User, Award, BarChart3 } from 'lucide-react';
import { useVoting } from '../hooks/useVoting';
import { useLanguage } from '../hooks/useLanguage';
import { Category } from '../hooks/useCategories';
import { t } from '../utils/translations';

interface VotingModalProps {
  category: {
    id: string;
    title: string;
    icon: string;
    description: string;
    nominees: string[];
    isAward?: boolean;
  };
  categoryData?: Category;
  isOpen: boolean;
  onClose: () => void;
  onVote: (categoryId: string, nominee: string) => void;
  hasVoted: boolean;
  userVote?: string;
}

const VotingModal: React.FC<VotingModalProps> = ({
  category,
  categoryData,
  isOpen,
  onClose,
  onVote,
  hasVoted,
  userVote
}) => {
  const [selectedNominee, setSelectedNominee] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getVoteCount, getTotalCategoryVotes } = useVoting();
  const { language } = useLanguage();

  const handleSubmit = async () => {
    if (!selectedNominee) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    onVote(category.id, selectedNominee);
    setIsSubmitting(false);
    setSelectedNominee('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #eb754f, #f4be68)',
      'linear-gradient(135deg, #a16333, #eb754f)',
      'linear-gradient(135deg, #f4be68, #a16333)',
      'linear-gradient(135deg, #eb754f, #a16333)',
      'linear-gradient(135deg, #a16333, #f4be68)',
    ];
    return gradients[index % gradients.length];
  };

  const getNomineePhoto = (nomineeName: string) => {
    if (!categoryData) return null;
    const nominee = categoryData.nominees.find(n => 
      (typeof n === 'string' ? n : n.name) === nomineeName
    );
    return nominee && typeof nominee !== 'string' ? nominee.photo : null;
  };

  if (!isOpen) return null;

  // Special handling for award categories
  if (category.isAward) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  {category.icon} {category.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{category.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center py-12">
              <Award className="w-20 h-20 mx-auto mb-6" style={{ color: '#f4be68' }} />
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                {t('specialRecognitionAward', language)}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 transition-colors duration-300">
                {t('lifetimeAchievement', language)}
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800 transition-colors duration-300">
                <p className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300">
                  {t('surpriseRecognition', language)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = getTotalCategoryVotes(category.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {category.icon} {category.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{category.description}</p>
              {totalVotes > 0 && (
                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>{totalVotes} {t('totalVotesCast', language)}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {hasVoted ? (
            <div className="text-center py-8">
              <Check className="w-16 h-16 mx-auto mb-4" style={{ color: '#a16333' }} />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {t('voteSuccessTitle', language)}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {t('youVotedFor', language)} <span className="font-medium">{userVote}</span>
              </p>
            </div>
          ) : (
            <>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                {t('selectChoice', language)}
              </h4>
              <div className="grid gap-4">
                {category.nominees.map((nominee, index) => {
                  const voteCount = getVoteCount(category.id, nominee);
                  const votePercentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  const nomineePhoto = getNomineePhoto(nominee);
                  
                  return (
                    <label
                      key={index}
                      className={`block border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedNominee === nominee
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={selectedNominee === nominee ? {
                        borderColor: '#eb754f',
                        backgroundColor: language === 'en' ? '#fff7ed' : '#fff7ed'
                      } : {}}
                    >
                      <input
                        type="radio"
                        name="nominee"
                        value={nominee}
                        checked={selectedNominee === nominee}
                        onChange={(e) => setSelectedNominee(e.target.value)}
                        className="sr-only"
                      />
                      <div className="p-4">
                        <div className="flex items-center gap-4 mb-3">
                          {/* Photo Section */}
                          <div className="flex-shrink-0">
                            {nomineePhoto ? (
                              <img 
                                src={nomineePhoto}
                                alt={nominee}
                                className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-gray-200 dark:border-gray-600"
                              />
                            ) : (
                              <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-gray-200 dark:border-gray-600"
                                style={{ background: getRandomGradient(index) }}
                              >
                                {getInitials(nominee)}
                              </div>
                            )}
                          </div>
                          
                          {/* Nominee Info */}
                          <div className="flex-grow">
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                              {nominee}
                            </h5>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              <User className="w-4 h-4 mr-1" />
                              <span>{t('nominee', language)}</span>
                            </div>
                          </div>
                          
                          {/* Vote Count & Selection Indicator */}
                          <div className="flex-shrink-0 text-right">
                            {voteCount > 0 && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">
                                {voteCount} {voteCount === 1 ? t('vote', language) : t('votes', language)} ({votePercentage.toFixed(1)}%)
                              </div>
                            )}
                            {selectedNominee === nominee && (
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#eb754f' }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Vote Progress Bar */}
                        {totalVotes > 0 && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${votePercentage}%`,
                                background: 'linear-gradient(to right, #eb754f, #f4be68)'
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel', language)}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedNominee || isSubmitting}
                  className="px-6 py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(to right, #eb754f, #f4be68)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('submitting', language)}
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4" />
                      {t('submitVote', language)}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingModal;