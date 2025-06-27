import React from 'react';
import { Trophy, Calendar, MapPin } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-orange-900 via-orange-800 to-yellow-700 text-white" style={{
      background: 'linear-gradient(to right, #7c2d12, #9a3412, #a16333)'
    }}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-400 mr-3" style={{ color: '#f4be68' }} />
            <h1 className="text-4xl md:text-5xl font-bold">
              Dreamers Academy Camp
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: '#f4be68' }}>
            10th Year Celebration Gala
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-lg">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" style={{ color: '#f4be68' }} />
              <span>Inzozi Park, Kigali</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" style={{ color: '#f4be68' }} />
              <span>18 July 2025</span>
            </div>
          </div>
          <p className="mt-6 text-xl font-medium" style={{ color: '#f4be68' }}>
            🥂 For the dreamers, by the dreamers — Cast Your Vote!
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;