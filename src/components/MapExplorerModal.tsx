import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Bed, Ruler, ChevronRight, SlidersHorizontal, Search } from 'lucide-react';
import { Property } from '../types';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress } from '../services/geocodingService';

// Fix Leaflet marker icon issue
import 'leaflet/dist/leaflet.css';

interface MapExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
}

const defaultCenter: [number, number] = [-18.9113, -48.2622]; // Uberlândia

// Helper component to update map view
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapExplorerModal: React.FC<MapExplorerModalProps> = ({ isOpen, onClose, properties }) => {
  const navigate = useNavigate();
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [geocodedProperties, setGeocodedProperties] = useState<{[key: string]: {lat: number, lng: number}}>({});
  
  // Filter States
  const [filterType, setFilterType] = useState('Todos');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [beds, setBeds] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);

  const types = ['Todos', ...Array.from(new Set(properties.map(p => p.tipo)))];

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchType = filterType === 'Todos' || p.tipo === filterType;
      const matchMinPrice = minPrice === 0 || p.price >= minPrice;
      const matchMaxPrice = maxPrice === 0 || p.price <= maxPrice;
      const matchBeds = beds === 0 || p.beds >= beds;
      const matchLuxury = !luxuryOnly || p.luxury_flag === true;
      return matchType && matchMinPrice && matchMaxPrice && matchBeds && matchLuxury;
    });
  }, [properties, filterType, minPrice, maxPrice, beds, luxuryOnly]);

  // Handle on-the-fly geocoding for missing coordinates
  useEffect(() => {
    if (!isOpen) return;
    
    const resolveGeocoding = async () => {
      const missing = filteredProperties.filter(p => !p.latitude && !p.longitude && !geocodedProperties[p.id]);
      if (missing.length === 0) return;

      const toGeocode = missing.slice(0, 3); 
      for (const p of toGeocode) {
        const geo = await geocodeAddress(p.address || '', p.neighborhood, p.location);
        if (geo) {
          setGeocodedProperties(prev => ({...prev, [p.id]: geo}));
        }
      }
    };

    resolveGeocoding();
  }, [isOpen, filteredProperties, geocodedProperties]);

  const propertiesWithCoords = useMemo(() => {
    return filteredProperties.map(p => {
      if (p.latitude && p.longitude) return { ...p, lat: p.latitude, lng: p.longitude };
      if (geocodedProperties[p.id]) {
        return { ...p, lat: geocodedProperties[p.id].lat, lng: geocodedProperties[p.id].lng };
      }
      return null;
    }).filter((p): p is (Property & { lat: number; lng: number }) => p !== null);
  }, [filteredProperties, geocodedProperties]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `R$ ${(price / 1000000).toFixed(1)} Mi`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price);
  };

  const createPriceIcon = (price: number, isHovered: boolean, isLuxury: boolean) => {
    const formattedPrice = formatPrice(price);
    const bgColor = isHovered ? '#0A2540' : (isLuxury ? '#C6A75E' : '#FFFFFF');
    const textColor = (isHovered || isLuxury) ? '#FFFFFF' : '#0A2540';
    const borderColor = isLuxury ? '#C6A75E' : '#E5E7EB';

    return L.divIcon({
      className: 'custom-price-marker',
      html: `
        <div style="
          background-color: ${bgColor};
          color: ${textColor};
          border: 1px solid ${borderColor};
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 11px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transform: translate(-50%, -50%);
          transition: all 0.2s ease;
          position: absolute;
        ">
          ${formattedPrice}
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  const mapCenter = useMemo((): [number, number] => {
    if (activeProperty && activeProperty.latitude && activeProperty.longitude) {
      return [activeProperty.latitude, activeProperty.longitude];
    }
    if (propertiesWithCoords.length > 0) {
      return [propertiesWithCoords[0].lat, propertiesWithCoords[0].lng];
    }
    return defaultCenter;
  }, [activeProperty, propertiesWithCoords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex w-[450px] xl:w-[550px] h-full flex-col bg-white border-r border-gray-100 z-10 relative">
        
        {/* Header with Search/Filters */}
        <div className="p-8 border-b border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-[#C6A75E] shadow-lg shadow-[#0A2540]/10">
                <MapPin size={20} />
              </div>
              <h2 className="text-2xl font-heading font-medium text-[#0A2540] tracking-tight">Mapa de <span className="font-bold italic">Ativos</span></h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-full transition-all hover:rotate-90 duration-300"
            >
              <X size={24} className="text-gray-300 hover:text-[#0A2540]" />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A75E] transition-colors" />
              <input 
                type="text" 
                placeholder="Ex: Morada da Colina..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-body focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#C6A75E] focus:border-[#C6A75E] transition-all placeholder:text-gray-400 text-[#0A2540]"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3.5 border rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-[#C6A75E] border-[#C6A75E] text-white shadow-xl shadow-[#C6A75E]/20' : 'bg-white border-gray-100 text-[#0A2540] hover:border-[#C6A75E] hover:text-[#C6A75E]'}`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4 pt-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tipo</label>
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C6A75E]"
                    >
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dormitórios (Min)</label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(n => (
                        <button 
                          key={n}
                          onClick={() => setBeds(n)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${beds === n ? 'bg-[#C6A75E] text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                          {n === 0 ? 'T' : n === 4 ? '4+' : n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1 pr-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mínimo: {formatPrice(minPrice)}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10000000" 
                      step="500000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full accent-[#C6A75E]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Apenas Luxo</label>
                    <button 
                      onClick={() => setLuxuryOnly(!luxuryOnly)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${luxuryOnly ? 'bg-[#C6A75E]' : 'bg-gray-200'}`}
                    >
                      <motion.div 
                        animate={{ x: luxuryOnly ? 20 : 2 }}
                        className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {filteredProperties.length} propriedades encontradas
            </span>
          </div>

          <div className="grid gap-6">
            {filteredProperties.map(p => (
              <motion.div 
                key={p.id}
                onMouseEnter={() => setHoveredPropertyId(p.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
                onClick={() => setActiveProperty(p)}
                className={`flex gap-4 p-3 rounded-2xl border transition-all cursor-pointer group ${hoveredPropertyId === p.id || activeProperty?.id === p.id ? 'border-[#C6A75E] bg-gray-50 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-gray-100">
                    {p.tag}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#C6A75E] mb-1">{p.neighborhood}</div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#C6A75E] transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400 font-bold uppercase">
                      <div className="flex items-center gap-1"><Bed size={12} /> {p.beds} dorm.</div>
                      <div className="flex items-center gap-1"><Ruler size={12} /> {p.sqft}m²</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/property/${p.id}`);
                      }}
                      className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-[#C6A75E] group-hover:text-white transition-all shadow-sm"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
           <p className="text-[10px] font-medium text-gray-400">© Frederico Neves — Ateliê de Propriedades</p>
        </div>
      </div>

      <div className="flex-1 h-full relative">
        <div className="md:hidden absolute top-0 left-0 w-full p-4 z-[1001] pointer-events-none">
           <div className="flex items-center justify-between pointer-events-auto">
              <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <X size={20} className="text-gray-900" />
              </button>
              <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#C6A75E]" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Mapa de Ativos</span>
              </div>
           </div>
        </div>

        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <ChangeView center={mapCenter} zoom={activeProperty ? 16 : 13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
            {propertiesWithCoords.map(p => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={createPriceIcon(p.price, hoveredPropertyId === p.id || activeProperty?.id === p.id, p.luxury_flag === true)}
                eventHandlers={{
                  click: () => setActiveProperty(p),
                  mouseover: () => setHoveredPropertyId(p.id),
                  mouseout: () => setHoveredPropertyId(null)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="w-[180px] overflow-hidden bg-white">
                    <img src={p.image} alt={p.title} className="w-full h-24 object-cover" />
                    <div className="p-3">
                      <p className="text-[9px] font-bold text-[#C6A75E] uppercase tracking-widest">{p.neighborhood}</p>
                      <h4 className="text-xs font-bold text-gray-900 mb-2 line-clamp-1">{p.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{formatPrice(p.price)}</span>
                        <button onClick={() => navigate(`/property/${p.id}`)} className="text-[10px] font-bold text-[#C6A75E] hover:underline">
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        <div className="md:hidden absolute bottom-6 left-0 w-full px-4 overflow-hidden z-[1001] pointer-events-none">
           <motion.div 
             drag="x"
             dragConstraints={{ right: 0, left: -(filteredProperties.length - 1) * 280 }}
             className="flex gap-4 pointer-events-auto"
           >
             {filteredProperties.map(p => (
               <motion.div 
                 key={p.id}
                 onClick={() => setActiveProperty(p)}
                 className={`w-64 bg-white rounded-2xl p-2 shadow-2xl flex items-center gap-3 border-2 transition-all ${activeProperty?.id === p.id ? 'border-[#C6A75E]' : 'border-transparent'}`}
               >
                 <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={p.image} className="w-full h-full object-cover" alt={p.title} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <div className="text-[8px] font-bold text-[#C6A75E] uppercase tracking-widest">{p.neighborhood}</div>
                    <h4 className="text-[11px] font-bold text-gray-900 line-clamp-1 truncate">{p.title}</h4>
                    <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(p.price)}</p>
                 </div>
               </motion.div>
             ))}
           </motion.div>
        </div>

        <div className="hidden md:flex absolute bottom-8 left-8 flex-col gap-2 z-[1001]">
           <button onClick={() => setActiveProperty(null)} className="bg-white px-6 py-3 rounded-full shadow-xl text-xs font-bold uppercase tracking-widest text-gray-900 border border-gray-100 hover:bg-gray-50">
             Resetar Visão
           </button>
        </div>
      </div>

      <style>{`
        .leaflet-container { overflow: hidden; background: #f8f9fa; }
        .custom-price-marker { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .custom-price-marker:hover { z-index: 1000 !important; }
        .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
        .leaflet-popup-content { margin: 0 !important; width: 180px !important; }
        .leaflet-popup-tip-container { display: none; }
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background-color: rgba(198, 167, 94, 0.6) !important; border: 2px solid #C6A75E; }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background-color: #C6A75E !important; color: white !important; font-weight: bold; }
      `}</style>
    </div>
  );
};
