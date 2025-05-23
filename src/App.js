import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import SplashScreen from './components/SplashScreen';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    console.log("Splash screen completed");
    setShowSplash(false);
  };

  return (
    <div className="App relative">
      {/* The chat interface is always rendered */}
      <ChatInterface />
      
      {/* The splash screen is conditionally rendered on top */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </div>
  );
}

export default App;
