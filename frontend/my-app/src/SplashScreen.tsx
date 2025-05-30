import React from 'react';
import Lottie from 'lottie-react';
import animationData from './assets/space-lottie.json'; // You will need to add a Lottie JSON file here

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      color: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{ width: '60vw', maxWidth: 400, minWidth: 200 }}>
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay
          style={{ width: '100%', height: 'auto' }}
          onComplete={onComplete}
        />
      </div>
      <h1 style={{ fontWeight: 700, fontSize: '2.5rem', marginTop: '2rem', letterSpacing: '0.05em', textAlign: 'center' }}>
        Space Calendar
      </h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.8, marginTop: '0.5rem', textAlign: 'center' }}>
        Launching soon...
      </p>
    </div>
  );
};

export default SplashScreen; 