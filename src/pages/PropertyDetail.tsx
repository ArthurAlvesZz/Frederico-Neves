import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPropertyById } from '../hooks/useProperties';
import type { Property } from '../types';
import { motion } from 'motion/react';
import { MapPin, Bed, Ruler, Bath, Car, CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react';
import { geocodeAddress } from '../services/geocodingService';

const MiniMap = lazy(() =>
  import('../components/MiniMap').then(m => ({ default: m.MiniMap }))
);

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const loadProp = async () => {
       if (!id) {
           setLoading(false);
           return;
       }
       const p = await fetchPropertyById(id);
       setProperty(p);
       
       if (p) {
         if (p.latitude && p.longitude) {
           setCoords({ lat: p.latitude, lng: p.longitude });
         } else {
           const geo = await geocodeAddress(p.address || '', p.neighborhood, p.location);
           if (geo) setCoords(geo);
         }
       }
       
       setLoading(false);
    };
    loadProp();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-950 flex justify-center items-center text-[#C6A75E]">Carregando os detalhes deste imóvel...</div>;
  if (!property) return <Navigate to="/search" />;

  const ogImageUrl = property.image;
  const pageTitle = `${property.title} | ${property.neighborhood} | Frederico Neves`;

  // Function to create a valid Google Maps embed URL
  const mapQuery = encodeURIComponent(`${property.neighborhood}, ${property.location}`);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=${mapQuery}`;
  // NOTE: Because we don't assume external API keys, we will use a fallback map approach using an open iframe or styling.
  // Actually, standard google maps embed without API key:
  const freeMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=m&z=15&output=embed&iwloc=near`;

  return (
    <div className="pt-24 md:pt-28 min-h-screen bg-gray-950 text-white selection:bg-[#C6A75E] selection:text-gray-950 font-sans pb-24">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={property.desc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={property.desc} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:price:amount" content={property.price.toString()} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
        
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={property.image}
          alt={property.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full container-custom pb-12 z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link 
              to="/search" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-widest mb-6 group"
            >
              <ArrowLeft size={14} className="text-[#C6A75E] group-hover:-translate-x-1 transition-transform" />
              Voltar ao Portfólio
            </Link>
            <br />
            <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[#C6A75E] text-xs font-bold uppercase tracking-widest mb-4">
              {property.tag}
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-4 text-white">
              {property.title}
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-300 flex items-center gap-3">
              <MapPin className="text-[#C6A75E]" />
              {property.neighborhood}, {property.location}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-custom pt-12">
        <div className="grid lg:grid-cols-3 gap-16 relative">
          
          {/* Left Column (Details) */}
          <div className="lg:col-span-2">
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="prose prose-invert prose-lg max-w-none mb-16"
            >
              <h2 className="text-3xl font-light mb-6 text-[#C6A75E]">Uma visão do extraordinário</h2>
              <p className="text-gray-300 leading-relaxed font-light text-xl">
                {property.desc} Com atenção rigorosa aos detalhes e materiais de altíssimo padrão, 
                esta {property.tipo} foi concebida para quem aprecia o silêncio de uma obra-prima. 
                Cada ambiente flui com naturalidade, capturando luz e espaço para criar uma 
                experiência de moradia absolutamente ímpar em {property.location}.
              </p>
            </motion.div>
            
            {/* Specs */}
            <h3 className="text-2xl font-light mb-8 text-white border-b border-white/10 pb-4">Especificações e Infraestrutura</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 mb-16">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                <Ruler size={32} className="text-[#C6A75E] mb-3" />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Área Privativa</p>
                <p className="text-2xl font-light text-white">{property.sqft}m²</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                <Bed size={32} className="text-[#C6A75E] mb-3" />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Dormitórios</p>
                <p className="text-2xl font-light text-white">{property.beds}</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                <Bath size={32} className="text-[#C6A75E] mb-3" />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Banheiros</p>
                <p className="text-2xl font-light text-white">{property.baths}</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                <Car size={32} className="text-[#C6A75E] mb-3" />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Vagas</p>
                <p className="text-2xl font-light text-white">{property.garage}</p>
              </div>
            </div>
            
            {/* Features */}
            <h3 className="text-2xl font-light mb-8 text-white border-b border-white/10 pb-4">Destaques Únicos</h3>
            <ul className="grid md:grid-cols-2 gap-6 text-lg text-gray-300 mb-20">
              {property.features?.map(f => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-[#C6A75E] flex-shrink-0" />
                  <span className="font-light">{f}</span>
                </li>
              ))}
            </ul>

            {/* Gallery and Video Integration */}
            {(property.images?.length > 0 || property.videoUrl) && (
              <>
                <h3 className="text-2xl font-light mb-8 text-white border-b border-white/10 pb-4">Galeria e Tour Virtual</h3>
                
                {property.videoUrl && (
                  <div className="mb-12">
                    <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">Apresentação Exclusiva</p>
                    <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                      <video 
                        src={property.videoUrl} 
                        controls 
                        className="w-full h-full object-cover"
                        controlsList="nodownload"
                      >
                        Seu navegador não suporta a tag de vídeo.
                      </video>
                    </div>
                  </div>
                )}

                {property.images && property.images.length > 0 && (
                  <div className="mb-16">
                    <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">Fotos do Imóvel</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.images?.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block relative aspect-square overflow-hidden rounded-2xl group border border-white/10 bg-white/5 cursor-zoom-in">
                           <img 
                              src={img} 
                              alt={`Detalhe do Imóvel ${idx + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                           />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs uppercase tracking-widest font-bold">Ampliar</span>
                           </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Map Integration */}
            <h3 className="text-2xl font-light mb-8 text-white border-b border-white/10 pb-4">Localização Exata</h3>
            <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-white/5">
              {coords ? (
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Aproximando localização...
                  </div>
                }>
                  <MiniMap lat={coords.lat} lng={coords.lng} />
                </Suspense>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Aproximando localização...
                </div>
              )}
              <div className="absolute top-4 left-4 z-[400] px-4 py-2 bg-gray-950/80 backdrop-blur-md rounded-xl border border-white/10">
                 <p className="text-[#C6A75E] font-bold text-sm tracking-wide">{property.neighborhood}</p>
                 <p className="text-gray-400 text-xs">{property.location}</p>
              </div>
            </div>
          </div>
          
          {/* Right Column (Sticky CTA) */}
          <div className="lg:col-span-1 relative">
            <div className="sticky top-32 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
              <div className="w-full text-left mb-8">
                <p className="text-gray-400 text-sm uppercase tracking-widest mb-2 font-medium">Valor de Aquisição</p>
                <h2 className="text-4xl md:text-5xl font-light text-white mb-1">
                  <span className="text-2xl text-gray-400">R$</span> {(property.price / 1000000).toFixed(1)} <span className="text-3xl text-gray-400">Mi</span>
                </h2>
              </div>
              
              <div className="w-full h-[1px] bg-white/10 mb-8" />
              
              <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">
                Este ativo opera sob grande exclusividade. Fale com Frederico Neves para agendar um view privado e receber o dossier completo.
              </p>

              <a 
                href={`https://wa.me/553492515354?text=Olá%20Frederico,%20gostaria%20de%20receber%20o%20dossier%20privado%20do%20imóvel%20${property.title}%20(${property.neighborhood}).`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-gray-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20 mb-4"
              >
                <MessageCircle size={20} />
                Solicitar Dossier WhatsApp
              </a>

              <p className="text-xs text-gray-500 font-light mt-4">
                Resposta garantida em até 2 horas. Sigilo absoluto.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
