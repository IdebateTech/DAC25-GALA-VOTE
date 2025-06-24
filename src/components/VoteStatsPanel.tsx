import React from 'react';
import { BarChart3, TrendingUp, Award, Users, Download } from 'lucide-react';
import { useVoting } from '../hooks/useVoting';
import { useCategories } from '../hooks/useCategories';

interface VoteStatsPanelProps {
  showExport?: boolean;
}

const VoteStatsPanel: React.FC<VoteStatsPanelProps> = ({ showExport = false }) => {
  const { voteStats, getTotalCategoryVotes } = useVoting();
  const { categories } = useCategories();

  const exportData = () => {
    const data = {
      categories,
      voteStats,
      exportDate: new Date().toISOString(),
      totalVotes: Object.values(voteStats).reduce((total, categoryStats) => {
        return total + Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
      }, 0)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamers-voting-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTopNominee = (categoryId: string) => {
    const categoryStats = voteStats[categoryId];
    if (!categoryStats) return null;
    
    let topNominee = '';
    let maxVotes = 0;
    
    Object.entries(categoryStats).forEach(([nominee, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        topNominee = nominee;
      }
    });
    
    return maxVotes > 0 ? { nominee: topNominee, votes: maxVotes } : null;
  };

  const getTotalSystemVotes = () => {
    return Object.values(voteStats).reduce((total, categoryStats) => {
      return total + Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
    }, 0);
  };

  const getVotingCategories = () => categories.filter(cat => !cat.isAward);
  const getSpecialAwards = () => categories.filter(cat => cat.isAward);

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xl font-semibold text-gray-900">Vote Statistics</h4>
          <p className="text-gray-600">Complete voting analytics for all categories</p>
        </div>
        {showExport && (
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        )}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Votes</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{getTotalSystemVotes()}</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Voting Categories</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{getVotingCategories().length}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Special Awards</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{getSpecialAwards().length}</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Active Categories</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {getVotingCategories().filter(cat => getTotalCategoryVotes(cat.id) > 0).length}
          </div>
        </div>
      </div>

      {/* Special Awards Section */}
      <div>
        <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Special Awards
        </h5>
        <div className="grid gap-4">
          {getSpecialAwards().map((category) => (
            <div key={category.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h6 className="font-semibold text-gray-900">{category.title}</h6>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                    Special Recognition - No Voting Required
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voting Categories with Analytics */}
      <div>
        <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Voting Categories & Results
        </h5>
        <div className="grid gap-6">
          {getVotingCategories().map((category) => {
            const totalVotes = getTotalCategoryVotes(category.id);
            const topNominee = getTopNominee(category.id);
            const nominees = category.nominees.map(n => typeof n === 'string' ? n : n.name);
            
            return (
              <div key={category.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h6 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      {category.title}
                    </h6>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-gray-700">
                        Total votes: <span className="text-blue-600">{totalVotes}</span>
                      </span>
                      <span className="text-gray-500">
                        Nominees: {nominees.length}
                      </span>
                    </div>
                  </div>
                  {topNominee && (
                    <div className="text-right bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">🏆 Leading:</p>
                      <p className="font-semibold text-orange-700">{topNominee.nominee}</p>
                      <p className="text-sm text-orange-600">{topNominee.votes} votes</p>
                    </div>
                  )}
                </div>
                
                {totalVotes > 0 && nominees.length > 0 ? (
                  <div className="space-y-3">
                    {nominees.map((nominee) => {
                      const votes = voteStats[category.id]?.[nominee] || 0;
                      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                      
                      return (
                        <div key={nominee} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{nominee}</span>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-gray-700">
                                {votes} vote{votes !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                background: 'linear-gradient(to right, #eb754f, #f4be68)'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    {nominees.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 font-medium">Awaiting Nominations</p>
                        <p className="text-yellow-600 text-sm mt-1">
                          No nominees have been added to this category yet
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-600 font-medium">No Votes Cast Yet</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Be the first to vote in this category!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VoteStatsPanel;