
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9.93 2.23 12 7l2.07-4.77m-2.07 19.54V17m0-14.77L9.93 2.23M12 17l-2.07 4.77m0-19.54L7.86 6.14M12 17l2.07 4.77m0-19.54L16.14 6.14m-10.28.16L2.23 9.93 6.3 12l-4.07 2.07 3.64 3.64L6.3 12l5.7 5.7M6.14 7.86 2.23 9.93m19.54 2.07-3.93-2.07L14.14 6.3l3.93-3.93 3.64 3.64-3.93 3.93 3.93 3.93-3.64 3.64-3.93-3.93-3.93 3.93 3.64 3.64 3.93-3.93Z"/>
  </svg>
);

export default SparklesIcon;
