import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  nominees: Array<{
    name: string;
    photo?: string;
  }>;
  isAward?: boolean;
}

// Convert existing categories to new format
const convertCategories = (oldCategories: any[]): Category[] => {
  return oldCategories.map(cat => ({
    ...cat,
    nominees: cat.nominees.map((nominee: string | { name: string; photo?: string }) => 
      typeof nominee === 'string' ? { name: nominee, photo: undefined } : nominee
    )
  }));
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Load categories from localStorage or use defaults
    const savedCategories = localStorage.getItem('dreamers-categories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed);
      } catch (error) {
        console.error('Error parsing saved categories:', error);
        loadDefaultCategories();
      }
    } else {
      loadDefaultCategories();
    }
  }, []);

  const loadDefaultCategories = async () => {
    const { categories: defaultCategories } = await import('../data/categories');
    const converted = convertCategories(defaultCategories);
    setCategories(converted);
    localStorage.setItem('dreamers-categories', JSON.stringify(converted));
  };

  const updateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('dreamers-categories', JSON.stringify(newCategories));
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
      detail: newCategories 
    }));
  };

  const addNominee = (categoryId: string, nominee: { name: string; photo?: string }) => {
    const newCategories = categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, nominees: [...cat.nominees, nominee] }
        : cat
    );
    updateCategories(newCategories);
  };

  const removeNominee = (categoryId: string, nomineeIndex: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    const nominee = category?.nominees[nomineeIndex];
    const nomineeName = nominee?.name;

    const newCategories = categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, nominees: cat.nominees.filter((_, index) => index !== nomineeIndex) }
        : cat
    );
    updateCategories(newCategories);

    // Clean up votes for this nominee
    if (nomineeName) {
      // Get current vote stats and clean them up
      const savedStats = localStorage.getItem('dreamers-academy-vote-stats');
      if (savedStats) {
        const voteStats = JSON.parse(savedStats);
        if (voteStats[categoryId] && voteStats[categoryId][nomineeName]) {
          delete voteStats[categoryId][nomineeName];
          localStorage.setItem('dreamers-academy-vote-stats', JSON.stringify(voteStats));
        }
      }

      // Clean up user votes
      const savedVotes = localStorage.getItem('dreamers-academy-votes');
      if (savedVotes) {
        const userVotes = JSON.parse(savedVotes);
        if (userVotes[categoryId] === nomineeName) {
          delete userVotes[categoryId];
          localStorage.setItem('dreamers-academy-votes', JSON.stringify(userVotes));
        }
      }
    }
  };

  const updateNomineePhoto = (categoryId: string, nomineeIndex: number, photo: string) => {
    const newCategories = categories.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            nominees: cat.nominees.map((nominee, index) => 
              index === nomineeIndex ? { ...nominee, photo: photo || undefined } : nominee
            )
          }
        : cat
    );
    updateCategories(newCategories);
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    const newCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    updateCategories(newCategories);
  };

  return {
    categories,
    addNominee,
    removeNominee,
    updateNomineePhoto,
    updateCategory,
    updateCategories
  };
};