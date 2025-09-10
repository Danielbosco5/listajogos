import React from 'react';
import SeducLogo from './SeducLogo';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <div className="flex justify-center mb-6">
        <SeducLogo className="w-full max-w-md h-auto" />
      </div>
      <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl">
        Jogos Disponíveis <span className="text-teal-400">SEDUC GO</span>
      </h1>
      <p className="mt-3 text-lg text-slate-400">
        Reserve seu horário e adicione seu nome à lista
      </p>
    </header>
  );
};

export default Header;
