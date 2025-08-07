import React, { useState, useEffect } from 'react';

function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);

  // Generate random stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 4
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoHome = () => {
    // In a real app, this would navigate to home
    window.history.back();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
        ))}
      </div>

      {/* Floating planets */}
      <div 
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-60 animate-bounce"
        style={{
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
          animationDuration: '6s'
        }}
      />
      <div 
        className="absolute top-40 right-32 w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 opacity-50 animate-bounce"
        style={{
          transform: `translate(-${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
          animationDelay: '2s',
          animationDuration: '8s'
        }}
      />
      <div 
        className="absolute bottom-32 left-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 opacity-40 animate-bounce"
        style={{
          transform: `translate(${mousePosition.x * 0.04}px, -${mousePosition.y * 0.04}px)`,
          animationDelay: '4s',
          animationDuration: '7s'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Astronaut floating animation */}
        <div className="mb-8 relative">
          <div className="text-8xl animate-bounce" style={{ animationDuration: '3s' }}>
            🚀
          </div>
          <div className="absolute -top-4 -right-4 text-2xl animate-spin" style={{ animationDuration: '4s' }}>
            ✨
          </div>
        </div>

        {/* 404 with glowing effect */}
        <div className="relative mb-6">
          <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-extrabold text-white opacity-10 blur-xl">
            404
          </div>
        </div>

        {/* Main message */}
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
          Thamer x Mustafa, we have a problem!
        </h2>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed animate-fade-in-delay">
          The page you're looking for has drifted into deep space. 
          Don't worry, our rescue mission is ready to take you back home!
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
          <button
            onClick={handleGoHome}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 focus:outline-none focus:ring-4 focus:ring-cyan-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              🏠 Return to Earth
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              🔄 Try Again
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Fun fact */}
        <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-md animate-fade-in-delay-3">
          <p className="text-sm text-gray-300">
            <span className="text-yellow-400">💡 Fun Fact:</span> The first 404 error was at CERN in 1992. 
            Now you're part of internet history!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.6s both;
        }
        .animate-fade-in-delay-3 {
          animation: fade-in 1s ease-out 0.9s both;
        }
      `}</style>
    </div>
  );
}

export default NotFound;