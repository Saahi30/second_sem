import React, { useState } from 'react';
import SplashScreen from './SplashScreen';

const AuthPage: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    color: '#fff',
    flexDirection: 'column',
  }}>
    <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '1rem' }}>Sign In / Sign Up</h2>
    <p style={{ opacity: 0.7 }}>Auth page coming soon...</p>
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return showSplash ? (
    <SplashScreen onComplete={() => setShowSplash(false)} />
  ) : (
    <AuthPage />
  );
};

export default App;
