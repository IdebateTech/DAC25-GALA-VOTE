import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-07-10T23:59:59').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-xl p-6 text-white text-center shadow-lg" style={{
      background: 'linear-gradient(to right, #eb754f, #f4be68)'
    }}>
      <div className="flex items-center justify-center mb-3">
        <Clock className="w-6 h-6 mr-2" />
        <h3 className="text-lg font-bold">Voting Ends In</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs uppercase tracking-wide">Days</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs uppercase tracking-wide">Hours</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs uppercase tracking-wide">Minutes</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs uppercase tracking-wide">Seconds</div>
        </div>
      </div>
      
      <p className="text-sm mt-4 opacity-90">
        July 10, 2025 at 11:59 PM
      </p>
    </div>
  );
};

export default CountdownTimer;