import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pencil, 
  Camera, 
  ShieldCheck, 
  Star, 
  Users, 
  Calendar, 
  Grid, 
  Award, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  Trash2, 
  Plus, 
  Play, 
  Upload, 
  Save,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Agent, Service, VerificationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../Snackbar';
import { updateAgentProfile, isVideoUrl } from '../../services/supabaseService';

export function getInitialsSvg(name: string) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#6C35A6" /><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

interface AgentProfileEditorProps {
  services: Service[];
  onOpenCreateService: () => void;
  onProfileUpdated?: () => void;
}

const NIGERIAN_STATES = [
  "Lagos", "FCT - Abuja", "Rivers", "Oyo", "Ogun", "Enugu", "Delta", "Anambra", "Edo", "Kaduna", "Kano", "Cross River", "Akwa Ibom"
];

const AgentProfileEditor: React.FC<AgentProfileEditorProps> = ({
  services,
  onOpenCreateService,
  onProfileUpdated
}) => {
  const { user, currentUser, profile, refreshProfile } = useAuth();
  const { showSnackbar } = useSnackbar();

  // Profile Form States
  const [fullName, setFullName] = useState(profile?.full_name || currentUser?.name || '');
  const [specialization, setSpecialization] = useState(profile?.specialization || 'Beauty Specialist');
  const [location, setLocation] = useState(profile?.location || 'Lagos, Nigeria');
  const [yearsExp, setYearsExp] = useState(profile?.years_exp?.toString() || '3');
  const [serviceType, setServiceType] = useState(profile?.service_type || 'hybrid');
  const [bio, setBio] = useState(profile?.bio || 'Passionate beauty specialist committed to luxury treatments and flawless aesthetics.');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || currentUser?.avatar || '');
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || '');
  const [gallery, setGallery] = useState<Array<{ type: 'image' | 'video'; url: string; thumbnail?: string }>>(
    Array.isArray(profile?.gallery) ? profile.gallery : []
  );

  // Modal / Inline Edit Dialog State
  const [activeEditModal, setActiveEditModal] = useState<
    'avatar' | 'banner' | 'basicInfo' | 'bio' | 'galleryAdd' | null
  >(null);
  const [tempUrl, setTempUrl] = useState('');
  const [tempType, setTempType] = useState<'image' | 'video'>('image');
  const [isSaving, setIsSaving] = useState(false);

  // File reader helper for direct uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'avatar') {
          setAvatarUrl(reader.result);
          setActiveEditModal(null);
        } else if (target === 'banner') {
          setBannerUrl(reader.result);
          setActiveEditModal(null);
        } else if (target === 'gallery') {
          const isVideo = file.type.startsWith('video/');
          setGallery(prev => [...prev, { type: isVideo ? 'video' : 'image', url: reader.result as string }]);
          setActiveEditModal(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all profile changes to Supabase
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);

    try {
      const res = await updateAgentProfile(user.id, {
        fullName: fullName.trim(),
        avatarUrl,
        bannerUrl,
        specialization: specialization.trim(),
        location: location.trim(),
        yearsExp: parseInt(yearsExp) || 0,
        serviceType,
        bio: bio.trim(),
        phone: phone.trim(),
        gallery
      });

      if (res.success) {
        showSnackbar('Profile updated successfully!', 'success');
        if (refreshProfile) await refreshProfile();
        if (onProfileUpdated) onProfileUpdated();
      } else {
        showSnackbar(res.error || 'Failed to update profile.', 'error');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveGalleryItem = (indexToRemove: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="relative">
      {/* Top Banner with Edit Button */}
      <div className="relative h-64 md:h-96 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-interactive/30 via-purple-600/20 to-black group shadow-md border border-[#E9ECEF] dark:border-[#2D2D2D]">
        {bannerUrl && bannerUrl.trim() !== '' ? (
          <img
            src={bannerUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Banner"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-interactive/40">
            <span className="font-serif font-bold text-xl">Banner Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Change Banner Button (Pencil Icon) */}
        <button
          onClick={() => {
            setTempUrl(bannerUrl);
            setActiveEditModal('banner');
          }}
          className="absolute top-4 right-4 px-4 py-2 bg-black/70 hover:bg-brand-interactive text-white rounded-2xl text-xs font-black backdrop-blur-md flex items-center space-x-2 border border-white/20 transition-all shadow-lg hover:scale-105"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit Banner</span>
        </button>
      </div>

      {/* Main Profile Grid mirroring Customer's AgentProfile view */}
      <div className="relative -mt-20 sm:-mt-28 md:-mt-40 z-10 px-2 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          
          {/* --- LEFT COLUMN: PROFILE CARD WITH PENCIL ICONS --- */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-background dark:bg-[#161616] rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border border-[#E9ECEF] dark:border-[#2D2D2D] relative"
            >
              {/* Quick Save Pill on Top */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-interactive bg-brand-interactive/10 px-3 py-1.5 rounded-xl border border-brand-interactive/30 shadow-[0_0_12px_rgba(108,53,166,0.2)]">
                  Live Preview & Edit
                </span>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-brand-interactive text-white rounded-xl text-xs font-black shadow-md hover:bg-brand-interactive/90 active:scale-95 transition-all flex items-center space-x-1"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save</span>
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                
                {/* Avatar with Pencil Icon */}
                <div className="relative mb-4 sm:mb-5 group">
                  <img
                    src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : getInitialsSvg(fullName)}
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 sm:border-6 border-white dark:border-[#1A1A1A] shadow-2xl"
                    alt={fullName}
                  />

                  {/* Pencil overlay button on avatar */}
                  <button
                    onClick={() => {
                      setTempUrl(avatarUrl);
                      setActiveEditModal('avatar');
                    }}
                    title="Change profile photo"
                    className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 bg-brand-interactive text-white rounded-2xl flex items-center justify-center border-2 border-white dark:border-[#1A1A1A] shadow-[0_0_12px_rgba(108,53,166,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                {/* Name with Pencil */}
                <div className="flex items-center justify-center space-x-2 group mb-1">
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                    {fullName || 'Your Name'}
                  </h1>
                  <button
                    onClick={() => setActiveEditModal('basicInfo')}
                    className="p-1 rounded-lg hover:bg-brand-interactive/10 text-[#6C757D] hover:text-brand-interactive transition-colors"
                    title="Edit Name & Details"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Specialization with Pencil */}
                <div className="flex items-center justify-center space-x-1.5 mb-4 text-xs">
                  <span className="text-[#6C757D] font-medium">Specialization:</span>
                  <span className="text-brand-interactive font-bold">{specialization}</span>
                  <button
                    onClick={() => setActiveEditModal('basicInfo')}
                    className="p-1 text-[#6C757D] hover:text-brand-interactive"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>

                {/* Verified Status Badge */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center space-x-1.5 bg-green-500/10 text-green-500 border border-green-500/30 px-3 py-1.5 rounded-xl text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Professional</span>
                  </div>
                </div>

                {/* Key Stats Row (Experience, Services, Location) */}
                <div className="w-full grid grid-cols-3 gap-2 py-4 mb-6 border-y border-[#E9ECEF] dark:border-[#2D2D2D]">
                  <div className="flex flex-col items-center justify-center relative group">
                    <div className="flex items-center">
                      <span className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                        {yearsExp}
                      </span>
                      <span className="text-brand-interactive text-sm font-black ml-0.5">y</span>
                      <button
                        onClick={() => setActiveEditModal('basicInfo')}
                        className="opacity-0 group-hover:opacity-100 p-0.5 ml-1 text-[#6C757D] hover:text-brand-interactive transition-opacity"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[#6C757D] font-bold">Experience</span>
                  </div>

                  <div className="flex flex-col items-center justify-center border-x border-[#E9ECEF] dark:border-[#2D2D2D]">
                    <span className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                      {services.length}
                    </span>
                    <span className="text-[10px] text-[#6C757D] font-bold">Services</span>
                  </div>

                  <div className="flex flex-col items-center justify-center relative group">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-brand-interactive mr-1 shrink-0" />
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate max-w-[70px]">
                        {location}
                      </span>
                      <button
                        onClick={() => setActiveEditModal('basicInfo')}
                        className="opacity-0 group-hover:opacity-100 p-0.5 ml-1 text-[#6C757D] hover:text-brand-interactive transition-opacity"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[#6C757D] font-bold">Location</span>
                  </div>
                </div>

                {/* Service Type Selector */}
                <div className="w-full mb-6">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-[#6C757D] mb-2">
                    <span>Service Delivery</span>
                    <Pencil className="w-3 h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-brand-surface dark:bg-[#202020] rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]">
                    {(['mobile', 'salon', 'hybrid'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setServiceType(type)}
                        className={`py-2 rounded-xl text-[11px] font-black capitalize transition-all ${
                          serviceType === type
                            ? 'bg-brand-interactive text-white shadow-md'
                            : 'text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save All Profile Button */}
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-3.5 bg-brand-interactive text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-interactive/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: BIO, SERVICES, AND PORTFOLIO --- */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10 pb-12">
            
            {/* Bio Section with Pencil */}
            <section className="bg-brand-background dark:bg-[#161616] p-6 sm:p-8 rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm relative group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-brand-interactive/10 text-brand-interactive">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                    Specialist Bio
                  </h3>
                </div>
                <button
                  onClick={() => setActiveEditModal('bio')}
                  className="px-3 py-1.5 rounded-xl bg-brand-surface dark:bg-[#202020] text-xs font-bold text-brand-interactive hover:bg-brand-interactive hover:text-white transition-all flex items-center space-x-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Bio</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] border border-transparent hover:border-brand-interactive/20 transition-all">
                <p className="text-sm sm:text-base leading-relaxed text-[#6C757D] dark:text-[#C0C0C0] italic">
                  "{bio}"
                </p>
              </div>
            </section>

            {/* Services Offered Section with Direct "Add Service" */}
            <section className="bg-brand-background dark:bg-[#161616] p-6 sm:p-8 rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-brand-interactive/10 text-brand-interactive">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                      Your Services ({services.length})
                    </h3>
                    <p className="text-xs text-[#6C757D]">Active offerings visible on your public boutique</p>
                  </div>
                </div>

                <button
                  onClick={onOpenCreateService}
                  className="px-4 py-2.5 rounded-2xl bg-brand-interactive text-white text-xs font-black hover:bg-brand-interactive/90 transition-all flex items-center space-x-1.5 shadow-md shadow-brand-interactive/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Service</span>
                </button>
              </div>

              {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(service => (
                    <div
                      key={service.id}
                      className="p-4 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] border border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center space-x-3.5 shadow-sm"
                    >
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-black text-xs shrink-0">
                          {service.category.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase text-brand-interactive">
                          {service.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white truncate">
                          {service.name}
                        </h4>
                        <div className="text-sm font-black text-brand-interactive mt-0.5">
                          ₦{service.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-[#6C757D] mb-3">No services published yet.</p>
                  <button
                    onClick={onOpenCreateService}
                    className="px-4 py-2 bg-brand-interactive text-white rounded-xl text-xs font-bold"
                  >
                    Create Your First Service
                  </button>
                </div>
              )}
            </section>

            {/* Portfolio & Creations Gallery Section with Photos & Videos Uploader */}
            <section className="bg-brand-background dark:bg-[#161616] p-6 sm:p-8 rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-brand-interactive/10 text-brand-interactive">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                      Portfolio & Media ({gallery.length})
                    </h3>
                    <p className="text-xs text-[#6C757D]">Photos and transformation videos</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTempUrl('');
                    setActiveEditModal('galleryAdd');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-brand-interactive/10 hover:bg-brand-interactive text-brand-interactive hover:text-white text-xs font-black transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Media</span>
                </button>
              </div>

              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {gallery.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-black group border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm"
                    >
                      {item.type === 'video' || isVideoUrl(item.url) ? (
                        <div className="relative w-full h-full">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                            <Play className="w-8 h-8 text-white/70" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}

                      {/* Remove media button with trash icon */}
                      <button
                        onClick={() => handleRemoveGalleryItem(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 shadow-lg"
                        title="Delete photo/video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#6C757D] bg-brand-surface dark:bg-[#1E1E1E] rounded-2xl border border-dashed border-[#E9ECEF] dark:border-[#2D2D2D]">
                  <p className="text-xs mb-3">No portfolio media uploaded yet.</p>
                  <button
                    onClick={() => setActiveEditModal('galleryAdd')}
                    className="px-4 py-2 bg-brand-interactive text-white rounded-xl text-xs font-bold"
                  >
                    Add Photos or Videos
                  </button>
                </div>
              )}
            </section>

          </div>
        </div>
      </div>

      {/* --- EDIT MODALS --- */}

      {/* 1. Avatar Edit Modal */}
      <AnimatePresence>
        {activeEditModal === 'avatar' && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-white">Change Profile Photo</h3>
                <button onClick={() => setActiveEditModal(null)}><X className="w-5 h-5 text-[#6C757D]" /></button>
              </div>

              <div className="space-y-4">
                <label className="block p-4 rounded-2xl border-2 border-dashed border-brand-interactive/40 hover:border-brand-interactive bg-brand-interactive/5 text-center cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-brand-interactive mx-auto mb-2" />
                  <span className="text-xs font-bold text-brand-interactive">Upload from Computer / Phone</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, 'avatar')}
                    className="hidden"
                  />
                </label>

                <div className="relative">
                  <span className="block text-[11px] font-bold text-[#6C757D] uppercase mb-1">Or paste image URL</span>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={tempUrl}
                    onChange={e => setTempUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveEditModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C757D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (tempUrl.trim()) setAvatarUrl(tempUrl.trim());
                      setActiveEditModal(null);
                    }}
                    className="px-5 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black shadow-md"
                  >
                    Set Photo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Banner Edit Modal */}
      <AnimatePresence>
        {activeEditModal === 'banner' && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-white">Change Cover Banner</h3>
                <button onClick={() => setActiveEditModal(null)}><X className="w-5 h-5 text-[#6C757D]" /></button>
              </div>

              <div className="space-y-4">
                <label className="block p-4 rounded-2xl border-2 border-dashed border-brand-interactive/40 hover:border-brand-interactive bg-brand-interactive/5 text-center cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-brand-interactive mx-auto mb-2" />
                  <span className="text-xs font-bold text-brand-interactive">Upload Banner from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>

                <div>
                  <span className="block text-[11px] font-bold text-[#6C757D] uppercase mb-1">Or paste image URL</span>
                  <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={tempUrl}
                    onChange={e => setTempUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveEditModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C757D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (tempUrl.trim()) setBannerUrl(tempUrl.trim());
                      setActiveEditModal(null);
                    }}
                    className="px-5 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black shadow-md"
                  >
                    Set Banner
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Basic Info Edit Modal */}
      <AnimatePresence>
        {activeEditModal === 'basicInfo' && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-white">Edit Profile Details</h3>
                <button onClick={() => setActiveEditModal(null)}><X className="w-5 h-5 text-[#6C757D]" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    placeholder="e.g. Bridal Makeup & Hairstyling"
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1">Location / State</label>
                    <select
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white cursor-pointer"
                    >
                      {NIGERIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1">Years Experience</label>
                    <input
                      type="number"
                      value={yearsExp}
                      onChange={e => setYearsExp(e.target.value)}
                      min="0"
                      className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1">WhatsApp / Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +234 800 000 0000"
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveEditModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C757D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setActiveEditModal(null)}
                    className="px-5 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black shadow-md"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Bio Edit Modal */}
      <AnimatePresence>
        {activeEditModal === 'bio' && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-white">Edit Specialist Bio</h3>
                <button onClick={() => setActiveEditModal(null)}><X className="w-5 h-5 text-[#6C757D]" /></button>
              </div>

              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-4 bg-brand-surface dark:bg-[#121212] rounded-2xl text-xs sm:text-sm border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white resize-none"
                  placeholder="Tell clients about your background, training, favorite beauty styles, and passion..."
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setActiveEditModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C757D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setActiveEditModal(null)}
                    className="px-5 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black shadow-md"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Add Media to Portfolio Modal (Photos & Videos) */}
      <AnimatePresence>
        {activeEditModal === 'galleryAdd' && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-white">Add Portfolio Media</h3>
                <button onClick={() => setActiveEditModal(null)}><X className="w-5 h-5 text-[#6C757D]" /></button>
              </div>

              <div className="space-y-4">
                {/* Upload File */}
                <label className="block p-4 rounded-2xl border-2 border-dashed border-brand-interactive/40 hover:border-brand-interactive bg-brand-interactive/5 text-center cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-brand-interactive mx-auto mb-2" />
                  <span className="text-xs font-bold text-brand-interactive">Upload Photo or Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={e => handleFileUpload(e, 'gallery')}
                    className="hidden"
                  />
                </label>

                {/* Direct URL */}
                <div>
                  <span className="block text-[11px] font-bold text-[#6C757D] uppercase mb-1">Or Paste Media URL</span>
                  <input
                    type="url"
                    placeholder="https://example.com/video.mp4 or photo.jpg"
                    value={tempUrl}
                    onChange={e => setTempUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#121212] rounded-xl text-xs border border-[#E9ECEF] dark:border-[#2D2D2D] outline-none text-[#1A1A1A] dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveEditModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C757D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (tempUrl.trim()) {
                        const isVid = isVideoUrl(tempUrl.trim());
                        setGallery(prev => [...prev, { type: isVid ? 'video' : 'image', url: tempUrl.trim() }]);
                      }
                      setActiveEditModal(null);
                    }}
                    className="px-5 py-2 bg-brand-interactive text-white rounded-xl text-xs font-black shadow-md"
                  >
                    Add to Gallery
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AgentProfileEditor;
