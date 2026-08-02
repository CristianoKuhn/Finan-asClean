/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Copy, 
  Check, 
  Play, 
  CheckCircle, 
  FileCode, 
  Compass, 
  Loader2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { APPS_SCRIPT_ENDPOINTS, APPS_SCRIPT_SOURCE_CODE } from '../data/appsScriptDocs';

interface ApiSimulatorProps {
  lastLoggedCall?: {
    endpoint: string;
    method: 'GET' | 'POST';
    payload?: string;
    response: string;
    technicalSteps: string[];
  };
}

export default function ApiSimulator({ lastLoggedCall }: ApiSimulatorProps) {
  const [selectedEndpointId, setSelectedEndpointId] = useState('get_dashboard');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [activeCodeTab, setActiveCodeTab] = useState<'main' | 'database' | 'services'>('main');

  const activeEndpoint = APPS_SCRIPT_ENDPOINTS.find(e => e.id === selectedEndpointId) || APPS_SCRIPT_ENDPOINTS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRunSimulation = () => {
    setTesting(true);
    setTerminalLogs([
      `[FLUTTERFLOW] 🚀 Iniciando requisição HTTP ${activeEndpoint.method} para URL do Apps Script`,
      `[NETWORK] Enviando headers: { "Content-Type": "application/json", "Authorization": "Bearer session_tkn_8c29bf7d10e" }`,
      `[NETWORK] Endpoint alvo: https://script.google.com/macros/s/AKfycbwwgo-_-H4eU97tS9vtl1N6E44kJ-DcKJoCXZCtOSX9gs48c5hnFv0XOT4gpxO9OTRs/exec${activeEndpoint.path}`
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        `[APPS SCRIPT] 📥 Requisição interceptada pelo método do${activeEndpoint.method === 'POST' ? 'Post' : 'Get'}(e)`,
        `[APPS SCRIPT] 🔑 Verificando cabeçalho de autenticação (Authorization Token)...`,
        `[APPS SCRIPT] 🔓 Token ativo pertencente a 'usr_f89b1c72' (Cristiano Kuhn). Permissão concedida.`,
        `[APPS SCRIPT] 🧭 Roteamento acionado: Direcionando fluxo de dados para a rota '${activeEndpoint.path}'`,
        `[APPS SCRIPT] ⚙️ Iniciando transação lógica no 'DatabaseContext'...`,
        `[APPS SCRIPT] 💾 Lendo planilhas de tabelas relacionadas...`,
        `[APPS SCRIPT] ✅ Executando validações de tipos na camada Validator...`,
        `[APPS SCRIPT] 🔄 Operação consolidada com sucesso no Sheets em 45ms.`,
        `[APPS SCRIPT] 📄 Registrando transação técnica na aba 'Logs' (INFO).`,
        `[NETWORK] 📤 Enviando resposta HTTP 200 OK no formato JSON`
      ]);
      setTestResult(JSON.parse(activeEndpoint.responseBody));
      setTesting(false);
    }, 1200);
  };

  // Sync to outer log triggers if user submits from dashboard
  const handleLoadLastDashboardLog = () => {
    if (!lastLoggedCall) return;
    setTerminalLogs(lastLoggedCall.technicalSteps);
    setTestResult(JSON.parse(lastLoggedCall.response));
    const matched = APPS_SCRIPT_ENDPOINTS.find(e => e.path === lastLoggedCall.endpoint);
    if (matched) setSelectedEndpointId(matched.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="api-simulator-section">
      
      {/* 1. Endpoints Selection Column (1/5 size) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:col-span-2 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Endpoints REST</h3>
              <p className="text-[10px] text-slate-400">Contratos da API no Apps Script</p>
            </div>
          </div>

          {lastLoggedCall && (
            <button
              onClick={handleLoadLastDashboardLog}
              className="text-[9px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold px-2 py-1 rounded flex items-center gap-1 hover:opacity-85"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> Log Recente (Dashboard)
            </button>
          )}
        </div>

        {/* List of endpoints */}
        <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
          {APPS_SCRIPT_ENDPOINTS.map(endpoint => (
            <button
              key={endpoint.id}
              onClick={() => {
                setSelectedEndpointId(endpoint.id);
                setTestResult(null);
                setTerminalLogs([]);
              }}
              id={`endpoint-nav-${endpoint.id}`}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                selectedEndpointId === endpoint.id
                  ? 'bg-slate-100 dark:bg-slate-800 border-l-2 border-teal-500 font-bold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                endpoint.method === 'POST'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
              }`}>
                {endpoint.method}
              </span>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-white font-mono truncate">{endpoint.path}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{endpoint.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. API Console Sandbox (3/5 size) */}
      <div className="lg:col-span-3 space-y-6">
        {/* Sandbox detail */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  activeEndpoint.method === 'POST' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50'
                }`}>
                  {activeEndpoint.method}
                </span>
                <h4 className="text-sm font-bold font-mono text-slate-800 dark:text-white">{activeEndpoint.path}</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeEndpoint.description}</p>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={testing}
              id="test-api-btn"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Testar Endpoint
            </button>
          </div>

          {/* Parameters matrix */}
          {activeEndpoint.parameters.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Parâmetros de Consulta (Query Params)</h5>
              <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2 px-3">Parâmetro</th>
                      <th className="py-2 px-3">Tipo</th>
                      <th className="py-2 px-3">Obriga.</th>
                      <th className="py-2 px-3">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {activeEndpoint.parameters.map(p => (
                      <tr key={p.name}>
                        <td className="py-2 px-3 font-mono font-bold">{p.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-400 text-[10px]">{p.type}</td>
                        <td className="py-2 px-3">
                          {p.required ? (
                            <span className="text-[9px] bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 px-1 rounded font-bold">Sim</span>
                          ) : (
                            <span className="text-[9px] bg-slate-50 text-slate-500 dark:bg-slate-800 px-1 rounded">Não</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payloads display (Request vs Response) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Request block */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Corpo de Envio (Request Body)
                </span>
                {activeEndpoint.requestBody && (
                  <button 
                    onClick={() => handleCopy(activeEndpoint.requestBody!, 'req_body')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded transition-colors"
                  >
                    {copiedText === 'req_body' ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-3 text-[11px] font-mono overflow-x-auto h-[180px] border border-slate-850">
                {activeEndpoint.requestBody ? (
                  <pre>{activeEndpoint.requestBody}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    Nenhum corpo de envio necessário para este GET
                  </div>
                )}
              </div>
            </div>

            {/* Response block */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-teal-500" /> Resposta da API (Response JSON)
                </span>
                {testResult && (
                  <button 
                    onClick={() => handleCopy(JSON.stringify(testResult, null, 2), 'res_body')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded transition-colors"
                  >
                    {copiedText === 'res_body' ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <div className="bg-slate-900 text-emerald-400 rounded-lg p-3 text-[11px] font-mono overflow-x-auto h-[180px] border border-slate-850">
                {testing ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                    <p className="text-[10px] animate-pulse">Aguardando Apps Script...</p>
                  </div>
                ) : testResult ? (
                  <pre>{JSON.stringify(testResult, null, 2)}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    Clique em 'Testar Endpoint' acima para simular a resposta
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Network communication logs terminal */}
        {terminalLogs.length > 0 && (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2 text-slate-300">
                <TerminalIcon className="w-4 h-4 text-teal-400" />
                <span className="font-bold font-mono">Consolidação e Handshake de Rede</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Status: {testing ? 'TRANSMITTING' : 'IDLE'}</span>
            </div>

            <div className="font-mono text-[11px] space-y-1.5 text-slate-300 max-h-[160px] overflow-y-auto">
              {terminalLogs.map((log, idx) => {
                let color = 'text-slate-400';
                if (log.startsWith('[FLUTTERFLOW]')) color = 'text-purple-400 font-semibold';
                if (log.startsWith('[NETWORK]')) color = 'text-sky-400';
                if (log.startsWith('[APPS SCRIPT]')) color = 'text-amber-400';
                if (log.includes('sucesso') || log.includes('sucesso.')) color = 'text-emerald-400';

                return <p key={idx} className={color}>{log}</p>;
              })}
            </div>
          </div>
        )}

        {/* 3. Production Ready Source Code Viewer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-teal-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Código do Backend em Produção</h3>
                <p className="text-[10px] text-slate-400">Copie e cole diretamente na IDE do Google Apps Script</p>
              </div>
            </div>

            {/* Sub file tab selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveCodeTab('main')}
                className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  activeCodeTab === 'main' ? 'bg-white dark:bg-slate-900 text-teal-500' : 'text-slate-500'
                }`}
              >
                main.gs
              </button>
              <button
                onClick={() => setActiveCodeTab('database')}
                className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  activeCodeTab === 'database' ? 'bg-white dark:bg-slate-900 text-teal-500' : 'text-slate-500'
                }`}
              >
                database.gs
              </button>
              <button
                onClick={() => setActiveCodeTab('services')}
                className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  activeCodeTab === 'services' ? 'bg-white dark:bg-slate-900 text-teal-500' : 'text-slate-500'
                }`}
              >
                services.gs
              </button>
            </div>
          </div>

          {/* Copyable code codeblock container */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-mono text-[10px]">
                {activeCodeTab === 'main' && 'Controle e Rotas'}
                {activeCodeTab === 'database' && 'Mapeamento ORM leve e tabelas'}
                {activeCodeTab === 'services' && 'Lógicas de Saldo e Backups'}
              </span>
              <button
                onClick={() => handleCopy(
                  activeCodeTab === 'main' ? APPS_SCRIPT_SOURCE_CODE.main :
                  activeCodeTab === 'database' ? APPS_SCRIPT_SOURCE_CODE.database :
                  APPS_SCRIPT_SOURCE_CODE.services,
                  'code_source'
                )}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all"
              >
                {copiedText === 'code_source' ? <Check className="w-3 h-3 text-teal-500" /> : <Copy className="w-3 h-3" />}
                Copiar Código Completo
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-[11px] font-mono overflow-y-auto max-h-[380px] border border-slate-850">
              <pre>{
                activeCodeTab === 'main' ? APPS_SCRIPT_SOURCE_CODE.main :
                activeCodeTab === 'database' ? APPS_SCRIPT_SOURCE_CODE.database :
                APPS_SCRIPT_SOURCE_CODE.services
              }</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
