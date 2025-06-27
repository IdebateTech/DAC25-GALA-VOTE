import React, { useState, useEffect, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import CategoryCard from './components/CategoryCard';
import VotingModal from './components/VotingModal';
import CountdownTimer from './components/CountdownTimer';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import VoteStatsPanel from './components/VoteStatsPanel';
import { useCategories, useVoting } from './hooks/useApi';
import { useAuth } from './hooks/useAuth';
import socketService from './services/socket';
import { Trophy, Users, Award, Settings, BarChart3 } from 'lucide-react';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const { categories, loading: categoriesLoading } = useCategories();
  const { castVote, hasVoted, getUserVote, getTotalVotes, getTotalCategoryVotes } = useVoting();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleVote = async (categoryId: string, nomineeId: number) => {
    const success = await castVote(categoryId, nomineeId);
    if (success) {
      setSelectedCategory(null);
    }
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(true);
    } else {
      setShowLogin(true);
    }
  };

  const selectedCategoryData = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)
    : null;

  const votableCategories = categories.filter(cat => !cat.is_award);

  if (authLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <Header />
        
        {/* Admin Controls */}
        <div className="fixed top-4 right-4 z-40 flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Vote Statistics"
            aria-label="Vote Statistics"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={handleAdminClick}
            className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            title={isAuthenticated ? "Admin Panel" : "Admin Login"}
            aria-label={isAuthenticated ? "Admin Panel" : "Admin Login"}
          >
            <Settings className={`w-5 h-5 ${isAuthenticated ? 'text-green-600' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Vote Statistics Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Vote Statistics</h3>
                      <p className="text-sm text-gray-600">Complete voting analytics</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg p-1"
                    aria-label="Close statistics"
                  >
                    <Settings className="w-6 h-6 rotate-45" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <Suspense fallback={<div className="text-center py-8">Loading statistics...</div>}>
                  <VoteStatsPanel showExport={false} />
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login Modal */}
        {showLogin && (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminLogin onClose={() => setShowLogin(false)} />
          </Suspense>
        )}

        {/* Admin Panel */}
        {showAdmin && isAuthenticated && (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminPanel onClose={() => setShowAdmin(false)} />
          </Suspense>
        )}
        
        {/* Welcome Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to the Official Voting Platform
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              This special night is not only a reunion and a celebration — it's your chance to honor the legends, leaders, and unforgettable moments of the past decade. As we prepare to expand the Dream to Uganda or Juba in 2026, your vote helps recognize those who made this journey possible.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
              <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: '#f4be68' }} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{categories.length}</div>
              <div className="text-gray-600">Award Categories</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#eb754f' }} />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {categories.reduce((total, cat) => total + cat.nominees.length, 0)}
              </div>
              <div className="text-gray-600">Total Nominees</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
              <Award className="w-12 h-12 mx-auto mb-3" style={{ color: '#a16333' }} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{getTotalVotes()}</div>
              <div className="text-gray-600">Your Votes Cast</div>
            </div>
          </div>

          <CountdownTimer />
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              🏆 Award Categories
            </h2>
            <p className="text-lg text-gray-700">
              Click on each category to view nominees and submit your vote. Each participant can vote once per category.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => setSelectedCategory(category.id)}
                hasVoted={hasVoted(category.id)}
              />
            ))}
          </div>
        </section>

        {/* Voting Progress */}
        <section className="container mx-auto px-4 py-12">
          <div className="rounded-xl p-8 text-white text-center shadow-lg" style={{
            background: 'linear-gradient(to right, #eb754f, #a16333)'
          }}>
            <h3 className="text-2xl font-bold mb-4">Your Voting Progress</h3>
            <div className="mb-4">
              <div className="text-4xl font-bold mb-2">
                {getTotalVotes()} / {votableCategories.length}
              </div>
              <div className="text-lg opacity-90">Categories Completed</div>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${votableCategories.length > 0 ? (getTotalVotes() / votableCategories.length) * 100 : 0}%`,
                  backgroundColor: '#f4be68'
                }}
              ></div>
            </div>
            <p className="text-sm opacity-90">
              {getTotalVotes() === votableCategories.length 
                ? "🎉 Congratulations! You've voted in all categories!"
                : `${votableCategories.length - getTotalVotes()} categories remaining`
              }
            </p>
          </div>
        </section>

        <Footer />

        {/* Voting Modal */}
        {selectedCategoryData && (
          <Suspense fallback={<LoadingSpinner />}>
            <VotingModal
              category={selectedCategoryData}
              isOpen={!!selectedCategory}
              onClose={() => setSelectedCategory(null)}
              onVote={handleVote}
              hasVoted={hasVoted(selectedCategory!)}
              userVote={getUserVote(selectedCategory!)}
            />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;