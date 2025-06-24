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
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import { useCategories } from './hooks/useCategories';
import { useVoting } from './hooks/useVoting';
import { useAuth } from './hooks/useAuth';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { optimizeLocalStorage } from './utils/performance';
import { Trophy, Users, Award, Settings, BarChart3 } from 'lucide-react';
import { t } from './utils/translations';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { categories } = useCategories();
  const { vote, hasVoted, getUserVote, getTotalVotes } = useVoting();
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();

  // Performance optimization: Clean up localStorage on app start
  useEffect(() => {
    optimizeLocalStorage();
  }, []);

  // Listen for category updates
  useEffect(() => {
    const handleCategoriesUpdate = () => {
      setSelectedCategory(null);
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
  }, []);

  // Preload critical resources
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const handleVote = (categoryId: string, nominee: string) => {
    vote(categoryId, nominee);
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

  const votableCategories = categories.filter(cat => !cat.isAward);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <Header />
        
        {/* Theme, Language & Admin Toggle */}
        <div className="fixed top-4 right-4 z-40 flex gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={t('voteStatistics', language)}
            aria-label={t('voteStatistics', language)}
          >
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={handleAdminClick}
            className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            title={isAuthenticated ? t('adminPanel', language) : t('adminLogin', language)}
            aria-label={isAuthenticated ? t('adminPanel', language) : t('adminLogin', language)}
          >
            <Settings className={`w-5 h-5 ${isAuthenticated ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
          </button>
        </div>

        {/* Vote Statistics Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('voteStatistics', language)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('completeVotingAnalytics', language)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg p-1"
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300 leading-tight">
              {t('welcomeTitle', language)}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
              {t('welcomeDescription', language)}
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
              <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: '#f4be68' }} />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{categories.length}</div>
              <div className="text-gray-600 dark:text-gray-400">{t('awardCategories', language)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#eb754f' }} />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {categories.reduce((total, cat) => total + cat.nominees.length, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{t('totalNominees', language)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
              <Award className="w-12 h-12 mx-auto mb-3" style={{ color: '#a16333' }} />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{getTotalVotes()}</div>
              <div className="text-gray-600 dark:text-gray-400">{t('yourVotesCast', language)}</div>
            </div>
          </div>

          <CountdownTimer />
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 leading-tight">
              {t('categoriesTitle', language)}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 transition-colors duration-300">
              {t('categoriesDescription', language)}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={{
                  ...category,
                  nominees: category.nominees.map(n => typeof n === 'string' ? n : n.name)
                }}
                onClick={() => setSelectedCategory(category.id)}
                hasVoted={hasVoted(category.id)}
              />
            ))}
          </div>
        </section>

        {/* Voting Progress */}
        <section className="container mx-auto px-4 py-12">
          <div className="rounded-xl p-8 text-white text-center transition-all duration-300 shadow-lg" style={{
            background: 'linear-gradient(to right, #eb754f, #a16333)'
          }}>
            <h3 className="text-2xl font-bold mb-4">{t('votingProgressTitle', language)}</h3>
            <div className="mb-4">
              <div className="text-4xl font-bold mb-2">
                {getTotalVotes()} / {votableCategories.length}
              </div>
              <div className="text-lg opacity-90">{t('categoriesCompleted', language)}</div>
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
                ? t('congratulations', language)
                : `${votableCategories.length - getTotalVotes()} ${t('categoriesRemaining', language)}`
              }
            </p>
          </div>
        </section>

        <Footer />

        {/* Voting Modal */}
        {selectedCategoryData && (
          <Suspense fallback={<LoadingSpinner />}>
            <VotingModal
              category={{
                ...selectedCategoryData,
                nominees: selectedCategoryData.nominees.map(n => typeof n === 'string' ? n : n.name)
              }}
              isOpen={!!selectedCategory}
              onClose={() => setSelectedCategory(null)}
              onVote={handleVote}
              hasVoted={hasVoted(selectedCategory!)}
              userVote={getUserVote(selectedCategory!)}
              categoryData={selectedCategoryData}
            />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;