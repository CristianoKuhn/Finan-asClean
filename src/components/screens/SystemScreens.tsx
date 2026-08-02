/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  User, 
  Settings, 
  Database, 
  Info, 
  Bell, 
  Check, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  LogOut, 
  DollarSign, 
  Lock, 
  Globe, 
  Moon, 
  AlertTriangle,
  Github,
  Mail,
  Zap
} from 'lucide-react';

interface SystemScreensProps {
  currentScreen: 'perfil' | 'configuracoes' | 'backup' | 'sobre' | 'notificacoes';
  setScreen: (screen: any) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  onLogout: () => void;
  onResetDatabase: () => void;
  sheetsUrl?: string;
  setSheetsUrl?: (url: string) => void;
  isLoadingSheets?: boolean;
  syncFromSheets?: (url?: string) => Promise<void>;
  sheetsError?: string | null;
}

export function SystemScreens({
  currentScreen,
  setScreen,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  onLogout,
  onResetDatabase,
  sheetsUrl = '',
  setSheetsUrl,
  isLoadingSheets = false,
  syncFromSheets,
  sheetsError = null
}: SystemScreensProps) {
  // Local Settings form
  const [currency, setCurrency] = useState('BRL');
  const [securityLock, setSecurityLock] = useState(true);
  const [syncFreq, setSyncFreq] = useState('REALTIME');
  const [themeMode, setThemeMode] = useState('DARK');

  // Simulated notifications list with active triggers
  const [notifs, setNotifs] = useState([
    { id: 'nt_1', title: 'Planilha sincronizada', desc: 'Aba Lançamentos atualizada via API do Apps Script.', time: 'Há 5 minutos', read: false, type: 'SYNC' },
    { id: 'nt_2', title: 'Alerta de Orçamento', desc: 'A categoria Lazer ultrapassou 85% do orçamento limite planejado.', time: 'Há 2 horas', read: true, type: 'ALERT' },
    { id: 'nt_3', title: 'Fatura Vencendo amanhã', desc: 'A fatura do Nubank Ultravioleta fecha em 24h. Prepare o débito.', time: 'Há 1 dia', read: true, type: 'INVOICE' },
  ]);

  // Backups simulation logs
  const [backupLogs, setBackupLogs] = useState([
    { time: '2026-08-01 19:30', status: 'OK', rows: 84, msg: 'Exportação incremental via webhook concluída' },
    { time: '2026-08-01 12:00', status: 'OK', rows: 83, msg: 'Reserva Itaú balanceada com sucesso' },
    { time: '2026-08-01 09:00', status: 'OK', rows: 83, msg: 'Cópia automatizada em formato JSON salva no Drive' }
  ]);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Push individual simulated alert
  const handleTriggerMockNotif = () => {
    const fresh: any = {
      id: `nt_${Date.now()}`,
      title: 'Aporte de Teste Detectado',
      desc: 'Um lançamento de simulação foi sincronizado com sucesso nas suas planilhas.',
      time: 'Agora mesmo',
      read: false,
      type: 'SYNC'
    };
    setNotifs(prev => [fresh, ...prev]);
  };

  const handleSimulateSyncBackup = () => {
    setIsSyncingSheets(true);
    setTimeout(() => {
      setIsSyncingSheets(false);
      setBackupLogs(prev => [
        { 
          time: new Date().toISOString().replace('T', ' ').substring(0, 16), 
          status: 'OK', 
          rows: 85, 
          msg: 'Exportação manual forçada concluída com sucesso' 
        },
        ...prev
      ]);
    }, 1500);
  };

  // Delete notification
  const handleDeleteNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  // 1. SCREEN PERFIL
  if (currentScreen === 'perfil') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <span className="text-[9px] bg-teal-950 text-teal-400 border border-teal-900/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
              Premium Sovereign
            </span>
          </div>

          {/* Large user avatar display */}
          <div className="mx-auto w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center border-2 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
            <User className="w-10 h-10 text-teal-400" />
          </div>

          <div>
            <h3 className="font-bold text-lg text-white font-display">{userName}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{userEmail}</p>
          </div>

          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => setScreen('configuracoes')}
              className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Editar Perfil
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg text-xs font-semibold text-rose-300 transition-all cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Encerrar Sessão
            </button>
          </div>
        </div>

        {/* Technical integration diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Status de Integração Google</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-mono">Conexão Sheets</p>
              <p className="text-xs font-bold text-teal-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span> Sincronizado (Google API)
              </p>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-mono">Espaço de Armazenamento</p>
              <p className="text-xs font-bold text-white font-mono">DriveApp Ativo (65MB utilizados)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCREEN CONFIGURAÇÕES
  if (currentScreen === 'configuracoes') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Configurações Gerais do Sistema</h2>
          <p className="text-xs text-slate-400">Personalize a exibição do seu applet e preferências locais</p>
        </div>

        <div className="space-y-4">
          {/* UserName Input */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Nome de Exibição</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
            />
          </div>

          {/* UserEmail Input */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">E-mail Cadastrado</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Currency settings */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Moeda Principal
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
              >
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>

            {/* Language / Region */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Idioma / Região
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                disabled
              >
                <option value="PT">Português (Brasil)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 space-y-3.5">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Segurança e Sincronização</h4>

            <div className="flex items-center justify-between p-3 bg-slate-950/35 border border-slate-850 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  <Lock className="w-4 h-4 text-teal-400" /> Ativar Código de Acesso PIN
                </p>
                <p className="text-[10px] text-slate-500">Exige senha numérica para abrir o painel</p>
              </div>
              <input 
                type="checkbox" 
                checked={securityLock} 
                onChange={(e) => setSecurityLock(e.target.checked)}
                className="w-4 h-4 accent-teal-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/35 border border-slate-850 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  <Moon className="w-4 h-4 text-purple-400" /> Forçar Modo Noturno Nativo
                </p>
                <p className="text-[10px] text-slate-500">Mantém o layout em tons escuros e pretos OLED</p>
              </div>
              <input 
                type="checkbox" 
                checked={themeMode === 'DARK'} 
                onChange={() => setThemeMode(themeMode === 'DARK' ? 'LIGHT' : 'DARK')}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setScreen('perfil')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              setScreen('dashboard');
            }}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    );
  }

  // 3. SCREEN BACKUP
  if (currentScreen === 'backup') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Backups e Sincronização Google Sheets</h2>
          <p className="text-xs text-slate-400">Acesse seus registros brutos locais e force exportações em lote</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operations Center */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3.5">
              <h3 className="font-bold text-sm text-white font-display">Configuração do Google Apps Script</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integre seu aplicativo diretamente com a planilha do Google Sheets através do Web App URL fornecido. As transações adicionadas e modificadas são gravadas em tempo real!
              </p>

              {/* URL Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">URL do App da Web (Google Sheets API)</label>
                <input
                  type="text"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl?.(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-xs font-mono rounded-lg focus:outline-none focus:border-teal-500 text-teal-400"
                />
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-mono">Status da Sincronização</span>
                {sheetsError ? (
                  <p className="text-xs font-bold text-rose-400">
                    ⚠️ Erro de Sync: {sheetsError}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-teal-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse"></span> Conectado com Sucesso! (200 OK)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                disabled={isLoadingSheets}
                onClick={() => syncFromSheets?.()}
                className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {isLoadingSheets ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> Sincronizando Planilha...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Baixar Dados Atuais (Sync)
                  </>
                )}
              </button>

              <button
                onClick={onResetDatabase}
                className="px-3 py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                title="Resetar Banco"
              >
                Resetar Banco
              </button>
            </div>
          </div>

          {/* Sinc logs list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="font-bold text-sm text-white font-display">Histórico Recente de Webhooks</h3>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {backupLogs.map((log, index) => (
                <div key={index} className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1 text-[11px]">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="text-teal-400 font-bold bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-900/30">
                      {log.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200">{log.msg}</p>
                  <p className="text-[10px] text-slate-500">Linhas gravadas na planilha: {log.rows}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. SCREEN SOBRE
  if (currentScreen === 'sobre') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 shadow-md">
            <ShieldCheck className="w-8 h-8 text-teal-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Finanças Clean v1.4.0</h2>
            <p className="text-xs text-slate-400">Ecossistema Financeiro Pessoal Soberano e Criptografado</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            O <strong>Finanças Clean</strong> é uma plataforma moderna de controle de gastos, planejador de limites e gerenciador de investimentos premium estruturado sob o paradigma da <strong>Arquitetura Soberana</strong>.
          </p>
          
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 text-[11px]">
            <p className="font-bold text-white flex items-center gap-1 text-xs">
              <Zap className="w-4 h-4 text-teal-400" /> Benefícios da Tecnologia Serverless:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li><strong>Sem banco de dados intermediário:</strong> Os dados residem 100% de forma segura e offline no cache e nas tabelas da sua planilha Google pessoal.</li>
              <li><strong>Arquitetura sem servidor:</strong> O envio é criptografado ponto a ponto direto do FlutterFlow para o Google Sheets através de webhooks assinados.</li>
              <li><strong>Privacidade absoluta:</strong> Suas chaves de acesso e credenciais de bancos nunca passam por servidores de terceiros.</li>
            </ul>
          </div>

          <div className="flex justify-center gap-4 text-[11px] text-slate-500 pt-2 font-mono">
            <span>Desenvolvido com FlutterFlow & React</span>
            <span>•</span>
            <span>Versão: 1.4.0</span>
          </div>
        </div>

        <button
          onClick={() => setScreen('dashboard')}
          className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-lg text-xs cursor-pointer text-center"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // 5. SCREEN NOTIFICAÇÕES
  if (currentScreen === 'notificacoes') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-white font-display">Alertas e Notificações</h2>
            <p className="text-xs text-slate-400">Histórico de sincronização de dados e alertas de limites</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTriggerMockNotif}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded text-[10px] font-bold text-teal-400 cursor-pointer"
            >
              Simular Alerta
            </button>
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Marcar lidas
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-850">
          {notifs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-xs font-bold">Nenhum alerta pendente.</p>
              <p className="text-[10px]">Tudo limpo por aqui! Relatórios em dia.</p>
            </div>
          ) : (
            notifs.map(n => (
              <div key={n.id} className={`py-3.5 flex justify-between items-start gap-4 ${n.read ? 'opacity-60' : ''}`}>
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    n.type === 'SYNC' 
                      ? 'bg-teal-950/40 text-teal-400 border border-teal-900/40' 
                      : n.type === 'ALERT' 
                      ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' 
                      : 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {n.title}
                      {!n.read && (
                        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block" title="Não lida"></span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{n.desc}</p>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 inline-block">{n.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteNotif(n.id)}
                  className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded shrink-0 transition-colors cursor-pointer"
                  title="Excluir Alerta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
}
