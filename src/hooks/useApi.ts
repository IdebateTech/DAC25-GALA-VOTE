import { useState, useEffect } from 'react';
import { categoriesApi, votingApi, Category, VoteStats } from '../services/api';
import socketService from '../services/socket';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getAll();
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Set up real-time listeners
    const handleCategoryCreated = (data: any) => {
      setCategories(prev => [...prev, { ...data, nominees: [] }]);
    };

    const handleCategoryUpdated = (data: any) => {
      setCategories(prev => prev.map(cat => 
        cat.id === data.id ? { ...cat, ...data } : cat
      ));
    };

    const handleCategoryDeleted = (data: any) => {
      setCategories(prev => prev.filter(cat => cat.id !== data.id));
    };

    const handleNomineeAdded = (data: any) => {
      setCategories(prev => prev.map(cat => 
        cat.id === data.category_id 
          ? { ...cat, nominees: [...cat.nominees, data] }
          : cat
      ));
    };

    const handleNomineeUpdated = (data: any) => {
      setCategories(prev => prev.map(cat => 
        cat.id === data.category_id 
          ? {
              ...cat,
              nominees: cat.nominees.map(nominee => 
                nominee.id === data.id ? { ...nominee, ...data } : nominee
              )
            }
          : cat
      ));
    };

    const handleNomineeDeleted = (data: any) => {
      setCategories(prev => prev.map(cat => 
        cat.id === data.category_id 
          ? {
              ...cat,
              nominees: cat.nominees.filter(nominee => nominee.id !== data.id)
            }
          : cat
      ));
    };

    const handleNomineePhotoUpdated = (data: any) => {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        nominees: cat.nominees.map(nominee => 
          nominee.id === data.nominee_id 
            ? { ...nominee, photo_url: data.photo_url }
            : nominee
        )
      })));
    };

    const handleNomineePhotoDeleted = (data: any) => {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        nominees: cat.nominees.map(nominee => 
          nominee.id === data.nominee_id 
            ? { ...nominee, photo_url: undefined }
            : nominee
        )
      })));
    };

    socketService.on('category-created', handleCategoryCreated);
    socketService.on('category-updated', handleCategoryUpdated);
    socketService.on('category-deleted', handleCategoryDeleted);
    socketService.on('nominee-added', handleNomineeAdded);
    socketService.on('nominee-updated', handleNomineeUpdated);
    socketService.on('nominee-deleted', handleNomineeDeleted);
    socketService.on('nominee-photo-updated', handleNomineePhotoUpdated);
    socketService.on('nominee-photo-deleted', handleNomineePhotoDeleted);

    return () => {
      socketService.off('category-created', handleCategoryCreated);
      socketService.off('category-updated', handleCategoryUpdated);
      socketService.off('category-deleted', handleCategoryDeleted);
      socketService.off('nominee-added', handleNomineeAdded);
      socketService.off('nominee-updated', handleNomineeUpdated);
      socketService.off('nominee-deleted', handleNomineeDeleted);
      socketService.off('nominee-photo-updated', handleNomineePhotoUpdated);
      socketService.off('nominee-photo-deleted', handleNomineePhotoDeleted);
    };
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export const useVoting = () => {
  const [userVotes, setUserVotes] = useState<{ [categoryId: string]: { nominee_id: number; nominee_name: string } }>({});
  const [voteStats, setVoteStats] = useState<VoteStats>({});
  const [loading, setLoading] = useState(false);

  const sessionId = getSessionId();

  const fetchUserVotes = async () => {
    try {
      const response = await votingApi.getUserVotes(sessionId);
      if (response.data.success) {
        setUserVotes(response.data.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch user votes:', error);
    }
  };

  const fetchVoteStats = async () => {
    try {
      const response = await votingApi.getStats();
      if (response.data.success) {
        setVoteStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch vote stats:', error);
    }
  };

  const castVote = async (categoryId: string, nomineeId: number) => {
    try {
      setLoading(true);
      const response = await votingApi.castVote(sessionId, categoryId, nomineeId);
      if (response.data.success) {
        // Update local state immediately
        setUserVotes(prev => ({
          ...prev,
          [categoryId]: { nominee_id: nomineeId, nominee_name: '' }
        }));
        
        // Refresh stats
        await fetchVoteStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to cast vote:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVotes();
    fetchVoteStats();

    // Set up real-time vote updates
    const handleVoteCast = () => {
      fetchVoteStats();
    };

    socketService.on('vote-cast', handleVoteCast);

    return () => {
      socketService.off('vote-cast', handleVoteCast);
    };
  }, [sessionId]);

  const hasVoted = (categoryId: string) => {
    return categoryId in userVotes;
  };

  const getUserVote = (categoryId: string) => {
    return userVotes[categoryId]?.nominee_name || '';
  };

  const getTotalVotes = () => {
    return Object.keys(userVotes).length;
  };

  const getVoteCount = (categoryId: string, nomineeName: string) => {
    const categoryStats = voteStats[categoryId];
    if (!categoryStats) return 0;
    
    const nominee = categoryStats.nominees.find(n => n.nominee_name === nomineeName);
    return nominee?.vote_count || 0;
  };

  const getTotalCategoryVotes = (categoryId: string) => {
    const categoryStats = voteStats[categoryId];
    if (!categoryStats) return 0;
    
    return categoryStats.nominees.reduce((total, nominee) => total + nominee.vote_count, 0);
  };

  return {
    userVotes,
    voteStats,
    loading,
    castVote,
    hasVoted,
    getUserVote,
    getTotalVotes,
    getVoteCount,
    getTotalCategoryVotes,
    refetchStats: fetchVoteStats
  };
};

// Helper function to get or create session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem('dreamers-session-id');
  if (!sessionId) {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('dreamers-session-id', sessionId);
  }
  return sessionId;
}