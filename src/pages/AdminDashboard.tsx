import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Plus, Edit2, EyeOff, Eye, Trash2, Building2, Search, ArrowLeft, Share2, Loader2, MapPin, Globe, Save } from 'lucide-react';
import { PROPERTIES as SEED_PROPERTIES } from '../constants'; // For initial seeding
import { Property } from '../types';
import { geocodeAddress } from '../services/geocodingService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleShareLink = (id: string) => {
    const link = `${window.location.origin}/imovel/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copiado para a área de transferência!');
    }).catch(err => {
      prompt('Copie o link abaixo:', link);
    });
  };
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  
  const [search, setSearch] = useState('');
  
  // Edit/Create state
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'media'>('info');
  const [saving, setSaving] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      e.target.value = ''; // clear input buffer
      setSaving(true);
      setUploadPercent(0);

      try {
        const uploadProgress: { [key: number]: number } = {};
        
        const uploadPromises = files.map((file, index) => {
          return new Promise<string>((resolve, reject) => {
            const fileRef = ref(storage, `properties/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                uploadProgress[index] = progress;
                
                // Calculate total progress
                const totalProgress = Object.values(uploadProgress).reduce((acc, curr) => acc + curr, 0) / files.length;
                setUploadPercent(Math.round(totalProgress));
              },
              (error) => {
                reject(error);
              },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              }
            );
          });
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        
        setEditingProp(prev => {
          if (!prev) return prev;
          const updatedImages = [...(prev.images || []), ...uploadedUrls];
          return {
            ...prev,
            images: updatedImages,
            image: updatedImages.length > 0 ? updatedImages[0] : prev.image
          };
        });
      } catch (err) {
        console.error("Erro ao subir imagens:", err);
        alert("Ocorreu um erro ao enviar as imagens.");
      } finally {
        setSaving(false);
        setUploadPercent(0);
      }
    }
  };

  const removeExistingImage = (urlToRemove: string) => {
    if (!editingProp || !editingProp.images) return;
    setEditingProp({
      ...editingProp,
      images: editingProp.images.filter((url: string) => url !== urlToRemove),
      image: editingProp.image === urlToRemove ? (editingProp.images.find((u: string) => u !== urlToRemove) || '') : editingProp.image
    });
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      e.target.value = '';
      
      setSaving(true);
      try {
         setUploadPercent(0);
         const fileRef = ref(storage, `videos/${Date.now()}_${file.name}`);
         const uploadTask = uploadBytesResumable(fileRef, file);
         
         await new Promise<string>((resolve, reject) => {
             uploadTask.on('state_changed', 
                (snapshot) => setUploadPercent(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
                (error) => reject(error),
                async () => {
                     const url = await getDownloadURL(uploadTask.snapshot.ref);
                     setEditingProp(prev => prev ? {...prev, videoUrl: url} : prev);
                     resolve(url);
                }
             )
         });
      } catch (err) {
         console.error("Erro ao subir vídeo:", err);
         alert("Ocorreu um erro ao enviar o vídeo.");
      } finally {
         setSaving(false);
         setUploadPercent(0);
      }
    }
  };

  // --- Drag and Drop Handlers for Reordering ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('sourceIndex', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    if (!sourceIndexStr) return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (sourceIndex === targetIndex) return;
    if (!editingProp || !editingProp.images) return;

    const newImages = [...editingProp.images];
    const [removed] = newImages.splice(sourceIndex, 1);
    newImages.splice(targetIndex, 0, removed);

    setEditingProp({
      ...editingProp,
      images: newImages,
      image: newImages.length > 0 ? newImages[0] : editingProp.image
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoadingUser(false);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (user) fetchProperties();
  }, [user]);

  useEffect(() => {
    const event = new CustomEvent('force-nav-hide', { detail: { hide: isModalOpen } });
    window.dispatchEvent(event);
    return () => {
      const resetEvent = new CustomEvent('force-nav-hide', { detail: { hide: false } });
      window.dispatchEvent(resetEvent);
    };
  }, [isModalOpen]);

  const fetchProperties = async () => {
    setLoadingProps(true);
    try {
      const q = query(collection(db, 'properties'));
      const snapshot = await getDocs(q);
      const props: Property[] = [];
      snapshot.forEach(doc => {
        props.push({ id: doc.id, ...doc.data() } as Property);
      });
      
      // Auto-sync if database is totally empty
      if (props.length === 0) {
        for (const p of SEED_PROPERTIES) {
          const propToInsert: any = {
            title: p.title,
            desc: p.desc,
            price: typeof p.price === 'string' ? parseFloat((p.price as string).replace(/,/g, '')) : p.price,
            location: p.location,
            neighborhood: p.neighborhood,
            beds: p.beds || 0,
            baths: p.baths || 0,
            sqft: p.sqft || 0,
            garage: p.garage || 0,
            tipo: p.tipo,
            tag: p.tag || '',
            image: p.image,
            images: [],
            videoUrl: '',
            isUnlisted: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          await setDoc(doc(db, 'properties', p.id), propToInsert);
          props.push({ id: p.id, ...propToInsert } as Property);
        }
      }
      
      setProperties(props);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar imóveis. Verifique as permissões.');
    } finally {
      setLoadingProps(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // --- CRUD Functions ---
  const openEdit = (p: Property) => {
    setActiveTab('info');
    setEditingProp(p);
    setUploadPercent(0);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setActiveTab('info');
    setEditingProp({
      id: '',
      title: '',
      desc: '',
      price: 0,
      location: '',
      neighborhood: '',
      beds: 0,
      baths: 0,
      sqft: 0,
      area_m2: 0,
      garage: 0,
      tipo: 'Apartamento',
      tag: 'Lançamento',
      address: '',
      latitude: 0,
      longitude: 0,
      luxury_flag: false,
      status: 'available',
      image: '',
      images: [],
      videoUrl: '',
      isUnlisted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as Property);
    setUploadPercent(0);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Tem certeza que deseja DELETAR este imóvel publicamente do banco de dados?')) return;
    try {
      await deleteDoc(doc(db, 'properties', id));
      alert('Imóvel excluído!');
      fetchProperties();
    } catch (e) {
      console.error(e);
      alert('Erro ao deletar.');
    }
  };

  const handleToggleUnlisted = async (p: Property) => {
    try {
      await updateDoc(doc(db, 'properties', p.id!), {
        isUnlisted: !p.isUnlisted,
        updatedAt: Date.now()
      });
      fetchProperties();
    } catch(e) {
      console.error(e);
      alert('Erro ao alterar visibilidade.');
    }
  };

  const saveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setSaving(true);
    
    try {
      // Auto-geocode if coordinates are missing but address exists
      let finalLat = editingProp.latitude;
      let finalLng = editingProp.longitude;

      if ((!finalLat || !finalLng) && editingProp.address) {
        const geo = await geocodeAddress(editingProp.address, editingProp.neighborhood, editingProp.location);
        if (geo) {
          finalLat = geo.lat;
          finalLng = geo.lng;
        }
      }

      // Main image is the first one in the list
      const finalImages = editingProp.images || [];
      const mainImage = finalImages.length > 0 ? finalImages[0] : (editingProp.image || '');

      const dataToSave = { 
        ...editingProp, 
        image: mainImage,
        images: finalImages,
        latitude: finalLat || 0,
        longitude: finalLng || 0,
        updatedAt: Date.now() 
      };
      
      if (dataToSave.id) {
        const { id, ...rest } = dataToSave;
        await updateDoc(doc(db, 'properties', id), rest);
        alert('Imóvel atualizado com sucesso!');
      } else {
        dataToSave.createdAt = Date.now();
        await addDoc(collection(db, 'properties'), dataToSave);
        alert('Imóvel cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchProperties();
    } catch (error) {
      console.error(error);
      alert('Falha ao salvar. Verifique se tem acesso.');
    } finally {
        setSaving(false);
    }
  };


  if (loadingUser) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-[#C6A75E]">Carregando...</div>;
  if (!user) return null;

  const filteredProps = (properties || []).filter(p => (p.title?.toLowerCase().includes(search.toLowerCase())) || (p.neighborhood?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white pb-24 selection:bg-[#C6A75E] selection:text-gray-950 pt-28">
      <div className="container-custom max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-serif text-[#C6A75E]">Admin Terminal</h1>
            <p className="text-sm text-gray-400 mt-1">Gerenciamento de banco de dados e vitrine ({user.email})</p>
          </div>
          <div className="flex items-center gap-4">
             <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              Ver Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
           <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar imóvel por nome ou bairro..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C6A75E] transition-colors"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={openCreate}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C6A75E] hover:bg-[#b09452] text-gray-950 rounded-lg text-sm font-bold transition-all w-full md:w-auto shadow-lg shadow-[#C6A75E]/20"
            >
              <Plus size={18} />
              Novo Imóvel
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {loadingProps ? (
          <div className="py-24 text-center text-gray-500">
             Carregando catálogo direto da nuvem...
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                     <th className="p-4 pl-6 font-medium">Imóvel</th>
                     <th className="p-4 font-medium">Bairro</th>
                     <th className="p-4 font-medium">Preço</th>
                     <th className="p-4 font-medium">Status</th>
                     <th className="p-4 pr-6 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProps?.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                           {p.image ? (
                             <img src={p.image} className="w-12 h-12 rounded object-cover border border-white/10" alt={p.title} />
                           ) : (
                             <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center"><Building2 size={16} className="text-gray-500"/></div>
                           )}
                           <div>
                             <p className="font-semibold text-white text-sm">{p.title}</p>
                             <p className="text-xs text-gray-500">{p.tipo} • {p.beds} dorm.</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{p.neighborhood}</td>
                      <td className="p-4 text-sm text-[#C6A75E] font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${p.isUnlisted ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {p.isUnlisted ? 'Oculto (Link Direto)' : 'Público'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button 
                          onClick={() => handleShareLink(p.id!)}
                          title="Copiar Link"
                          className="p-2 text-green-400 hover:text-white bg-green-900/20 hover:bg-green-800/50 rounded-md transition-colors inline-flex"
                        >
                          <Share2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleUnlisted(p)}
                          title={p.isUnlisted ? "Tornar Público" : "Tornar Oculto"}
                          className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-md transition-colors inline-flex"
                        >
                          {p.isUnlisted ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          onClick={() => openEdit(p)}
                          title="Editar Dados"
                          className="p-2 text-blue-400 hover:text-white bg-blue-900/20 hover:bg-blue-800/50 rounded-md transition-colors inline-flex"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id!)}
                          title="Excluir Definitivamente"
                          className="p-2 text-red-400 hover:text-white bg-red-900/20 hover:bg-red-800/50 rounded-md transition-colors inline-flex"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProps.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                        Nenhum imóvel encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gray-950">
               <h2 className="text-xl font-serif text-[#C6A75E]">{editingProp.id ? 'Editar Imóvel' : 'Novo Imóvel'}</h2>
               <div className="flex bg-white/5 p-1 rounded-lg">
                 <button 
                    type="button" 
                    onClick={() => setActiveTab('info')} 
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 'info' ? 'bg-[#C6A75E] text-gray-900' : 'text-gray-400 hover:text-white'}`}
                 >
                    Dados Gerais
                 </button>
                 <button 
                    type="button" 
                    onClick={() => setActiveTab('media')} 
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 'media' ? 'bg-[#C6A75E] text-gray-900' : 'text-gray-400 hover:text-white'}`}
                 >
                    Mídia & Galeria
                 </button>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2">✕</button>
            </div>
            
            <form onSubmit={saveProperty} className="overflow-y-auto p-6 flex-1 custom-scrollbar">
               
               {activeTab === 'info' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Basic Info */}
                   <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2">Informações Iniciais</h3>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Título do Imóvel</label>
                        <input required type="text" value={editingProp.title} onChange={e => setEditingProp({...editingProp, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Preço (R$)</label>
                          <input required type="number" value={editingProp.price} onChange={e => setEditingProp({...editingProp, price: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Tag (Ex: Lançamento)</label>
                          <input type="text" value={editingProp.tag} onChange={e => setEditingProp({...editingProp, tag: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Cidade</label>
                          <input required type="text" value={editingProp.location} onChange={e => setEditingProp({...editingProp, location: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Bairro</label>
                          <input required type="text" value={editingProp.neighborhood} onChange={e => setEditingProp({...editingProp, neighborhood: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Endereço Completo (Para o Mapa)</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C6A75E]" />
                          <input required type="text" placeholder="Rua, Número - Bairro, Cidade" value={editingProp.address || ''} onChange={e => setEditingProp({...editingProp, address: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Latitude (Opcional)</label>
                          <input type="number" step="any" placeholder="Auto-gerado se vazio" value={editingProp.latitude || ''} onChange={e => setEditingProp({...editingProp, latitude: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Longitude (Opcional)</label>
                          <input type="number" step="any" placeholder="Auto-gerado se vazio" value={editingProp.longitude || ''} onChange={e => setEditingProp({...editingProp, longitude: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                      </div>
                   </div>

                   {/* Specs */}
                   <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2">Especificações</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                          <select value={editingProp.tipo} onChange={e => setEditingProp({...editingProp, tipo: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white">
                            <option>Apartamento</option>
                            <option>Casa</option>
                            <option>Cobertura</option>
                            <option>Loteamento</option>
                            <option>Villa</option>
                            <option>Design</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Status</label>
                          <select value={editingProp.status} onChange={e => setEditingProp({...editingProp, status: e.target.value as any})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white">
                            <option value="available">Disponível</option>
                            <option value="sold">Vendido</option>
                            <option value="reserved">Reservado</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs text-gray-400 mb-1">Metragem (m²)</label>
                           <input type="number" value={editingProp.area_m2 || editingProp.sqft} onChange={e => setEditingProp({...editingProp, area_m2: Number(e.target.value), sqft: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-400 mb-1">Vagas</label>
                           <input type="number" value={editingProp.garage} onChange={e => setEditingProp({...editingProp, garage: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                           <label className="block text-xs text-gray-400 mb-1">Quartos</label>
                           <input type="number" value={editingProp.beds} onChange={e => setEditingProp({...editingProp, beds: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-400 mb-1">Banheiros</label>
                           <input type="number" value={editingProp.baths} onChange={e => setEditingProp({...editingProp, baths: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-400 mb-1">Vagas</label>
                           <input type="number" value={editingProp.garage} onChange={e => setEditingProp({...editingProp, garage: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-[#C6A75E] outline-none text-white" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Descrição Persuasiva do Imóvel</label>
                        <textarea required rows={5} value={editingProp.desc} onChange={e => setEditingProp({...editingProp, desc: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#C6A75E] outline-none text-white resize-none" placeholder="Escreva o texto focado em vender este imóvel..."></textarea>
                      </div>

                      <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" checked={editingProp.luxury_flag} onChange={e => setEditingProp({...editingProp, luxury_flag: e.target.checked})} className="w-4 h-4 text-[#C6A75E] bg-black border-gray-600 rounded focus:ring-[#C6A75E] focus:ring-2" />
                        <span className="text-sm font-medium text-white">Selo de Luxo (Destaque no Mapa)</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" checked={editingProp.isUnlisted} onChange={e => setEditingProp({...editingProp, isUnlisted: e.target.checked})} className="w-4 h-4 text-[#C6A75E] bg-black border-gray-600 rounded focus:ring-[#C6A75E] focus:ring-2" />
                        <span className="text-sm font-medium text-white">Privado / Link Oculto</span>
                      </label>

                   </div>
                 </div>
               )}

               {activeTab === 'media' && (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Gerenciador de Imagens</h3>
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-dashed border-white/20">
                          <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-[#C6A75E] file:text-gray-950 hover:file:bg-[#b09452] transition-colors cursor-pointer" />
                        </div>
                        
                        {/* Exibir imagens já salvas (se for edição) */}
                        {editingProp.images && editingProp.images.length > 0 && (
                          <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                             <p className="text-xs text-[#C6A75E] uppercase font-bold tracking-widest mb-4">Fotos Publicadas (Arraste para reordenar)</p>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                               {editingProp.images?.map((imgUrl, idx) => (
                                 <div 
                                    key={imgUrl} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 cursor-move bg-gray-900 transition-all hover:ring-2 hover:ring-[#C6A75E]"
                                 >
                                    <img src={imgUrl} draggable={false} alt="Saved" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-white font-bold bg-black/80 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-2">
                                            <span>☰</span> Mover
                                        </span>
                                    </div>
                                    {idx === 0 && (
                                        <div className="absolute top-2 left-2 bg-[#C6A75E] text-gray-950 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-lg pointer-events-none">
                                            Capa Principal
                                        </div>
                                    )}
                                    <button type="button" onClick={() => removeExistingImage(imgUrl)} className="absolute top-2 right-2 bg-red-500/90 text-white w-6 h-6 flex items-center justify-center text-sm hover:scale-110 shadow-lg rounded-full transition-transform z-10">&times;</button>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}

                      </div>
                    </div>

                     <div className="mt-6">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Tour Virtual /  Vídeo</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-dashed border-white/20">
                          <input type="file" accept="video/*" onChange={handleVideoSelect} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-colors cursor-pointer" />
                        </div>
                        
                        {editingProp.videoUrl && (
                          <div className="relative flex items-center justify-between mt-2 bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
                             <div>
                                <span className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Vídeo ativo no momento</span>
                                <a href={editingProp.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-white hover:underline truncate inline-block max-w-[200px] md:max-w-md">Ver Vídeo Salvo</a>
                             </div>
                             <button type="button" onClick={() => setEditingProp({...editingProp, videoUrl: ''})} className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 text-xs uppercase font-bold tracking-widest hover:bg-red-500 hover:text-white transition-colors">Remover Definitivamente</button>
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
               )}
               
               <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-end gap-3">
                 {saving && (
                   <div className="w-full max-w-sm mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Sincronizando Mídia em Alta Resolução...</span>
                        <span>{uploadPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#C6A75E] h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadPercent}%` }}></div>
                      </div>
                   </div>
                 )}
                 <div className="flex gap-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} disabled={saving} className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                     Cancelar
                   </button>
                   <button type="submit" disabled={saving} className="px-8 py-2.5 bg-[#C6A75E] hover:bg-[#b09452] text-gray-950 font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                     {saving ? 'Finalizando...' : `Salvar as Informações da Propriedade`}
                   </button>
                 </div>
               </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
