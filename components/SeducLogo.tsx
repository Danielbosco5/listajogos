import React from 'react';

const SeducLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    viewBox="0 0 500 100" 
    xmlns="http://www.w3.org/2000/svg" 
    role="img"
    aria-label="Logo do Governo de Goiás e Secretaria de Estado da Educação"
    >
    <style>
      {`
        .logo-text-main { font-family: Inter, sans-serif; font-weight: 800; fill: #1e8944; }
        .logo-text-sub { font-family: Inter, sans-serif; font-weight: 600; fill: #1e8944; }
      `}
    </style>
    
    {/* Flag of Goiás (simplified) */}
    <g transform="translate(10, 25)">
      <rect x="0" y="0" width="60" height="5" fill="#fdd900" />
      <rect x="0" y="5" width="60" height="5" fill="#009739" />
      <rect x="0" y="10" width="60" height="5" fill="#fdd900" />
      <rect x="0" y="15" width="60" height="5" fill="#009739" />
      <rect x="0" y="20" width="60" height="5" fill="#fdd900" />
      <rect x="0" y="25" width="60" height="5" fill="#009739" />
      <rect x="0" y="30" width="60" height="5" fill="#fdd900" />
      <rect x="0" y="35" width="60" height="5" fill="#009739" />

      {/* Blue canton */}
      <rect x="0" y="0" width="30" height="20" fill="#0033a0" />
      {/* Stars (very simplified representation of the Southern Cross) */}
      <circle cx="15" cy="4" r="1.2" fill="white" />
      <circle cx="15" cy="16" r="1.5" fill="white" />
      <circle cx="23"cy="10" r="1.3" fill="white" />
      <circle cx="7" cy="10" r="1.4" fill="white" />
      <circle cx="21" cy="15" r="1" fill="white" />
    </g>

    {/* Main Text: Governo de Goiás */}
    <text x="80" y="20" className="logo-text-sub" fontSize="12">GOVERNO DE</text>
    <text x="80" y="60" className="logo-text-main" fontSize="48">GOIÁS</text>
    <text x="80" y="75" className="logo-text-sub" fontSize="10">O ESTADO QUE DÁ CERTO</text>
    
    {/* Separator Bars */}
    <rect x="290" y="25" width="4" height="50" fill="#f0e68c" />
    <rect x="300" y="25" width="4" height="50" fill="#e6f0e6" />

    {/* Seduc Text */}
    <g transform="translate(320, 40)">
      <text y="0" className="logo-text-sub" fontSize="12">SECRETARIA DE ESTADO</text>
      <text y="20" className="logo-text-sub" fontSize="12">DA EDUCAÇÃO</text>
    </g>
  </svg>
);

export default SeducLogo;
