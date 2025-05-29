import React, { useState, useEffect, FC } from "react";
import TiltedCard from "./TiltedCard";

const ComingSoonDemo: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const darkMode = mediaQuery.matches;
      setIsDarkMode(darkMode);
      document.documentElement.classList.toggle('dark', darkMode);
    };
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const overlayContentJsx = (
    <div className="tilted-card-overlay-content">
      <p className="tilted-card-overlay-title">SPACE TRACKER</p>
      <p className="tilted-card-overlay-subtitle">Coming Soon</p>
    </div>
  );

  return (
    <div className={`coming-soon-demo${isDarkMode ? ' dark' : ''}`}>
      <TiltedCard
        imageSrc="https://www.nasa.gov/wp-content/uploads/2023/04/nasa-logo-web-rgb.png"
        altText="SPACE TRACKER-Coming Soon"
        captionText="SPACE TRACKER-Coming Soon"
        containerHeight="300px"
        containerWidth="300px"
        imageHeight="100%"
        imageWidth="100%"
        rotateAmplitude={12}
        scaleOnHover={1.15}
        showMobileWarning={false}
        showTooltip={true}
        displayOverlayContent={true}
        overlayContent={overlayContentJsx}
        tooltipClassName="tilted-card-tooltip-theme"
      />
      <p className="coming-soon-demo-text">Hover over the card.</p>
    </div>
  );
};

export default ComingSoonDemo; 