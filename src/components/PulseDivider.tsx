import React from 'react';

export const PulseDivider: React.FC = () => {
  return (
    <svg className="w-full h-[26px] my-[22px] opacity-90 block" viewBox="0 0 1000 26" preserveAspectRatio="none">
      <path 
        d="M0,13 L400,13 L430,4 L460,22 L490,2 L520,13 L1000,13" 
        stroke="#C9FF3D" 
        strokeWidth="1.6" 
        fill="none" 
      />
    </svg>
  );
};
