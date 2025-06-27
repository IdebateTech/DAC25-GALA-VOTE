import React, { useState } from 'react';
import { X, Vote, Check, User, Award, BarChart3 } from 'lucide-react';
import { useVoting } from '../hooks/useApi';
import { Category } from '../services/api';

interface VotingModalProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onVote: (categoryId: string, nomineeId: number) => void;
  hasVoted: boolean;
  userVote?: string;
}

const VotingModal: React.FC<VotingModalProps> = ({
  category,
  isOpen,
  onClose,
  onVote,
  hasVoted,
  userVote
}) => {
  const [selectedNomineeId, setSelectedNomineeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getTotalCategoryVotes } = useVoting();

  const handleSubmit = async () => {
    if (!selectedNomineeId) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    onVote(category.id, selectedNomineeId);
    setIsSubmitting(false);
    setSelectedNomineeId(null);
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

  if (!isOpen) return null;

  // Special handling for award categories
  if (category.is_award) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {category.icon} {category.title}
                </h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center py-12">
              <Award className="w-20 h-20 mx-auto mb-6" style={{ color: '#f4be68' }} />
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                Special Recognition Award
              </h4>
              <p className="text-gray-600 text-lg mb-6">
                This is a special lifetime achievement award that will be presented during the gala ceremony.
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-200">
                <p className="text-gray-700 font-medium">
                  The recipient will be announced at the event as a surprise recognition for their outstanding contribution to Dreamers Academy Camp over the years.
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
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {category.icon} {category.title}
              </h3>
              <p className="text-gray-600">{category.description}</p>
              {totalVotes > 0 && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>{totalVotes} total votes cast</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {hasVoted ? (
            <div className="text-center py-8">
              <Check className="w-16 h-16 mx-auto mb-4" style={{ color: '#a16333' }} />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Vote Successfully Submitted!
              </h4>
              <p className="text-gray-600">
                You voted for <span className="font-medium">{userVote}</span>
              </p>
            </div>
          ) : (
            <>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Select your choice:
              </h4>
              <div className="grid gap-4">
                {category.nominees.map((nominee, index) => (
                  <label
                    key={nominee.id}
                    className={`block border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedNomineeId === nominee.id
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={selectedNomineeId === nominee.id ? {
                      borderColor: '#eb754f',
                      backgroundColor: '#fff7ed'
                    } : {}}
                  >
                    <input
                      type="radio"
                      name="nominee"
                      value={nominee.id}
                      checked={selectedNomineeId === nominee.id}
                      onChange={(e) => setSelectedNomineeId(parseInt(e.target.value))}
                      className="sr-only"
                    />
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        {/* Photo Section */}
                        <div className="flex-shrink-0">
                          {nominee.photo_url ? (
                            <img 
                              src={`http://localhost:3001${nominee.photo_url}`}
                              alt={nominee.name}
                              className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-gray-200"
                            />
                          ) : (
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-gray-200"
                              style={{ background: getRandomGradient(index) }}
                            >
                              {getInitials(nominee.name)}
                            </div>
                          )}
                        </div>
                        
                        {/* Nominee Info */}
                        <div className="flex-grow">
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">
                            {nominee.name}
                          </h5>
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="w-4 h-4 mr-1" />
                            <span>Nominee</span>
                          </div>
                          {nominee.description && (
                            <p className="text-sm text-gray-600 mt-1">{nominee.description}</p>
                          )}
                        </div>
                        
                        {/* Selection Indicator */}
                        <div className="flex-shrink-0">
                          {selectedNomineeId === nominee.id && (
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#eb754f' }}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedNomineeId || isSubmitting}
                  className="px-6 py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(to right, #eb754f, #f4be68)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4" />
                      Submit Vote
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