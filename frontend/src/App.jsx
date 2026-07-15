import React, { useState } from 'react';
import TelaLogin from './components/TelaLogin';
import CalendarioHome from './components/CalendarioHome';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const salvo = localStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  const deslogar = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuarioLogado(null);
  };

  return (
    <>
      {usuarioLogado ? (
        <CalendarioHome usuario={usuarioLogado} aoDeslogar={deslogar} />
      ) : (
        <TelaLogin aoLogar={setUsuarioLogado} />
      )}
    </>
  );
}

export default App;