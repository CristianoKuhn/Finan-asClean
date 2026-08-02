/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  UserPlus, 
  Lock, 
  Mail, 
  User, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  RefreshCw 
} from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthScreensProps {
  currentScreen: 'splash' | 'login' | 'register' | 'forgot_password';
  setScreen: (screen: any) => void;
  onLoginSuccess: (user: UserAccount) => void;
  users: UserAccount[];
  onRegisterUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onUpdateUserPassword: (email: string, newPassword: string) => boolean;
}

export function AuthScreens({ 
  currentScreen, 
  setScreen, 
  onLoginSuccess, 
  users, 
  onRegisterUser,
  onUpdateUserPassword
}: AuthScreensProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot password sub-states
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Loading & state handlers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-redirect for Splash screen or manually enter
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('login');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, setScreen]);

  // Validations & Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const matched = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (matched) {
        onLoginSuccess(matched);
        setScreen('dashboard');
      } else {
        setError('E-mail ou senha incorretos. Verifique suas credenciais de acesso.');
      }
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    if (password.length < 4) {
      setError('A senha precisa ter no mínimo 4 caracteres.');
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Este endereço de e-mail já está cadastrado.');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onRegisterUser({ name, email, password, role: 'user' });
      setSuccess('Cadastro concluído com sucesso! Redirecionando para login...');
      setTimeout(() => {
        setSuccess(null);
        setScreen('login');
      }, 1500);
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Insira o seu e-mail cadastrado.');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setForgotStep('reset');
        setSuccess('E-mail verificado! Você já pode definir sua nova senha secreta abaixo:');
        setTimeout(() => setSuccess(null), 4000);
      } else {
        setError('E-mail não encontrado. Por favor, verifique se digitou corretamente ou solicite um acesso.');
      }
    }, 1200);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (newPassword.length < 4) {
      setError('A nova senha precisa ter no mínimo 4 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const ok = onUpdateUserPassword(email, newPassword);
      if (ok) {
        setSuccess('Senha redefinida com sucesso! Redirecionando para login...');
        setTimeout(() => {
          setSuccess(null);
          setForgotStep('verify');
          setNewPassword('');
          setConfirmNewPassword('');
          setEmail('');
          setScreen('login');
        }, 1800);
      } else {
        setError('Erro ao redefinir senha. Usuário não encontrado no cache.');
      }
    }, 1200);
  };

  // 1. Splash Screen Component
  if (currentScreen === 'splash') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-950 text-white rounded-2xl relative overflow-hidden p-6 text-center border border-slate-800">
        <div className="absolute inset-0 bg-radial-gradient from-teal-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-6 relative z-10 animate-pulse">
          {/* Glowing Premium Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-teal-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight font-display bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
              FINANÇAS CLEAN
            </h1>
            <p className="text-xs text-slate-400 tracking-wide font-sans">
              O jeito inteligente de cuidar do seu dinheiro.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-6">
            <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
            <p className="text-[10px] text-slate-500 font-mono">
              Inicializando sincronia de chaves criptográficas...
            </p>
          </div>
        </div>

        {/* Quick entry button bypass if user wants to skip */}
        <button 
          onClick={() => setScreen('login')}
          className="absolute bottom-6 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-semibold underline"
        >
          Pular Introdução
        </button>
      </div>
    );
  }

  // 2. Login Screen Component
  if (currentScreen === 'login') {
    return (
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 md:p-8 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
          <div className="text-center space-y-1.5">
            <div className="mx-auto w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">Finanças Clean</h2>
            <p className="text-xs text-slate-400">O jeito inteligente de cuidar do seu dinheiro.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-lg flex gap-2 text-xs text-rose-300 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@dominio.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Senha</label>
                <button
                  type="button"
                  onClick={() => setScreen('forgot_password')}
                  className="text-[10px] text-teal-400 hover:underline cursor-pointer"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Verificando Assinatura...
                </>
              ) : (
                <>
                  Acessar Aplicativo <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


        </div>

        <div className="text-center pt-6 border-t border-slate-900 mt-6 text-xs text-slate-400">
          Não possui uma chave de acesso?{' '}
          <button 
            onClick={() => setScreen('register')} 
            className="text-teal-400 font-bold hover:underline cursor-pointer"
          >
            Cadastre-se grátis
          </button>
        </div>
      </div>
    );
  }

  // 3. Register Screen Component
  if (currentScreen === 'register') {
    return (
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 md:p-8 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-md w-full mx-auto space-y-5 relative z-10">
          <div className="text-center space-y-1.5">
            <div className="mx-auto w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
              <UserPlus className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">Criar Chave Soberana</h2>
            <p className="text-xs text-slate-400">Comece a gerenciar suas finanças com privacidade</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-lg flex gap-2 text-xs text-rose-300 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg flex gap-2 text-xs text-emerald-300 items-start">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Cristiano Kuhn"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">E-mail de Trabalho</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Senha Secreta</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mín. 6 dígitos"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Consolidando Chave...
                </>
              ) : (
                <>
                  Gerar Conta Gratuita <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center pt-6 border-t border-slate-900 mt-6 text-xs text-slate-400">
          Já possui cadastro?{' '}
          <button 
            onClick={() => setScreen('login')} 
            className="text-teal-400 font-bold hover:underline cursor-pointer"
          >
            Faça login
          </button>
        </div>
      </div>
    );
  }

  // 4. Forgot Password Screen Component
  if (currentScreen === 'forgot_password') {
    return (
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 md:p-8 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
          <div className="text-center space-y-1.5">
            <div className="mx-auto w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
              <RefreshCw className="w-6 h-6 text-teal-400 animate-spin-slow" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              {forgotStep === 'verify' ? 'Recuperar Senha / Primeiro Acesso' : 'Definir Nova Senha'}
            </h2>
            <p className="text-xs text-slate-400">
              {forgotStep === 'verify' ? 'Redefina sua chave mestre ou configure o primeiro acesso' : 'Digite sua nova senha de segurança'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-lg flex gap-2 text-xs text-rose-300 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg flex gap-2 text-xs text-emerald-300 items-start">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {forgotStep === 'verify' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cristianokuhn7@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed">
                  Para o primeiro acesso ou redefinição, digite seu e-mail cadastrado pelo Administrador para validar sua credencial de segurança.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Verificando Registro...
                  </>
                ) : (
                  <>
                    Verificar Conta Bancária <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail Verificado</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-xs text-slate-500 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nova Senha Secreta</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Atualizando Chave...
                  </>
                ) : (
                  <>
                    Salvar Nova Senha e Entrar <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center pt-6 border-t border-slate-900 mt-6 text-xs text-slate-400">
          Lembrou a senha?{' '}
          <button 
            onClick={() => {
              setForgotStep('verify');
              setEmail('');
              setNewPassword('');
              setConfirmNewPassword('');
              setError(null);
              setSuccess(null);
              setScreen('login');
            }} 
            className="text-teal-400 font-bold hover:underline cursor-pointer"
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
