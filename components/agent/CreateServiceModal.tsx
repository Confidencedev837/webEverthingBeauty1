import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Video as VideoIcon, 
  Image as ImageIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { useSnackbar } from '../Snackbar';
import { createService, isVideoUrl } from '../../services/supabaseService';
import { Service } from '../../types';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name?: string;
}

interface CreateServiceModalProps {
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdService: Partial<Service>) => void;
}

const CATEGORIES = [
  'Hair Styling',
  'Makeup Artistry',
  'Nails & Pedicure',
  'Skincare & Spa',
  'Barbering',
  'Lashes & Brows',
  'Bridal Glam',
  'Massage & Wellness'
];

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  agentId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showSnackbar } = useSnackbar();

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [durationMins, setDurationMins] = useState('60');
  const [description, setDescription] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Professional beauty setup',
    'Sanitized equipment',
    'Consultation included'
  ]);

  // Media Management
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Service name is required';
    } else if (name.trim().length < 3) {
      errs.name = 'Name must be at least 3 characters';
    }

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum < 500) {
      errs.price = 'Please enter a valid price (minimum ₦500)';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length < 30) {
      errs.description = `Description must be at least 30 characters (currently ${description.trim().length}/30)`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Add Feature Tag
  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures(prev => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (tagToRemove: string) => {
    setFeatures(prev => prev.filter(f => f !== tagToRemove));
  };

  // Add Media by URL
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    const type = isVideoUrl(url) ? 'video' : 'image';
    setMediaItems(prev => [
      ...prev,
      { id: Date.now().toString() + Math.random(), type, url, name: 'Web Link' }
    ]);
    setUrlInput('');
  };

  // Add Media by Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaItems(prev => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              type: isVideo ? 'video' : 'image',
              url: reader.result as string,
              name: file.name
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove Media Item
  const handleRemoveMedia = (idToRemove: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!agentId) return;

    setIsSubmitting(true);

    try {
      const priceNum = parseFloat(price) || 0;
      const durationNum = parseInt(durationMins) || 60;
      const imageUrls = mediaItems.map(m => m.url);

      const res = await createService({
        agentId,
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        durationMins: durationNum,
        imageUrl: imageUrls,
        features
      });

      if (res.success) {
        showSnackbar('Service created successfully! Your service is now live.', 'success');
        onSuccess({
          id: res.data?.id || `new-${Date.now()}`,
          name: name.trim(),
          category,
          price: priceNum,
          image: imageUrls[0] || ''
        });
      } else {
        showSnackbar(res.error || 'Failed to create service. Please check details.', 'error');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const descLength = description.trim().length;
  const isDescValid = descLength >= 30;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#161616] rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] z-10 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECEF] dark:border-[#2D2D2D] mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 text-brand-interactive" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                Create New Service
              </h2>
              <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0]">
                Publish a beauty offering directly to your catalogue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#6C757D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-1.5">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Deluxe Bridal Glam & Hair Styling"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`w-full px-4 py-3 bg-brand-surface dark:bg-[#1E1E1E] rounded-2xl border ${
                errors.name ? 'border-red-500' : 'border-[#E9ECEF] dark:border-[#2D2D2D]'
              } focus:border-brand-interactive outline-none text-sm text-[#1A1A1A] dark:text-white transition-all`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Category, Price & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-3 bg-brand-surface dark:bg-[#1E1E1E] rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive outline-none text-xs sm:text-sm text-[#1A1A1A] dark:text-white font-medium cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-1.5">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={price}
                onChange={e => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                }}
                className={`w-full px-4 py-3 bg-brand-surface dark:bg-[#1E1E1E] rounded-2xl border ${
                  errors.price ? 'border-red-500' : 'border-[#E9ECEF] dark:border-[#2D2D2D]'
                } focus:border-brand-interactive outline-none text-sm text-[#1A1A1A] dark:text-white transition-all`}
              />
              {errors.price && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{errors.price}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-1.5">
                Duration (Mins)
              </label>
              <select
                value={durationMins}
                onChange={e => setDurationMins(e.target.value)}
                className="w-full px-3.5 py-3 bg-brand-surface dark:bg-[#1E1E1E] rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive outline-none text-xs sm:text-sm text-[#1A1A1A] dark:text-white font-medium cursor-pointer"
              >
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">60 mins (1 hr)</option>
                <option value="90">90 mins (1.5 hrs)</option>
                <option value="120">120 mins (2 hrs)</option>
                <option value="180">180 mins (3 hrs)</option>
              </select>
            </div>
          </div>

          {/* Description with Required 30+ Chars Validation & Hint Advice */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-black ${isDescValid ? 'text-green-500' : 'text-amber-500'}`}>
                {descLength} / 30 min characters
              </span>
            </div>

            <textarea
              placeholder="Describe what is included in this session, styling products used, skin/hair preparation required, and what your client can look forward to..."
              rows={4}
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (errors.description && e.target.value.trim().length >= 30) {
                  setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              className={`w-full p-4 bg-brand-surface dark:bg-[#1E1E1E] rounded-2xl border ${
                errors.description ? 'border-red-500' : 'border-[#E9ECEF] dark:border-[#2D2D2D]'
              } focus:border-brand-interactive outline-none text-sm text-[#1A1A1A] dark:text-white resize-none transition-all`}
            />

            {/* Hint Advice Box */}
            <div className="mt-2 p-3 rounded-2xl bg-brand-interactive/5 border border-brand-interactive/20 flex items-start space-x-2.5">
              <HelpCircle className="w-4 h-4 text-brand-interactive shrink-0 mt-0.5" />
              <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] leading-relaxed">
                <span className="font-bold text-brand-interactive">Advice for Agents: </span>
                A better description usually attracts more customers! Highlighting premium products, session hygiene, and complimentary touch-ups builds trust and leads to higher booking conversion.
              </p>
            </div>

            {errors.description && (
              <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Features / Inclusions Tags */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-1.5">
              What's Included / Highlights
            </label>
            <div className="flex items-center space-x-2 mb-2.5">
              <input
                type="text"
                placeholder="e.g. Free lashes, Premium foundation, Travel to doorstep"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-brand-surface dark:bg-[#1E1E1E] rounded-xl border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive outline-none text-xs text-[#1A1A1A] dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2.5 bg-brand-interactive text-white rounded-xl text-xs font-black hover:bg-brand-interactive/90 transition-all shrink-0"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {features.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-brand-interactive/10 text-brand-interactive border border-brand-interactive/30 shadow-[0_0_10px_rgba(108,53,166,0.15)]"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Media Section: Photos & Videos with Parser, Live Preview, and Removal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                Photos & Videos Showcase
              </label>
              <span className="text-[11px] text-[#6C757D]">
                {mediaItems.length} media item{mediaItems.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Media Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* Local File Picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl border-2 border-dashed border-[#E9ECEF] dark:border-[#2D2D2D] hover:border-brand-interactive bg-brand-surface/50 dark:bg-[#1A1A1A]/50 flex items-center justify-center space-x-2 text-xs font-bold text-[#1A1A1A] dark:text-white transition-all group"
              >
                <Upload className="w-4 h-4 text-brand-interactive group-hover:-translate-y-0.5 transition-transform" />
                <span>Upload Photos or Videos</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* URL Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  placeholder="Or paste image / video URL"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  className="flex-1 px-3.5 py-3 bg-brand-surface dark:bg-[#1E1E1E] rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] focus:border-brand-interactive outline-none text-xs text-[#1A1A1A] dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-3 bg-brand-interactive text-white rounded-2xl text-xs font-black shrink-0 hover:bg-brand-interactive/90 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Media Previews with Video/Photo Badge and Removal */}
            {mediaItems.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-3 bg-brand-surface dark:bg-[#121212] rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D]">
                {mediaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-black group border border-black/10 dark:border-white/10 shadow-sm"
                  >
                    {item.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-black flex items-center space-x-1">
                          <VideoIcon className="w-2.5 h-2.5 text-brand-interactive" />
                          <span>Video</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={item.url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-black flex items-center space-x-1">
                          <ImageIcon className="w-2.5 h-2.5 text-brand-interactive" />
                          <span>Photo</span>
                        </div>
                      </div>
                    )}

                    {index === 0 && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-brand-interactive text-white text-[8px] font-black uppercase shadow-sm">
                        Cover
                      </div>
                    )}

                    {/* Tactile Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(item.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-600/90 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 hover:scale-110 active:scale-90 transition-all shadow-md"
                      title="Remove media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#6C757D] italic">
                No media added yet. Add high quality photos or short transformation clips to attract clients.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-[#E9ECEF] dark:border-[#2D2D2D] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-[#E9ECEF] dark:border-[#2D2D2D] text-xs font-bold text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDescValid}
              className="px-7 py-3 rounded-2xl bg-brand-interactive text-white text-xs font-black shadow-lg shadow-brand-interactive/25 hover:bg-brand-interactive/90 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Service...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Service</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateServiceModal;
