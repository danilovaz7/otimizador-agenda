import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// COMPONENTE DE DROPDOWN CUSTOMIZADO (Sem a barra de rolagem feia)
function DropdownCustomizado({ valor, aoMudar, opcoes, largura = "w-36" }) {
  const [aberto, setAberto] = useState(false);
  const dropdownRef = useRef(null);

  const opcaoSelecionada = opcoes.find(o => o.valor === valor);

  useEffect(() => {
    function clicarFora(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', clicarFora);
    return () => document.removeEventListener('mousedown', clicarFora);
  }, []);

  return (
    <div className={`relative inline-block text-left ${largura}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between bg-[#131a2e] border border-gray-800/80 hover:border-gray-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-black text-gray-200 rounded-xl px-4 py-2.5 transition-all outline-none cursor-pointer shadow-inner"
      >
        <span>{opcaoSelecionada ? opcaoSelecionada.nome : 'Selecione'}</span>
        <svg 
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${aberto ? 'rotate-180 text-blue-400' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-full rounded-xl bg-[#0f1524] border border-gray-800/80 shadow-2xl z-50 py-1.5 overflow-y-auto backdrop-blur-xl animate-fadeIn [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {opcoes.map((op) => {
            const ehOAtual = op.valor === valor;
            return (
              <button
                key={op.valor}
                type="button"
                onClick={() => {
                  aoMudar(op.valor);
                  setAberto(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer
                  ${ehOAtual 
                    ? 'bg-blue-600/10 text-blue-400 font-black' 
                    : 'text-gray-300 hover:bg-[#1c243d] hover:text-white'
                  }`}
              >
                <span>{op.nome}</span>
                {ehOAtual && <span className="text-[10px]">●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarioHome({ usuario, aoDeslogar }) {
  const [tarefas, setTarefas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState('');
  
  // Controle de Abas Ativas: 'calendario' ou 'concluidas'
  const [abaAtiva, setAbaAtiva] = useState('calendario');

  // Seletores de Mês e Ano
  const dataAtual = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(dataAtual.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());

  // Estados do Formulário de Tarefa
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [carregandoTarefa, setCarregandoTarefa] = useState(false);

  // Estados do Formulário de Nova Categoria
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [corCategoria, setCorCategoria] = useState('#3b82f6');
  const [carregandoCategoria, setCarregandoCategoria] = useState(false);

  // Estados do PopUp/Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [diaModal, setDiaModal] = useState('');
  const [tarefasDoDiaModal, setTarefasDoDiaModal] = useState([]);

  // Estados de controle para o Reagendamento com Confirmação
  const [tarefaIdEmReagendamento, setTarefaIdEmReagendamento] = useState(null);
  const [novaDataPreSelecionada, setNovaDataPreSelecionada] = useState('');

  const meses = [
    { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' }, { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' }, { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
  ];

  const anos = Array.from({ length: 11 }, (_, i) => dataAtual.getFullYear() - 5 + i).map(a => ({ valor: a, nome: String(a) }));

  const buscarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [resTarefas, resCategorias] = await Promise.all([
        axios.get(`http://localhost:3000/tarefas?mes=${mesSelecionado}&ano=${anoSelecionado}`, { headers }),
        axios.get(`http://localhost:3000/categorias`, { headers })
      ]);

      setTarefas(resTarefas.data);
      setCategorias(resCategorias.data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao sincronizar informações com o servidor.');
    }
  };

  useEffect(() => {
    buscarDados();
  }, [mesSelecionado, anoSelecionado]);

  // Filtros em tempo de execução no front-end baseado no campo t.concluida
  const tarefasPendentes = tarefas.filter(t => !t.concluida || t.concluida === 0);
  const tarefasConcluidas = tarefas.filter(t => t.concluida === 1 || t.concluida === true);

  const recarregarTarefasDoDiaNoModal = (todasAsTarefas, dia) => {
    const dataString = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const filtradas = todasAsTarefas.filter(t => {
      const dataTarefa = new Date(t.data_vencimento).toISOString().split('T')[0];
      return dataTarefa === dataString && (!t.concluida || t.concluida === 0);
    });
    
    if (filtradas.length === 0) {
      setModalAberto(false);
    } else {
      setTarefasDoDiaModal(filtradas);
    }
  };

  const lidarCliqueNoDia = (dia) => {
    const dataString = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDataVencimento(dataString);

    // O clique no calendário só abre tarefas que ainda estão ativas (pendentes)
    const filtradas = tarefasPendentes.filter(t => {
      const dataTarefa = new Date(t.data_vencimento).toISOString().split('T')[0];
      return dataTarefa === dataString;
    });

    if (filtradas.length > 0) {
      setDiaModal(dia);
      setTarefasDoDiaModal(filtradas);
      setTarefaIdEmReagendamento(null);
      setNovaDataPreSelecionada('');
      setModalAberto(true);
    }
  };

  const lidarConcluirTarefa = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/tarefas/${id}/concluir`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`http://localhost:3000/tarefas?mes=${mesSelecionado}&ano=${anoSelecionado}`, { headers });
      setTarefas(res.data);
      
      recarregarTarefasDoDiaNoModal(res.data, diaModal);
    } catch (err) {
      console.error(err);
      setErro('Erro ao concluir a tarefa.');
    }
  };

  // NOVA FUNÇÃO DO FRONT-END PARA RETORNAR STATUS DA TAREFA
  const lidarDesconcluirTarefa = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/tarefas/${id}/desconcluir`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`http://localhost:3000/tarefas?mes=${mesSelecionado}&ano=${anoSelecionado}`, { headers });
      setTarefas(res.data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao reativar a tarefa.');
    }
  };

  const confirmarReagendamento = async (id) => {
    if (!novaDataPreSelecionada) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/tarefas/${id}/reagendar`, { nova_data: novaDataPreSelecionada }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`http://localhost:3000/tarefas?mes=${mesSelecionado}&ano=${anoSelecionado}`, { headers });
      setTarefas(res.data);

      setTarefaIdEmReagendamento(null);
      setNovaDataPreSelecionada('');

      recarregarTarefasDoDiaNoModal(res.data, diaModal);
    } catch (err) {
      console.error(err);
      setErro('Erro ao reagendar a tarefa.');
    }
  };

  const formatarDataBR = (dataString) => {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const lidarCriarTarefa = async (e) => {
    e.preventDefault();
    if (!dataVencimento) {
      setErro('Selecione um dia no calendário ou preencha o campo de data.');
      return;
    }
    setCarregandoTarefa(true);
    setErro('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/tarefas', {
        titulo,
        descricao,
        data_vencimento: dataVencimento,
        categoria_id: categoriaId || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTitulo('');
      setDescricao('');
      setCategoriaId('');
      
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`http://localhost:3000/tarefas?mes=${mesSelecionado}&ano=${anoSelecionado}`, { headers });
      setTarefas(res.data);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar tarefa.');
    } finally {
      setCarregandoTarefa(false);
    }
  };

  const lidarCriarCategoria = async (e) => {
    e.preventDefault();
    if (!nomeCategoria.trim()) return;
    setCarregandoCategoria(true);
    setErro('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/categorias', {
        nome: nomeCategoria,
        cor: corCategoria
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCategorias([...categorias, response.data]);
      setNomeCategoria('');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar categoria.');
    } finally {
      setCarregandoCategoria(false);
    }
  };

  const qteDiasNoMes = new Date(anoSelecionado, mesSelecionado, 0).getDate();
  const primeiroDiaSemana = new Date(anoSelecionado, mesSelecionado - 1, 1).getDay();
  
  const blocosCalendario = [];
  for (let i = 0; i < primeiroDiaSemana; i++) {
    blocosCalendario.push(<div key={`vazio-${i}`} className="bg-[#0b0f19]/30 border border-gray-900/20 min-h-[105px] rounded-xl"></div>);
  }

  for (let dia = 1; dia <= qteDiasNoMes; dia++) {
    const dataString = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    // Mapeia apenas as tarefas pendentes para a interface dos blocos
    const tarefasAtivasDoDia = tarefasPendentes.filter(t => {
      const dataTarefa = new Date(t.data_vencimento).toISOString().split('T')[0];
      return dataTarefa === dataString;
    });

    const categoriesAgrupadas = {};
    tarefasAtivasDoDia.forEach(t => {
      const chaveCat = t.categoria_id || 'sem_cat';
      if (!categoriesAgrupadas[chaveCat]) {
        categoriesAgrupadas[chaveCat] = {
          quantidade: 0,
          cor: t.categoria_cor || '#60a5fa',
          nome: t.categoria_nome || 'Sem categoria'
        };
      }
      categoriesAgrupadas[chaveCat].quantidade += 1;
    });

    const ehDiaSelecionado = dataVencimento === dataString;

    blocosCalendario.push(
      <div 
        key={`dia-${dia}`} 
        onClick={() => lidarCliqueNoDia(dia)}
        className={`bg-[#0f1524]/60 border-2 ${ehDiaSelecionado ? 'border-blue-500 bg-blue-600/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-gray-800/50 hover:border-gray-700/80'} p-3 min-h-[105px] rounded-xl flex flex-col justify-between transition-all cursor-pointer group active:scale-[0.98]`}
      >
        <div className="flex justify-between items-center">
          <span className={`text-xs font-black ${ehDiaSelecionado ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`}>
            {dia}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[60px] custom-scrollbar mt-2 pt-1">
          {Object.keys(categoriesAgrupadas).map(chave => {
            const grupo = categoriesAgrupadas[chave];
            return (
              <div 
                key={chave}
                style={{ 
                  borderColor: grupo.cor,
                  color: grupo.cor,
                  backgroundColor: `${grupo.cor}08`, 
                  boxShadow: `0 0 8px ${grupo.cor}12`
                }}
                className="h-5 min-w-[20px] px-1.5 border-2 rounded-full flex items-center justify-center text-[10px] font-black select-none tracking-wide"
                title={`${grupo.quantidade} tarefa(s) em: ${grupo.nome}`}
              >
                {grupo.quantidade}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const opcoesCategoriasDropdown = [
    { valor: '', nome: 'Sem categoria definida' },
    ...categorias.map(c => ({ valor: String(c.id), nome: c.nome }))
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-white font-sans antialiased p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1524]/40 border border-gray-800/40 p-6 rounded-2xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-lg shadow-lg">📅</div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Otimizador de Agenda</h1>
              <p className="text-xs text-gray-400">Painel de controle de <span className="text-blue-400 font-bold">{usuario?.nome || 'Usuário'}</span></p>
            </div>
          </div>
          <button onClick={aoDeslogar} className="w-full sm:w-auto bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Sair do App
          </button>
        </header>

        {erro && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-3 rounded-xl text-center">{erro}</div>}

        {/* NAVEGAÇÃO DE ABAS EXCLUSIVA */}
        <div className="flex p-1 bg-[#0f1524]/60 border border-gray-800/60 rounded-xl w-fit">
          <button 
            type="button"
            onClick={() => setAbaAtiva('calendario')}
            className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer flex items-center gap-2 ${abaAtiva === 'calendario' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15' : 'text-gray-400 hover:text-white'}`}
          >
            🗓️ Calendário Geral
          </button>
          <button 
            type="button"
            onClick={() => setAbaAtiva('concluidas')}
            className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer flex items-center gap-2 ${abaAtiva === 'concluidas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15' : 'text-gray-400 hover:text-white'}`}
          >
            ✅ Tarefas Concluídas 
            {tarefasConcluidas.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${abaAtiva === 'concluidas' ? 'bg-blue-700 text-white' : 'bg-[#1c243d] text-blue-400'}`}>
                {tarefasConcluidas.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CONTEÚDO MUTÁVEL CONFORME A ABA ATIVA */}
          <div className="lg:col-span-2 bg-[#0f1524]/80 border border-gray-800/60 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[525px]">
            
            {abaAtiva === 'calendario' ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span> Grade de Compromissos
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    <DropdownCustomizado valor={mesSelecionado} aoMudar={setMesSelecionado} opcoes={meses} largura="w-36" />
                    <DropdownCustomizado valor={anoSelecionado} aoMudar={setAnoSelecionado} opcoes={anos} largura="w-28" />
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-gray-500 tracking-wider border-b border-gray-800/60 pb-3 mb-3">
                  <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 flex-1">
                  {blocosCalendario}
                </div>
              </>
            ) : (
              /* ABA NOVA DE CONCLUÍDAS */
              <div className="flex-1 flex flex-col">
                <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h2 className="text-xs font-black text-white uppercase tracking-widest">📦 Histórico de Conclusão</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Veja tudo o que foi feito em {meses.find(m => m.valor === mesSelecionado)?.nome}.</p>
                  </div>
                  
                  {/* Mantém a troca de data acessível mesmo vendo as concluídas */}
                  <div className="flex items-center gap-2">
                    <DropdownCustomizado valor={mesSelecionado} aoMudar={setMesSelecionado} opcoes={meses} largura="w-36" />
                    <DropdownCustomizado valor={anoSelecionado} aoMudar={setAnoSelecionado} opcoes={anos} largura="w-28" />
                  </div>
                </div>

                {tarefasConcluidas.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-800/40 rounded-xl bg-[#0b0f19]/20">
                    <span className="text-2xl mb-2">🥂</span>
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider">Nada por aqui!</h3>
                    <p className="text-[11px] text-gray-500 max-w-xs mt-1">Nenhuma tarefa deste mês foi concluída até o momento.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {tarefasConcluidas.map(t => (
                      <div 
                        key={t.id} 
                        style={{ borderColor: t.categoria_cor ? `${t.categoria_cor}25` : '#3b82f620' }}
                        className="p-4 bg-[#111827]/40 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#111827]/80 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-gray-400 line-through tracking-wide">{t.titulo}</h4>
                            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Concluído</span>
                            {t.categoria_nome && (
                              <span style={{ color: t.categoria_cor, borderColor: `${t.categoria_cor}40` }} className="text-[9px] font-extrabold uppercase border px-1.5 py-0.2 rounded-md">
                                {t.categoria_nome}
                              </span>
                            )}
                          </div>
                          {t.descricao && <p className="text-[11px] text-gray-500 line-through font-medium">{t.descricao}</p>}
                          <p className="text-[10px] text-gray-600 font-bold">Data Planejada: {formatarDataBR(t.data_vencimento?.split('T')[0])}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => lidarDesconcluirTarefa(t.id)}
                          className="bg-gray-800/80 hover:bg-amber-600/10 border border-gray-700/60 hover:border-amber-500/30 text-gray-400 hover:text-amber-400 px-3 py-2 rounded-xl text-[10px] font-black tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 w-full sm:w-auto text-center"
                        >
                          ↩ Desfazer Ação
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* FORMULÁRIO */}
            <div className="bg-[#0f1524]/80 border border-gray-800/60 p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
              <h3 className="text-sm font-black text-gray-200 mb-4 uppercase tracking-wider border-b border-gray-800/60 pb-3 flex justify-between items-center">
                <span>✍️ Novo Compromisso</span>
                {dataVencimento && (
                  <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-black">
                    Dia {dataVencimento.split('-')[2]}
                  </span>
                )}
              </h3>
              
              <form onSubmit={lidarCriarTarefa} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">Título</label>
                  <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Reunião de Alinhamento" className="w-full bg-[#131a2e] border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-white outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">Data do Evento</label>
                  <input type="date" required value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="w-full bg-[#131a2e] border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-white outline-none transition-all cursor-pointer" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">Escolher Categoria</label>
                  <DropdownCustomizado valor={categoriaId} aoMudar={setCategoriaId} opcoes={opcoesCategoriasDropdown} largura="w-full" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold">Descrição (Opcional)</label>
                  <textarea rows="2" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes adicionais..." className="w-full bg-[#131a2e] border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-white outline-none resize-none transition-all" />
                </div>

                <button type="submit" disabled={carregandoTarefa} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50">
                  {carregandoTarefa ? 'Agendando...' : 'Confirmar Agenda'}
                </button>
              </form>
            </div>

            {/* SEÇÃO DE CATEGORIAS */}
            <div className="bg-[#0f1524]/80 border border-gray-800/60 p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
              <h3 className="text-sm font-black text-gray-200 mb-4 uppercase tracking-wider border-b border-gray-800/60 pb-3">
                🏷️ Suas Categorias
              </h3>

              <form onSubmit={lidarCriarCategoria} className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <input type="text" required value={nomeCategoria} onChange={(e) => setNomeCategoria(e.target.value)} placeholder="Nova tag (Ex: Trabalho)" className="flex-1 bg-[#131a2e] border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs rounded-xl px-3 py-2 text-white outline-none transition-all" />
                  <input type="color" value={corCategoria} onChange={(e) => setCorCategoria(e.target.value)} className="h-9 w-10 bg-[#131a2e] border border-gray-800 rounded-xl p-1 cursor-pointer outline-none" />
                  <button type="submit" disabled={carregandoCategoria} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 rounded-xl text-xs active:scale-95 transition-colors disabled:opacity-50">+</button>
                </div>
              </form>

              <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto custom-scrollbar">
                {categorias.map(cat => (
                  <span key={cat.id} style={{ backgroundColor: `${cat.cor}15`, borderColor: `${cat.cor}40`, color: cat.cor }} className="text-[10px] font-extrabold border px-2.5 py-1 rounded-full tracking-wide uppercase">
                    {cat.nome}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* POPUP MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#05070d]/80 backdrop-blur-sm" onClick={() => setModalAberto(false)}></div>
          
          <div className="relative bg-[#0f1524] border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col backdrop-blur-md">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-4">
              <div>
                <h4 className="text-base font-black tracking-tight text-white">Compromissos do Dia</h4>
                <p className="text-xs text-blue-400 font-bold">Dia {diaModal} de {meses.find(m => m.valor === mesSelecionado)?.nome}</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-gray-500 hover:text-white bg-gray-800/40 p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer">Fechar</button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
              {tarefasDoDiaModal.map(t => {
                const estaoReagendandoEsta = tarefaIdEmReagendamento === t.id;

                return (
                  <div key={t.id} style={{ borderColor: t.categoria_cor ? `${t.categoria_cor}40` : '#3b82f630' }} className="p-4 bg-[#131a2e]/60 border rounded-xl space-y-3 transition-all hover:bg-[#131a2e]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h5 className="text-xs font-black text-white">{t.titulo}</h5>
                        {t.descricao && <p className="text-[11px] text-gray-400 mt-1 font-medium">{t.descricao}</p>}
                      </div>
                      {t.categoria_nome && (
                        <span style={{ backgroundColor: `${t.categoria_cor}15`, color: t.categoria_cor }} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md shrink-0">
                          {t.categoria_nome}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-800/50">
                      {!estaoReagendandoEsta ? (
                        <div className="flex items-center justify-between gap-3">
                          <button type="button" onClick={() => lidarConcluirTarefa(t.id)} className="flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex-1">✓ Concluir</button>
                          <button type="button" onClick={() => { setTarefaIdEmReagendamento(t.id); setNovaDataPreSelecionada(''); }} className="flex items-center justify-center gap-1 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/20 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex-1">📅 Mover Dia</button>
                        </div>
                      ) : (
                        <div className="bg-[#0b0f19] p-3 rounded-xl border border-gray-800/80 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-gray-400 font-bold">Nova data:</span>
                            <input type="date" value={novaDataPreSelecionada} onChange={(e) => setNovaDataPreSelecionada(e.target.value)} className="bg-[#131a2e] border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-[10px] text-white p-1.5 outline-none transition-all cursor-pointer" />
                          </div>

                          {novaDataPreSelecionada && (
                            <div className="space-y-2 pt-1 border-t border-gray-800/60">
                              <p className="text-[10px] text-amber-400 font-medium text-center">Mover para <strong>{formatarDataBR(novaDataPreSelecionada)}</strong>?</p>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => confirmarReagendamento(t.id)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black px-2.5 py-1.5 rounded-md flex-1 transition-colors cursor-pointer">Sim, Confirmar</button>
                                <button type="button" onClick={() => { setTarefaIdEmReagendamento(null); setNovaDataPreSelecionada(''); }} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold px-2.5 py-1.5 rounded-md flex-1 transition-colors cursor-pointer">Cancelar</button>
                              </div>
                            </div>
                          )}
                          {!novaDataPreSelecionada && <div className="text-center"><button type="button" onClick={() => setTarefaIdEmReagendamento(null)} className="text-[9px] text-gray-500 hover:text-gray-300 underline font-semibold">Voltar</button></div>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CalendarioHome;