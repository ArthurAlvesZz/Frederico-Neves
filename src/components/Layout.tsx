import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const [hideForce, setHideForce] = useState(false);
  const lastScrollYRef = useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleForceHide = (e: any) => {
      setHideForce(e.detail.hide);
    };
    window.addEventListener('force-nav-hide', handleForceHide);
    return () => window.removeEventListener('force-nav-hide', handleForceHide);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollYRef.current && currentScrollY > 50) {
            setShow(false);
          } else {
            setShow(true);
          }
          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Floating Navbar */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl transition-all duration-300 ${!hideForce && show ? 'translate-y-0 opacity-100' : '-translate-y-28 opacity-0 pointer-events-none'}`}>
        <div className="relative flex items-center justify-between pl-6 pr-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
          
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            {/* Logo Icon */}
            <img src="/logo-icon.png" alt="Frederico Neves Icon" className="h-10 w-10 object-contain group-hover:scale-105 transition-transform" decoding="async" />
            {/* Logo Wordmark */}
            <img src="/logo-wordmark.png" alt="Frederico Neves" className="h-6 object-contain" decoding="async" />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link to="/search" className="px-4 py-2 rounded-full text-xs xl:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Residências disponíveis</Link>
            <Link to="/search" className="px-4 py-2 rounded-full text-xs xl:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Nossa curadoria</Link>
            <Link to="/valuation" className="px-4 py-2 rounded-full text-xs xl:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Investimentos</Link>
            <a href="https://wa.me/553492515354" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full text-xs xl:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Falar com especialista</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <a href="https://wa.me/553492515354" target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/20 text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-white/10 hover:border-white/40 flex items-center gap-2 group transition-all">
              Solicitar acesso privado
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
            </a>
          </div>

          <button 
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Dropdown Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-3 w-64 p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-4 lg:hidden origin-top-right"
            >
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/search" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Residências disponíveis</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/search" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Nossa curadoria</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/valuation" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Investimentos</Link>
              <a onClick={() => setIsMobileMenuOpen(false)} href="https://wa.me/553492515354" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Falar com especialista</a>
              
              <div className="pt-4 border-t border-white/10 mt-1">
                <a onClick={() => setIsMobileMenuOpen(false)} href="https://wa.me/553492515354" target="_blank" rel="noopener noreferrer" className="bg-[#C6A75E] text-gray-950 px-5 py-3 rounded-full font-bold text-sm hover:bg-[#b09350] transition-colors flex justify-center text-center shadow-lg">
                  Solicitar acesso privado
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {children}

      <footer className="bg-gray-950 text-white pt-24 pb-12 overflow-hidden relative border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#C6A75E]/40 to-transparent" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 mb-24 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl text-white font-light mb-8 tracking-tight leading-none">
                O imóvel que <br /><span className="font-bold text-[#C6A75E] italic">você merece.</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-sm leading-relaxed font-light">
                Curadoria técnica, transparência absoluta e foco total no seu patrimônio.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-12 lg:justify-end">
              <div>
                <p className="text-xs uppercase font-bold text-[#C6A75E] tracking-[0.2em] mb-4">Central de Atendimento</p>
                <a 
                  href="https://wa.me/553492515354" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/20 text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-all group"
                >
                  Falar pelo WhatsApp
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </a>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-[#C6A75E] tracking-[0.2em] mb-4">Registro Profissional</p>
                <p className="text-2xl font-light text-white">CRECI 61100</p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p 
              className="text-sm font-light tracking-wide text-gray-500 cursor-default select-none"
              onDoubleClick={() => navigate('/admin/login')}
            >
              © 2024 Frederico Neves — Ateliê de Propriedades. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-gray-500">
              {/* Optional social icons can be placed here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
