import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import { AnimatePresence, motion } from 'motion/react';

// Lazy load non-critical pages
const SearchPage = lazy(() => import('./pages/Search'));
const Valuation = lazy(() => import('./pages/Valuation'));
const IdealMatch = lazy(() => import('./pages/IdealMatch'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Minimalist fallback for suspense
const PageLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-[#C6A75E]/20 border-t-[#C6A75E] rounded-full animate-spin" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<SearchPage />} />
          <Route path="/valuation" element={<Valuation />} />
          <Route path="/sell" element={<Valuation />} />
          <Route path="/match" element={<IdealMatch />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </Layout>
    </Router>
  );
}
