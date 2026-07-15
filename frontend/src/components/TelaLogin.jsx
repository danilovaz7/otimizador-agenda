import React, { useState } from 'react';
import axios from 'axios';

function TelaLogin({ aoLogar }) {
  const [ehModoLogin, setEhModoLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const lidarComSubmissao = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      if (ehModoLogin) {
        const response = await axios.post('http://localhost:3000/auth/login', { email, senha });
        
        // Salva as credenciais recebidas do back-end
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        
        // Atualiza o estado global no App.jsx para renderizar a Home na hora
        aoLogar(response.data.usuario);
      } else {
        await axios.post('http://localhost:3000/auth/registrar', { nome, email, senha });
        
        setSucesso('Conta criada com sucesso! Faça seu login abaixo.');
        setEhModoLogin(true);
        
        setNome('');
        setSenha('');
      }
    } catch (err) {
      setErro(err.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const alternarModo = () => {
    setEhModoLogin(!ehModoLogin);
    setErro('');
    setSucesso('');
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md bg-[#0f1524]/90 border border-gray-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-xl transition-all">
        
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-blue-500 tracking-widest uppercase">Arrumador de Agenda</span>
          <h2 className="text-2xl font-black text-white mt-1">
            {ehModoLogin ? 'Acesse sua Conta' : 'Crie sua Conta'}
          </h2>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-3 rounded-xl mb-4 text-center">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold p-3 rounded-xl mb-4 text-center">
            {sucesso}
          </div>
        )}

        <form onSubmit={lidarComSubmissao} className="space-y-4 text-sm">
          {!ehModoLogin && (
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Nome Completo</label>
              <input type="text" required disabled={carregando} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full bg-[#131a2e] border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white outline-none disabled:opacity-50" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold">E-mail</label>
            <input type="email" required disabled={carregando} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-[#131a2e] border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white outline-none disabled:opacity-50" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold">Senha</label>
            <input type="password" required disabled={carregando} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#131a2e] border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white outline-none disabled:opacity-50" />
          </div>

          <button type="submit" disabled={carregando} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2 flex items-center justify-center">
            {carregando ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando...
              </span>
            ) : (
              ehModoLogin ? 'Entrar no App' : 'Cadastrar Conta'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button type="button" onClick={alternarModo} disabled={carregando} className="text-xs text-gray-400 hover:text-blue-400 font-medium transition-colors cursor-pointer disabled:opacity-50">
            {ehModoLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre por aqui'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TelaLogin;