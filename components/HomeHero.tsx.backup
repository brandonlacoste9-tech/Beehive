// components/HomeHero.tsx
'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';

// Custom hook for the countdown
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isCeremonyTime, setIsCeremonyTime] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsCeremonyTime(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeLeft, isCeremonyTime };
}

export default function HomeHero() {
  const { timeLeft, isCeremonyTime } = useCountdown("2025-12-01T00:00:00Z");
  const gradientId = useId();

  return (
    <header className="relative flex flex-col items-center justify-center min-h-screen text-white overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient
              id={gradientId}
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#0EA5E9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={url(#)} />
          <rect
            width="100%"
            height="100%"
            fill="transparent"
            className="animate-pulse-slow"
          />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4 tracking-tighter">
          The Swarm Awakens.
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-8">
          AdGenAI and BeeReel unite. A new era of creative intelligence is
          here. Witness the ceremony.
        </p>

        <div className="mb-8">
          {isCeremonyTime ? (
            <div className="text-3xl font-bold text-yellow-300 animate-pulse">
              The Ceremony is Now.
            </div>
          ) : (
            <div className="flex space-x-4 text-center">
              <div>
                <span className="text-4xl font-bold">{timeLeft.days}</span>
                <span className="block text-xs uppercase">Days</span>
              </div>
              <div>
                <span className="text-4xl font-bold">{timeLeft.hours}</span>
                <span className="block text-xs uppercase">Hours</span>
              </div>
              <div>
                <span className="text-4xl font-bold">{timeLeft.minutes}</span>
                <span className="block text-xs uppercase">Minutes</span>
              </div>
              <div>
                <span className="text-4xl font-bold">{timeLeft.seconds}</span>
                <span className="block text-xs uppercase">Seconds</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href="/get-started"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Join the Swarm
          </Link>
          <Link
            href="/showcase"
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            View the Showcase
          </Link>
        </div>
      </div>
    </header>
  );
}
