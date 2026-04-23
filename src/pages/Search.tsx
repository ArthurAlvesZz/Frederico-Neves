import React, { useState, useMemo, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { Search as SearchIcon, ArrowRight, Bed, Ruler, LayoutGrid, MapPin, Building2, Loader2, SlidersHorizontal, Map as MapIcon, ChevronDown, Bath } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const MapExplorerModal = lazy(() =>
  import('../components/MapExplorerModal').then(m => ({ default: m.MapExplorerModal }))
);

function levenshteinCost(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion, deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(input: string, target: string): boolean {
  if (!input) return true;
  // Normalize strings by removing accents and making lower case
  const nInput = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const nTarget = target.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // If the target simply includes the input, it's a perfect match
  if (nTarget.includes(nInput)) return true;
  // If the input is too short to start fuzzy matching, fail it
  if (nInput.length < 3) return false;

  const inputTokens = nInput.split(/\s+/);
  const targetTokens = nTarget.split(/\s+/);

  for (const iTok of inputTokens) {
    let matched = false;
    for (const tTok of targetTokens) {
        let dist1 = levenshteinCost(iTok, tTok.substring(0, iTok.length));
        let dist2 = levenshteinCost(iTok, tTok.substring(0, iTok.length + 1));
        let dist3 = iTok.length > 1 ? levenshteinCost(iTok, tTok.substring(0, iTok.length - 1)) : Infinity;
        
        let dist = Math.min(dist1, dist2, dist3);
        const limit = iTok.length <= 4 ? 1 : 2; // Allow 1 typo for small words, 2 for larger
        if (dist <= limit) {
           matched = true;
           break;
        }
    }
    if (!matched) return false;
  }
  return true;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const { properties, loading: propertiesLoading } = useProperties();
  const [globalInput, setGlobalInput] = useState('');
  
  const [neighborhoodInput, setNeighborhoodInput] = useState('');
  const [showNeighborhoodPredictions, setShowNeighborhoodPredictions] = useState(false);
  
  const [filterType, setFilterType] = useState('Todos');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [beds, setBeds] = useState<number>(0);
  const [baths, setBaths] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const globalWrapperRef = useRef<HTMLDivElement>(null);
  const neighborhoodWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (neighborhoodWrapperRef.current && !neighborhoodWrapperRef.current.contains(event.target as Node)) {
        setShowNeighborhoodPredictions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableNeighborhoods = useMemo(() => {
    const activeProps = globalInput.length > 0
      ? properties.filter(p => fuzzyMatch(globalInput, `${p.title} ${p.location} ${p.neighborhood} ${p.tipo} ${p.desc}`))
      : properties;
    return Array.from(new Set<string>(activeProps?.map(p => p.neighborhood) || []));
  }, [globalInput, properties]);

  const neighborhoodPredictions = useMemo(
    () => availableNeighborhoods.filter(b => fuzzyMatch(neighborhoodInput, b)),
    [neighborhoodInput, availableNeighborhoods]
  );

  const types = ['Todos', ...Array.from(new Set<string>(properties?.map(p => p.tipo) || []))];

  const filteredProperties = useMemo(() => {
    return (properties || []).filter(p => {
      const combinedSearchData = `${p.title || ''} ${p.location || ''} ${p.neighborhood || ''} ${p.tipo || ''} ${p.desc || ''}`;
      const matchGlobal = fuzzyMatch(globalInput, combinedSearchData);
      const matchNeighborhood = fuzzyMatch(neighborhoodInput, p.neighborhood || '');
      const matchType = filterType === 'Todos' || p.tipo === filterType;
      
      const matchMinPrice = minPrice === 0 || (p.price || 0) >= minPrice;
      const matchMaxPrice = maxPrice === 0 || (p.price || 0) <= maxPrice;
      const matchBeds = beds === 0 || (p.beds || 0) >= beds;
      const matchBaths = baths === 0 || (p.baths || 0) >= baths;

      return matchGlobal && matchNeighborhood && matchType && matchMinPrice && matchMaxPrice && matchBeds && matchBaths;
    });
  }, [globalInput, neighborhoodInput, filterType, properties, minPrice, maxPrice, beds, baths]);

  const handleNeighborhoodSelect = useCallback((b: string) => {
    setNeighborhoodInput(b);
    setShowNeighborhoodPredictions(false);
  }, []);

  return (
    <div className="pt-32 min-h-screen bg-gray-950 text-white selection:bg-[#C6A75E] selection:text-gray-950">
      
      {/* Search Header */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#C6A75E]/5 blur-[200px] pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-6">
                Portfólio <span className="font-bold text-[#C6A75E] italic">Exclusivo</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
                Explore nossa curadoria restrita de propriedades premium. Residências que redefinem o padrão de viver bem.
              </p>
            </div>
            
            {/* Map Button (Decorative for now) */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMapOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group self-start md:self-end"
            >
              <div className="p-2 bg-[#C6A75E]/20 rounded-full text-[#C6A75E] group-hover:bg-[#C6A75E] group-hover:text-gray-950 transition-colors">
                <MapIcon size={20} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white">Ver no Mapa</span>
            </motion.button>
          </div>
          
          {/* Functional Filter Bar */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-3xl flex flex-col gap-2 max-w-6xl shadow-2xl relative z-20">
            <div className="flex flex-col lg:flex-row gap-4 items-center p-1">
              {/* Global Search Input */}
              <div ref={globalWrapperRef} className="relative flex-1 w-full lg:w-auto">
                <div className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 focus-within:border-[#C6A75E] transition-colors">
                  <SearchIcon size={20} className="text-[#C6A75E] flex-shrink-0" />
                  <input 
                    type="text"
                    placeholder="Buscar por cidade, imóvel, tipo..."
                    value={globalInput}
                    onChange={(e) => setGlobalInput(e.target.value)}
                    className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Neighborhood Autocomplete */}
              <div ref={neighborhoodWrapperRef} className="relative flex-1 w-full lg:w-auto">
                <div className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 focus-within:border-[#C6A75E] transition-colors">
                  <Building2 size={20} className="text-[#C6A75E] flex-shrink-0" />
                  <input 
                    type="text"
                    placeholder="Qualquer bairro..."
                    value={neighborhoodInput}
                    onChange={(e) => {
                      setNeighborhoodInput(e.target.value);
                      setShowNeighborhoodPredictions(true);
                    }}
                    onFocus={() => setShowNeighborhoodPredictions(true)}
                    className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-gray-500"
                  />
                </div>

                <AnimatePresence>
                  {showNeighborhoodPredictions && neighborhoodPredictions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-2 max-h-64 overflow-y-auto"
                    >
                      {neighborhoodPredictions.map(b => (
                        <li
                          key={b}
                          onClick={() => handleNeighborhoodSelect(b)}
                          className="px-4 py-3 text-sm text-gray-300 hover:bg-[#C6A75E]/20 hover:text-white cursor-pointer transition-colors"
                        >
                          {b}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Advanced Filter Desktop Toggle */}
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`hidden lg:flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${showAdvanced ? 'bg-[#C6A75E]/10 border-[#C6A75E] text-[#C6A75E]' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}
              >
                <SlidersHorizontal size={20} />
                <span className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Filtros</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <button className="w-full lg:w-auto px-10 py-5 bg-[#C6A75E] text-gray-950 font-bold rounded-2xl hover:bg-[#b09350] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C6A75E]/20 active:scale-95">
                <SearchIcon size={20} />
                <span className="uppercase tracking-widest text-sm">Pesquisar</span>
              </button>
            </div>

            {/* Mobile Advanced Toggle */}
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="lg:hidden w-full flex items-center justify-center gap-3 py-3 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filtros Avançados
              <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Advanced Filters */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Price Range */}
                    <div className="space-y-4">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Faixa de Investimento</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[#C6A75E] font-bold">Min</span>
                          <input 
                            type="number" 
                            step={1000000}
                            value={minPrice || ''}
                            onChange={e => setMinPrice(Number(e.target.value))}
                            placeholder="Mínimo"
                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6A75E] placeholder:text-gray-700"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[#C6A75E] font-bold">Max</span>
                          <input 
                            type="number" 
                            step={1000000}
                            value={maxPrice || ''}
                            onChange={e => setMaxPrice(Number(e.target.value))}
                            placeholder="Máximo"
                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C6A75E] placeholder:text-gray-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Beds */}
                    <div className="space-y-4">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Dormitórios</p>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <button 
                            key={n}
                            onClick={() => setBeds(n)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${beds === n ? 'bg-[#C6A75E] text-gray-950 font-bold' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                          >
                            {n === 0 ? 'T' : n === 5 ? '5+' : n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Baths */}
                    <div className="space-y-4">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Banheiros</p>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <button 
                            key={n}
                            onClick={() => setBaths(n)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${baths === n ? 'bg-[#C6A75E] text-gray-950 font-bold' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                          >
                            {n === 0 ? 'T' : n === 5 ? '5+' : n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-4 text-left">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tipo de Ativo</p>
                      <div className="relative">
                        <LayoutGrid size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C6A75E]" />
                        <select 
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#C6A75E] appearance-none cursor-pointer capitalize"
                        >
                           {types.map(tipo => (
                              <option key={tipo} value={tipo} className="text-gray-900 capitalize">{tipo}</option>
                           ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Reset Filters */}
                  <div className="px-6 pb-6 flex justify-end">
                    <button 
                      onClick={() => {
                        setGlobalInput('');
                        setNeighborhoodInput('');
                        setFilterType('Todos');
                        setMinPrice(0);
                        setMaxPrice(0);
                        setBeds(0);
                        setBaths(0);
                      }}
                      className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C6A75E] hover:text-[#b09350] transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="container-custom pb-32">
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
            <h2 className="text-xl font-light text-white">
                <span className="font-bold text-[#C6A75E]">{filteredProperties.length}</span> propriedades encontradas
            </h2>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProperties?.map((p) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={p.id} 
                onClick={() => navigate(`/property/${p.id}`)}
                className="w-full h-[500px] relative rounded-3xl overflow-hidden group shadow-2xl border border-white/10 cursor-pointer"
              >
                <img 
                  src={p.image} 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={p.title} 
                />
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                
                {/* Tag */}
                <div className="absolute top-6 left-6 z-10 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-medium uppercase tracking-wider">
                  {p.tag}
                </div>

                <div className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ArrowRight size={18} className="text-white" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                  <h3 className="text-white text-3xl font-light mb-2">{p.title}</h3>
                  <p className="text-gray-300 text-sm mb-6 flex items-center gap-2">
                    <span className="text-[#C6A75E] font-bold">●</span> {p.neighborhood}, {p.location}
                  </p>
                  
                  {/* Property Data */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Preço</p>
                      <p className="text-[#C6A75E] font-bold text-lg">R$ {(p.price / 1000000).toFixed(1)} Mi</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Área</p>
                      <p className="text-white font-medium text-lg">{p.sqft} m²</p>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Bed size={16} className="text-gray-400"/> <span className="font-light">{p.beds} <span className="hidden sm:inline">Quartos</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Ruler size={16} className="text-gray-400"/> <span className="font-light">{p.baths} <span className="hidden sm:inline">Banheiros</span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProperties.length === 0 && (
          <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10 mt-8">
            <h3 className="text-2xl font-light text-white mb-2">Nenhuma propriedade encontrada</h3>
            <p className="text-gray-400">Tente ajustar os filtros, cidades ou bairros para encontrar o que procura, ou fale direto com nossa equipe.</p>
          </div>
        )}
      </section>

      <Suspense fallback={null}>
        <MapExplorerModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          properties={filteredProperties}
        />
      </Suspense>
    </div>
  );
};

export default SearchPage;
