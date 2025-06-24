import { useState, useEffect } from 'react';

interface VoteData {
  [categoryId: string]: string;
}

interface VoteStats {
  [categoryId: string]: {
    [nominee: string]: number;
  };
}

export const useVoting = () => {
  const [votes, setVotes] = useState<VoteData>({});
  const [voteStats, setVoteStats] = useState<VoteStats>({});

  useEffect(() => {
    const savedVotes = localStorage.getItem('dreamers-academy-votes');
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }

    const savedStats = localStorage.getItem('dreamers-academy-vote-stats');
    if (savedStats) {
      setVoteStats(JSON.parse(savedStats));
    }

    // Listen for category updates to clean up votes for removed nominees
    const handleCategoriesUpdate = () => {
      const savedStats = localStorage.getItem('dreamers-academy-vote-stats');
      if (savedStats) {
        setVoteStats(JSON.parse(savedStats));
      }
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
  }, []);

  const vote = (categoryId: string, nominee: string) => {
    const newVotes = { ...votes, [categoryId]: nominee };
    setVotes(newVotes);
    localStorage.setItem('dreamers-academy-votes', JSON.stringify(newVotes));

    // Update vote statistics
    const newStats = { ...voteStats };
    if (!newStats[categoryId]) {
      newStats[categoryId] = {};
    }
    
    // Remove previous vote if exists
    const previousVote = votes[categoryId];
    if (previousVote && newStats[categoryId][previousVote]) {
      newStats[categoryId][previousVote] = Math.max(0, newStats[categoryId][previousVote] - 1);
    }
    
    // Add new vote
    if (!newStats[categoryId][nominee]) {
      newStats[categoryId][nominee] = 0;
    }
    newStats[categoryId][nominee] += 1;
    
    setVoteStats(newStats);
    localStorage.setItem('dreamers-academy-vote-stats', JSON.stringify(newStats));
  };

  const hasVoted = (categoryId: string) => {
    return categoryId in votes;
  };

  const getUserVote = (categoryId: string) => {
    return votes[categoryId];
  };

  const getTotalVotes = () => {
    return Object.keys(votes).length;
  };

  const getVoteCount = (categoryId: string, nominee: string) => {
    return voteStats[categoryId]?.[nominee] || 0;
  };

  const getTotalCategoryVotes = (categoryId: string) => {
    if (!voteStats[categoryId]) return 0;
    return Object.values(voteStats[categoryId]).reduce((sum, count) => sum + count, 0);
  };

  // Clean up votes for removed nominees
  const cleanupVotesForRemovedNominee = (categoryId: string, nomineeName: string) => {
    const newStats = { ...voteStats };
    if (newStats[categoryId] && newStats[categoryId][nomineeName]) {
      delete newStats[categoryId][nomineeName];
      setVoteStats(newStats);
      localStorage.setItem('dreamers-academy-vote-stats', JSON.stringify(newStats));
    }

    // Also remove user vote if they voted for this nominee
    if (votes[categoryId] === nomineeName) {
      const newVotes = { ...votes };
      delete newVotes[categoryId];
      setVotes(newVotes);
      localStorage.setItem('dreamers-academy-votes', JSON.stringify(newVotes));
    }
  };

  return {
    vote,
    hasVoted,
    getUserVote,
    getTotalVotes,
    getVoteCount,
    getTotalCategoryVotes,
    cleanupVotesForRemovedNominee,
    votes,
    voteStats
  };
};