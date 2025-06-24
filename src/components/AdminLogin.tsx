import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../utils/translations';

interface AdminLoginProps {
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t('enterBothFields', language));
      return;
    }

    const success = await login(username, password);
    
    if (success) {
      onClose();
    } else {
      setError(t('invalidCredentials', language));
      setPassword(''); // Clear password on failed attempt
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-3 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center transition-colors duration-300">
            {t('adminAccess', language)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mt-2 transition-colors duration-300">
            {t('adminCredentials', language)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 transition-colors duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                {t('username', language)}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                  placeholder={t('enterUsername', language)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                {t('password', language)}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                  placeholder={t('enterPassword', language)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              {t('cancel', language)}
            </button>
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('authenticating', language)}...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {t('login', language)}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="px-6 pb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors duration-300">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {t('adminFeatures', language)}
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 transition-colors duration-300">
              <li>{t('feature1', language)}</li>
              <li>{t('feature2', language)}</li>
              <li>{t('feature3', language)}</li>
              <li>{t('feature4', language)}</li>
              <li>{t('feature5', language)}</li>
              <li>{t('feature6', language)}</li>
              <li>{t('feature7', language)}</li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 transition-colors duration-300">
              {t('sessionExpires', language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;