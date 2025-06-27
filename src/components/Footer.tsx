import React from 'react';
import { Mail, Heart, Star } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" style={{ color: '#f4be68' }} />
              Questions?
            </h3>
            <p className="text-gray-300 mb-4">
              For any queries or nomination suggestions, reach out to us:
            </p>
            <a
              href="mailto:dreamers@idebaterwanda.org"
              className="flex items-center hover:opacity-80 transition-colors"
              style={{ color: '#eb754f' }}
            >
              <Mail className="w-4 h-4 mr-2" />
              dreamers@idebaterwanda.org
            </a>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">How It Works</h3>
            <ol className="text-gray-300 space-y-2">
              <li>1. Click on each category</li>
              <li>2. View the nominees</li>
              <li>3. Vote once per category</li>
              <li>4. Voting ends: July 10, 2025 at 11:59 PM</li>
            </ol>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-5 h-5 mr-2" style={{ color: '#eb754f' }} />
            <span className="text-gray-300">Powered by Dreamers Academy Camp</span>
          </div>
          <p className="font-medium text-2xl mb-2" style={{ color: '#f4be68' }}>
            "Glow up, Show up and Dream on!"
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © 2025 Dreamers Academy Camp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;