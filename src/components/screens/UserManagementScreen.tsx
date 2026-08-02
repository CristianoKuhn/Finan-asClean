import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Check, 
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Edit2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: string;
  allowedScreens?: string[];
}

interface UserManagementScreenProps {
  users: UserAccount[];
  currentUserEmail: string;
  onAddUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (id: string, updatedFields: Partial<UserAccount>) => void;
}

export const AVAILABLE_SCREENS = [
  { id: 'dashboard', label: 'Painel Geral', category: 'Principal' },
  { id: 'centro_financeiro', label: 'Centro Financeiro', category: 'Principal' },
  { id: 'receitas', label: 'Painel Receitas', category: 'Lançamentos' },
  { id: 'despesas', label: 'Painel Despesas', category: 'Lançamentos' },
  { id: 'novo_lancamento', label: 'Novo Lançamento', category: 'Lançamentos' },
  { id: 'pesquisa', label: 'Pesquisa Global', category: 'Lançamentos' },
  { id: 'filtros', label: 'Filtros Avançados', category: 'Lançamentos' },
  { id: 'categorias', label: 'Categorias & Limites', category: 'Organização' },
  { id: 'contas', label: 'Contas Bancárias', category: 'Organização' },
  { id: 'cartoes', label: 'Cartões de Crédito', category: 'Organização' },
  { id: 'parcelamentos', label: 'Parcelamentos', category: 'Planejamento' },
  { id: 'assinaturas', label: 'Assinaturas / SaaS', category: 'Planejamento' },
  { id: 'metas', label: 'Metas & Objetivos', category: 'Planejamento' },
  { id: 'investimentos', label: 'Investimentos', category: 'Análise' },
  { id: 'calendario', label: 'Calendário & Fluxo', category: 'Análise' },
  { id: 'relatorios', label: 'Relatórios Fiscais', category: 'Análise' },
  { id: 'ai_coach', label: 'Mentor IA (Coach)', category: 'Análise' },
  { id: 'divisao_contas', label: 'Divisão Ale & Cris', category: 'Análise' }
];

export function UserManagementScreen({ 
  users, 
  currentUserEmail, 
  onAddUser, 
  onDeleteUser,
  onUpdateUser
}: UserManagementScreenProps) {
  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [allowedScreens, setAllowedScreens] = useState<string[]>(
    AVAILABLE_SCREENS.map(s => s.id)
  );
  
  // Edit user state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [editAllowedScreens, setEditAllowedScreens] = useState<string[]>([]);
  
  // UI States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleScreenSelection = (screenId: string, isEditMode: boolean = false) => {
    if (isEditMode) {
      setEditAllowedScreens(prev => 
        prev.includes(screenId) 
          ? prev.filter(id => id !== screenId) 
          : [...prev, screenId]
      );
    } else {
      setAllowedScreens(prev => 
        prev.includes(screenId) 
          ? prev.filter(id => id !== screenId) 
          : [...prev, screenId]
      );
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Este e-mail já está sendo utilizado por outro usuário.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve possuir no mínimo 4 caracteres.');
      return;
    }

    // Standard user has configured allowedScreens, admin has access to everything
    const finalAllowed = role === 'admin' ? AVAILABLE_SCREENS.map(s => s.id) : allowedScreens;

    onAddUser({ 
      name, 
      email, 
      password, 
      role,
      allowedScreens: finalAllowed 
    });

    setSuccess(`Usuário ${name} cadastrado com sucesso!`);
    
    // Clear form
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setAllowedScreens(AVAILABLE_SCREENS.map(s => s.id));
    setShowForm(false);

    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleEditClick = (user: UserAccount) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditAllowedScreens(user.allowedScreens || AVAILABLE_SCREENS.map(s => s.id));
    setShowForm(false);
    setError(null);
    setSuccess(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!editingUser) return;

    if (!editName || !editEmail || !editPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const otherUsers = users.filter(u => u.id !== editingUser.id);
    if (otherUsers.some(u => u.email.toLowerCase() === editEmail.toLowerCase())) {
      setError('Este e-mail já está sendo utilizado por outro usuário.');
      return;
    }

    if (editPassword.length < 4) {
      setError('A senha deve possuir no mínimo 4 caracteres.');
      return;
    }

    const finalAllowed = editRole === 'admin' ? AVAILABLE_SCREENS.map(s => s.id) : editAllowedScreens;

    onUpdateUser(editingUser.id, {
      name: editName,
      email: editEmail,
      password: editPassword,
      role: editRole,
      allowedScreens: finalAllowed
    });

    setSuccess(`Usuário ${editName} atualizado com sucesso!`);
    setEditingUser(null);

    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleDelete = (id: string, userToDelete: UserAccount) => {
    if (userToDelete.email.toLowerCase() === currentUserEmail.toLowerCase()) {
      setError('Você não pode excluir o seu próprio usuário atual de login.');
      return;
    }

    if (window.confirm(`Tem certeza de que deseja excluir permanentemente o usuário ${userToDelete.name}?`)) {
      onDeleteUser(id);
      setSuccess(`Usuário ${userToDelete.name} excluído com sucesso.`);
      if (editingUser?.id === id) {
        setEditingUser(null);
      }
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
          <Users className="w-64 h-64 text-teal-400" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold uppercase text-[10px] tracking-widest font-mono">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Painel de Controle de Acesso
            </div>
            <h2 className="text-2xl font-black text-white font-display">Gerenciamento de Usuários</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Como administrador, você pode gerenciar quem possui chaves de acesso ao sistema financeiro. Defina níveis de privilégio, selecione quais dashboards cada usuário padrão pode visualizar ou altere/resete senhas esquecidas instantaneamente.
            </p>
          </div>

          <div className="flex gap-2">
            {editingUser && (
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 font-extrabold rounded-xl text-xs transition-all cursor-pointer border border-slate-800"
              >
                Cancelar Edição
              </button>
            )}
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingUser(null);
              }}
              className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs hover:opacity-90 shadow-md shadow-teal-500/10 cursor-pointer transition-all shrink-0"
            >
              {showForm ? 'Fechar Formulário' : 'Criar Novo Usuário'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Edit User Form block */}
      {editingUser && (
        <div className="bg-slate-900 border border-purple-900/30 rounded-2xl p-6 space-y-6 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Editar Usuário: <span className="text-white normal-case font-bold">{editingUser.name}</span>
              </h3>
            </div>
            <button 
              onClick={() => setEditingUser(null)} 
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Resetar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Privilégio</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="user">Usuário Padrão</option>
                  <option value="admin">Administrador (Admin)</option>
                </select>
              </div>
            </div>

            {/* Dashboard permission selection (Only show for standard user) */}
            {editRole === 'user' && (
              <div className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Permissões de Telas e Dashboards
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Desmarque os dashboards que este usuário padrão não deve acessar. Eles serão ocultados do menu lateral.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {AVAILABLE_SCREENS.map(screen => {
                    const isChecked = editAllowedScreens.includes(screen.id);
                    return (
                      <label 
                        key={screen.id} 
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-purple-950/20 border-purple-900/50 text-purple-200 font-bold' 
                            : 'bg-slate-900 border-slate-850 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleScreenSelection(screen.id, true)}
                          className="mt-0.5 rounded text-purple-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <p>{screen.label}</p>
                          <span className="text-[9px] opacity-60 font-mono font-medium block mt-0.5">({screen.category})</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-500/10"
              >
                Salvar Alterações <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Form block */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <UserPlus className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Cadastro de Novo Usuário</h3>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do usuário"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@dominio.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Senha Provisória</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Privilégio</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="user">Usuário Padrão</option>
                  <option value="admin">Administrador (Admin)</option>
                </select>
              </div>
            </div>

            {/* Dashboard permission selection (Only show for standard user) */}
            {role === 'user' && (
              <div className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Permissões de Telas e Dashboards (Selecione o acesso manual)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Marque/desmarque quais dashboards ou módulos este novo usuário padrão poderá acessar na plataforma.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {AVAILABLE_SCREENS.map(screen => {
                    const isChecked = allowedScreens.includes(screen.id);
                    return (
                      <label 
                        key={screen.id} 
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-teal-950/20 border-teal-900/50 text-teal-200 font-bold' 
                            : 'bg-slate-900 border-slate-850 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleScreenSelection(screen.id, false)}
                          className="mt-0.5 rounded text-teal-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <p>{screen.label}</p>
                          <span className="text-[9px] opacity-60 font-mono block mt-0.5">({screen.category})</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 hover:opacity-90"
              >
                Salvar Usuário <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-teal-400" /> Usuários Cadastrados no Aplicativo
        </h3>

        <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-950/40 text-[10px] text-slate-500 uppercase font-mono font-bold">
                <th className="p-4">Nome</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Cargo / Nível</th>
                <th className="p-4">Dashboards Permitidos</th>
                <th className="p-4">Data Cadastro</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-xs text-slate-300">
              {users.map((user) => {
                const isSelf = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                
                // Mapped allowed list text
                let allowedText = "Acesso Total (Tudo)";
                if (user.role === 'user') {
                  if (!user.allowedScreens || user.allowedScreens.length === 0) {
                    allowedText = "Nenhum";
                  } else if (user.allowedScreens.length === AVAILABLE_SCREENS.length) {
                    allowedText = "Acesso Completo";
                  } else {
                    allowedText = `${user.allowedScreens.length} de ${AVAILABLE_SCREENS.length} telas`;
                  }
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-teal-400 uppercase font-bold border border-slate-700">
                        {user.name.slice(0, 2)}
                      </div>
                      <span>
                        {user.name} {isSelf && <span className="text-[9px] bg-teal-950/50 text-teal-400 border border-teal-900/30 px-1.5 py-0.2 rounded font-mono font-bold ml-1">VOCÊ</span>}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold inline-flex items-center gap-1 ${
                        user.role === 'admin' 
                          ? 'bg-purple-950/50 text-purple-400 border border-purple-900/30' 
                          : 'bg-teal-950/50 text-teal-400 border border-teal-900/30'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {user.role === 'admin' ? 'Administrador' : 'Analista Padrão'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] text-slate-400 font-sans">
                        {allowedText}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {user.createdAt.split('-').reverse().join('/')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          title="Editar Usuário & Alterar Senha"
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-purple-400 hover:border-purple-900/50 bg-slate-900 cursor-pointer transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user)}
                          disabled={isSelf}
                          title={isSelf ? "Você não pode deletar a si mesmo" : "Excluir usuário"}
                          className={`p-1.5 rounded-lg border text-slate-400 transition-all ${
                            isSelf 
                              ? 'opacity-20 cursor-not-allowed border-transparent' 
                              : 'hover:text-rose-400 hover:border-rose-900/50 bg-slate-900 border-slate-800 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
