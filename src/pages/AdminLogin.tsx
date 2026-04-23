import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check local hardcoded credentials first to ensure exactly Fredneves and 61100963
    if (username.trim() !== 'Fredneves') {
      setError('Usuário incorreto.');
      return;
    }

    if (password !== '61100963') {
      setError('Senha incorreta.');
      return;
    }

    setLoading(true);

    const adminEmail = "arthurfgalves@gmail.com";

    try {
      // Tenta fazer o login com o e-mail atrelado à regra de admin
      await signInWithEmailAndPassword(auth, adminEmail, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      
      // Se o usuário não existir no Firebase, isso tentará criar a conta automaticamente!
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
           await createUserWithEmailAndPassword(auth, adminEmail, password);
           navigate('/admin/dashboard');
        } catch (createErr: any) {
           console.error(createErr);
           if (createErr.code === 'auth/operation-not-allowed') {
             setError('PROVEDOR DESATIVADO: Você precisa ativar "E-mail/Senha" no seu Firebase Console.');
           } else {
             setError('Erro ao criar usuário administrador no banco de dados.');
           }
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('PROVEDOR DESATIVADO: Você precisa ativar "E-mail/Senha" no seu Firebase Console.');
      } else {
        setError('Falha ao autenticar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 selection:bg-[#C6A75E] selection:text-gray-950">
      <Helmet>
        <title>Acesso Restrito | Frederico Neves</title>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <ShieldAlert className="w-12 h-12 text-[#C6A75E] mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-white mb-2">Painel de Controle</h1>
          <p className="text-gray-400 font-sans text-sm">Acesso exclusivo e restrito à administração da plataforma Frederico Neves.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#C6A75E] transition-colors"
                  placeholder="Seu usuário de acesso"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#C6A75E] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-[#C6A75E] hover:bg-[#b09452] text-gray-950 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Acessar Painel'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-8">
          Sistema protegido por criptografia de ponta.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
