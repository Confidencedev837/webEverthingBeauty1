import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Scissors,
  Palette,
  Hand,
  Crown,
  Smile,
  Eye,
  Flower2,
  UserCheck,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Upload,
  Trash2,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Briefcase,
  Store,
  Home as HomeIcon,
  Truck,
  ChevronRight,
  X,
  Eye as PreviewEye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../components/Snackbar';
import { createService, uploadMedia, invalidateCache } from '../services/supabaseService';
import { Service } from '../types';

// Step definition
type Step = 1 | 2 | 3 | 4;

interface CategoryOption {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  suggestedTitles: string[];
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'Makeup',
    name: 'Makeup',
    subtitle: 'Soft glam, bridal, gele & editorial',
    icon: Palette,
    suggestedTitles: [
      'Signature Soft Glam with Mink Lashes',
      'Full Bridal Reception Makeup',
      'Clean Editorial Studio Makeup',
      'Traditional Gele Tying & Glam'
    ]
  },
  {
    id: 'Hair Styling & Braids',
    name: 'Hair Styling & Braids',
    subtitle: 'Knotless, cornrows, twists & locs',
    icon: Scissors,
    suggestedTitles: [
      'Goddess Knotless Box Braids (Mid-Back)',
      'Boho Island Twists with Curls',
      'Traditional Cornrows & Feed-In Braids',
      'Loc Maintenance & Retwist'
    ]
  },
  {
    id: 'Nails & Pedicure',
    name: 'Nails & Pedicure',
    subtitle: 'Acrylics, gel, press-ons & spa',
    icon: Hand,
    suggestedTitles: [
      'Full Acrylic Set with French Ombré Art',
      'Russian Gel Manicure & Cuticle Care',
      'Luxury Pedicure with Paraffin Treatment',
      'BIAB Overlay with Nail Art Accents'
    ]
  },
  {
    id: 'Barbing & Haircuts',
    name: 'Barbing & Haircuts',
    subtitle: 'Fades, beard sculpt, cuts & grooming',
    icon: UserCheck,
    suggestedTitles: [
      'Signature Low Drop Fade & Hot Towel',
      'Beard Sculpting & Razor Edge Definition',
      'Executive Haircut with Charcoal Mask',
      'Kids Precision Haircut with Styling'
    ]
  },
  {
    id: 'Wig Installation & Styling',
    name: 'Wig Installation & Styling',
    subtitle: 'Frontals, closures, revamping & melting',
    icon: Crown,
    suggestedTitles: [
      'Frontal Wig Installation & Custom Plucking',
      'Glueless Closure Wig Install & Silk Press',
      'Wig Revamp, Deep Wash & Styling',
      'HD Lace Customization & Melting'
    ]
  }
];

const PRESET_FEATURES: Record<string, string[]> = {
  'Makeup': [
    'Full skin prep & primer',
    'Luxury mink eyelashes included',
    'Custom lipstick blend',
    'Setting spray long-wear seal',
    'Touch-up sponge kit'
  ],
  'Hair Styling & Braids': [
    'One-on-one consultation',
    'Sanitized tools & parting combs',
    'Braiding hair prep included',
    'Finishing mousse & scalp oil',
    'Edge control styling'
  ],
  'Nails & Pedicure': [
    'Sanitized drill bits & files',
    'Cuticle oil massage',
    'Gel topcoat high-shine seal',
    'Non-toxic nail prep',
    'Free nail repair within 3 days'
  ],
  'Barbing & Haircuts': [
    'Sterilised clipper blades',
    'Hot towel treatment',
    'Beard oil massage',
    'Razor sharp hairline finish',
    'Scalp antiseptic spritz'
  ],
  'Wig Installation & Styling': [
    'Custom plucking & hairline shaping',
    'Lace bleaching & tinting',
    'HD melting band application',
    'Silk press or custom curls',
    'Maintenance care instructions'
  ],
  // Legacy aliases
  'Hair Styling': [
    'One-on-one consultation',
    'Sanitized tools & parting combs',
    'Finishing mousse & scalp oil'
  ],
  'Makeup Artistry': [
    'Full skin prep & primer',
    'Luxury eyelashes included',
    'Setting spray seal'
  ],
  'Barbering': [
    'Sterilised clipper blades',
    'Hot towel treatment',
    'Razor sharp hairline finish'
  ]
};

const DURATION_OPTIONS = [
  { label: '30 mins', value: 30 },
  { label: '45 mins', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4+ hours', value: 240 }
];

const STORAGE_KEY = 'eb_create_service_draft';

const CreateService: React.FC = () => {
  const { user, currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Wizard Step
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Basics
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Step 2: Pricing, Duration & Service Delivery
  const [price, setPrice] = useState<string>('');
  const [durationMins, setDurationMins] = useState<number>(60);
  const [serviceDelivery, setServiceDelivery] = useState<'doorstep' | 'in_shop'>('doorstep');

  // Step 3: Features & Inclusions
  const [features, setFeatures] = useState<string[]>(PRESET_FEATURES[CATEGORIES[0].id] || []);
  const [customFeatureInput, setCustomFeatureInput] = useState<string>('');

  // Step 4: Photos & Review
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<number>(0);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const [certifyAuthentic, setCertifyAuthentic] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restore draft from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.category) setCategory(draft.category);
        if (draft.name) setName(draft.name);
        if (draft.description) setDescription(draft.description);
        if (draft.price) setPrice(draft.price);
        if (draft.durationMins) setDurationMins(draft.durationMins);
        if (draft.serviceDelivery) setServiceDelivery(draft.serviceDelivery);
        if (draft.features && Array.isArray(draft.features)) setFeatures(draft.features);
        if (draft.mediaUrls && Array.isArray(draft.mediaUrls)) setMediaUrls(draft.mediaUrls);
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  // Autosave draft to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          category,
          name,
          description,
          price,
          durationMins,
          serviceDelivery,
          features,
          mediaUrls
        })
      );
    } catch {
      // Ignore storage write issues
    }
  }, [category, name, description, price, durationMins, serviceDelivery, features, mediaUrls]);

  // When category changes, suggest relevant features if user hasn't added custom ones
  const handleCategorySelect = (newCategory: string) => {
    setCategory(newCategory);
    if (PRESET_FEATURES[newCategory]) {
      setFeatures(PRESET_FEATURES[newCategory]);
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Please enter a name for your service.';
    } else if (name.trim().length < 4) {
      errs.name = 'Service name should be at least 4 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Please provide a brief description of what this service involves.';
    } else if (description.trim().length < 25) {
      errs.description = `Description needs a bit more detail (${description.trim().length}/25 characters minimum).`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    const priceNum = parseFloat(price.replace(/,/g, ''));
    if (!price || isNaN(priceNum) || priceNum < 500) {
      errs.price = 'Please set a price of at least ₦500.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (features.length === 0) {
      errs.features = 'Please select or add at least one feature so customers know what to expect.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Navigate to Next Step with Validation
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to Previous Step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add custom feature
  const handleAddCustomFeature = () => {
    const trimmed = customFeatureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
      setCustomFeatureInput('');
      setErrors((prev) => ({ ...prev, features: '' }));
    }
  };

  // Toggle feature
  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures((prev) => prev.filter((f) => f !== feat));
    } else {
      setFeatures((prev) => [...prev, feat]);
      setErrors((prev) => ({ ...prev, features: '' }));
    }
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
      setMediaUrls((prev) => [...prev, url]);
      setImageUrlInput('');
    } else {
      showSnackbar('Please enter a valid image web URL starting with https://', 'error');
    }
  };

  // Client-side image compressor: shrink heavy phone photos to ~200KB for lightning-fast uploads
  const compressImageForUpload = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) return resolve(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1400;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg'
                });
                resolve(compressed);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Handle local file upload with fast-to-slow typewriter percentage simulation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);
    setUploadSuccess(false);
    setUploadProgress(14);

    // Fast-at-the-beginning, slow-at-the-end simulated typewriter easing interval:
    // Shoots quickly to 45% -> 72% -> 88%, then gently paces at 92% -> 96%
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev < 45) return prev + Math.floor(Math.random() * 14 + 10); // Rapid sprint
        if (prev < 72) return prev + Math.floor(Math.random() * 8 + 6);   // Fast
        if (prev < 88) return prev + Math.floor(Math.random() * 4 + 2);   // Moderate
        if (prev < 96) return prev + 1;                                   // Gentle holding crawl
        return prev;
      });
    }, 65);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        // Compress in browser memory before network transit
        const optimizedFile = await compressImageForUpload(rawFile);

        if (user?.id) {
          const res = await uploadMedia(user.id, optimizedFile, 'gallery');
          if (res.url) {
            uploadedUrls.push(res.url);
          } else {
            // Fallback to local Data URL
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(optimizedFile);
            });
            uploadedUrls.push(dataUrl);
          }
        }
      }

      // Snap to 100% when upload completes
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      await new Promise((r) => setTimeout(r, 700));

      setMediaUrls((prev) => [...prev, ...uploadedUrls]);
      showSnackbar('Photos added to portfolio showcase', 'info');
      setTimeout(() => {
        setUploadSuccess(false);
      }, 1600);
    } catch (err) {
      clearInterval(progressInterval);
      showSnackbar('Failed to upload photo. Please try again.', 'error');
    } finally {
      clearInterval(progressInterval);
      setIsUploadingFile(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove photo
  const handleRemoveMedia = (indexToRemove: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Final Publish Handler with fast-to-slow typewriter percentage simulation & feedback green check tick
  const handlePublish = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      showSnackbar('Please review the required details before publishing.', 'error');
      return;
    }

    if (!user?.id) {
      showSnackbar('You must be signed in as a beauty agent to publish.', 'error');
      navigate('/auth');
      return;
    }

    if (mediaUrls.length === 0) {
      showSnackbar('Please upload at least one real photo of your craft. Stock and AI images are strictly prohibited.', 'error');
      return;
    }

    if (!certifyAuthentic) {
      showSnackbar('You must certify that all photos are your 100% authentic work before publishing.', 'error');
      return;
    }

    setIsSubmitting(true);
    setPublishSuccess(false);
    setPublishProgress(14);

    // Simulated typewriter progress (fast start, slow finish)
    const progressInterval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev < 48) return prev + Math.floor(Math.random() * 14 + 10); // Rapid sprint
        if (prev < 75) return prev + Math.floor(Math.random() * 8 + 6);   // Fast
        if (prev < 90) return prev + Math.floor(Math.random() * 4 + 2);   // Moderate
        if (prev < 97) return prev + 1;                                   // Gentle holding crawl
        return prev;
      });
    }, 60);

    try {
      const priceNum = parseFloat(price.replace(/,/g, '')) || 0;
      const res = await createService({
        agentId: user.id,
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        durationMins,
        imageUrl: mediaUrls,
        features
      });

      if (res.success) {
        clearInterval(progressInterval);
        setPublishProgress(100);
        setPublishSuccess(true);
        // Show feedback animated green check tick for a brief celebratory moment
        await new Promise((r) => setTimeout(r, 750));

        sessionStorage.removeItem(STORAGE_KEY);
        const newId = res.data?.id;
        if (newId) {
          setCreatedServiceId(newId);
        }

        // Invalidate services and agents cache so fresh database record is loaded immediately
        invalidateCache('services');
        invalidateCache('agents');
        window.dispatchEvent(new CustomEvent('eb:cache-updated', { detail: { key: 'services:all', data: null } }));

        showSnackbar('Service published! Opening live marketplace preview...', 'info');

        // Automatically navigate directly to the services page and animate straight to the new card
        setTimeout(() => {
          if (newId) {
            navigate(`/services?highlight=${newId}#service-${newId}`);
          } else {
            navigate('/services');
          }
        }, 550);
      } else {
        clearInterval(progressInterval);
        setPublishProgress(0);
        showSnackbar(res.error || 'Failed to publish service. Please try again.', 'error');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setPublishProgress(0);
      console.error('Publish service error:', err);
      showSnackbar('An unexpected error occurred while publishing.', 'error');
      setIsSubmitting(false);
    }
  };

  // Current category data
  const currentCategoryData = useMemo(() => {
    return CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  }, [category]);

  const numericPrice = parseFloat(price.replace(/,/g, '')) || 0;

  // Slide Animation Variants
  const stepVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 }
  };

  // If already published, render success screen
  if (isPublished) {
    return (
      <div className="min-h-screen bg-brand-surface dark:bg-[#0D0D0D] pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-[#E9ECEF] dark:border-[#262626] shadow-2xl text-center relative overflow-hidden"
          >
            {/* Ambient specular highlight */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-interactive/15 rounded-3xl blur-3xl pointer-events-none" />

            <div className="w-20 h-20 rounded-2xl bg-brand-interactive/10 dark:bg-brand-interactive/20 text-brand-interactive flex items-center justify-center mx-auto mb-6 border border-brand-interactive/30 shadow-lg shadow-brand-interactive/15">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
              <Check className="w-3.5 h-3.5" />
              <span>Live in Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] dark:text-white tracking-tight mb-3">
              {name}
            </h1>

            <p className="text-sm sm:text-base text-[#6C757D] dark:text-[#A0A0A0] max-w-md mx-auto mb-8 leading-relaxed">
              Your beauty service is now officially live. Customers nationwide can view your portfolio, book appointments, and pay securely upfront.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md mx-auto">
              <button
                onClick={() => {
                  if (createdServiceId) {
                    navigate(`/services?highlight=${createdServiceId}#service-${createdServiceId}`);
                  } else {
                    navigate('/services');
                  }
                }}
                className="tactile-3d w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-interactive/25 hover:shadow-brand-interactive/40 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>View Live on Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/agent/dashboard')}
                className="tactile-3d w-full py-3.5 px-5 rounded-2xl bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E9ECEF] dark:border-[#2D2D2D] font-bold text-xs sm:text-sm hover:border-brand-interactive/40 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Manage in Studio</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E9ECEF] dark:border-[#262626]">
              <button
                onClick={() => {
                  setIsPublished(false);
                  setCurrentStep(1);
                  setName('');
                  setDescription('');
                  setPrice('');
                  setMediaUrls([]);
                }}
                className="text-xs font-bold text-brand-interactive hover:underline inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create another service</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#0D0D0D] pt-20 sm:pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb & Exit */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-xs text-[#6C757D] dark:text-[#A0A0A0]">
            <Link to="/" className="hover:text-brand-interactive transition-colors font-semibold">
              Agent Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1A1A1A] dark:text-white font-bold">New Service Studio</span>
          </div>

          <Link
            to="/"
            className="tactile-3d inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#262626] text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-white transition-all shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
        </div>

        {/* Stepper Progress Header */}
        <div className="bg-white dark:bg-[#161616] p-4 sm:p-6 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-interactive">
                Step {currentStep} of 4
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white tracking-tight mt-0.5">
                {currentStep === 1 && 'Specialty & Service Basics'}
                {currentStep === 2 && 'Pricing, Duration & Delivery'}
                {currentStep === 3 && 'Included Inclusions & Equipment'}
                {currentStep === 4 && 'Portfolio Photos & Final Review'}
              </h1>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-[#6C757D] dark:text-[#A0A0A0]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Autosaved draft</span>
            </div>
          </div>

          {/* Stepper Indicator - NO ROUNDED PILLS (structured cards & bar) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { num: 1, title: 'Basics' },
              { num: 2, title: 'Pricing' },
              { num: 3, title: 'Inclusions' },
              { num: 4, title: 'Review' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (isPast) setCurrentStep(step.num as Step);
                  }}
                  disabled={!isPast}
                  className={`p-2 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-brand-interactive/10 dark:bg-brand-interactive/20 border-brand-interactive text-brand-interactive'
                    : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-[#6C757D] dark:text-[#888] opacity-60 cursor-not-allowed'
                    }`}
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 ${isActive
                        ? 'bg-brand-interactive text-white shadow-sm'
                        : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-black/10 dark:bg-white/10 text-[#6C757D]'
                        }`}
                    >
                      {isPast ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" /> : step.num}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold truncate">{step.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Body with Animated Transitions */}
        <AnimatePresence mode="wait">
          {/* ================= STEP 1: BASICS & CATEGORY ================= */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Category Picker */}
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                      1. Select Your Beauty Specialty
                    </h2>
                    <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                      Choose the primary domain this service belongs to.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                  {CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`tactile-3d p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${isSelected
                          ? 'bg-brand-interactive/10 dark:bg-brand-interactive/20 border-brand-interactive shadow-md shadow-brand-interactive/15 ring-2 ring-brand-interactive/30'
                          : 'bg-brand-surface/40 dark:bg-[#1F1F1F] border-[#E9ECEF] dark:border-[#2A2A2A] hover:border-brand-interactive/40'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected
                              ? 'bg-brand-interactive text-white shadow-sm'
                              : 'bg-black/5 dark:bg-white/10 text-[#1A1A1A] dark:text-white'
                              }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-brand-interactive stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-white">
                            {cat.name}
                          </h4>
                          <p className="text-[10px] text-[#6C757D] dark:text-[#A0A0A0] mt-0.5 line-clamp-1">
                            {cat.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Name & Title */}
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm space-y-5">
                <div>
                  <label htmlFor="service-name" className="block text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white mb-1.5">
                    2. Service Name
                  </label>
                  <input
                    id="service-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="e.g. Goddess Knotless Box Braids (Mid-Back)"
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-brand-surface/50 dark:bg-[#1F1F1F] border text-sm sm:text-base font-semibold text-[#1A1A1A] dark:text-white placeholder-[#888] focus:outline-none transition-all ${errors.name
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                      : 'border-[#E9ECEF] dark:border-[#2A2A2A] focus:border-brand-interactive focus:ring-2 focus:ring-brand-interactive/20'
                      }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.name}</span>
                    </p>
                  )}

                  {/* Suggestion Chips */}
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-[#6C757D] dark:text-[#A0A0A0] block mb-1.5">
                      Quick ideas for {currentCategoryData.name}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCategoryData.suggestedTitles.map((idea) => (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => {
                            setName(idea);
                            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-brand-surface dark:bg-[#222] border border-[#E9ECEF] dark:border-[#2E2E2E] hover:border-brand-interactive/50 text-[11px] font-semibold text-[#1A1A1A] dark:text-white transition-all text-left cursor-pointer"
                        >
                          + {idea}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="service-description" className="block text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white">
                      3. Service Description
                    </label>
                    <span className="text-[11px] font-bold text-[#6C757D] dark:text-[#A0A0A0]">
                      {description.trim().length} chars (min 25)
                    </span>
                  </div>
                  <textarea
                    id="service-description"
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                    }}
                    placeholder="Describe what client receives, products used, hair preparation instructions, or aftercare expectations..."
                    className={`w-full px-4 py-3 rounded-2xl bg-brand-surface/50 dark:bg-[#1F1F1F] border text-xs sm:text-sm font-medium text-[#1A1A1A] dark:text-white placeholder-[#888] focus:outline-none transition-all ${errors.description
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                      : 'border-[#E9ECEF] dark:border-[#2A2A2A] focus:border-brand-interactive focus:ring-2 focus:ring-brand-interactive/20'
                      }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: PRICING & SERVICE DELIVERY ================= */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Pricing Input Card */}
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                    Set Your Pricing in Nigerian Naira (₦)
                  </h2>
                  <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                    You receive 100% of your listed fee. No hidden commissions taken from your talent.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-xl sm:text-2xl font-black text-brand-interactive">
                    ₦
                  </div>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                    }}
                    placeholder="15,000"
                    className={`w-full pl-11 sm:pl-14 pr-4 py-4 rounded-2xl bg-brand-surface/50 dark:bg-[#1F1F1F] border text-xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white placeholder-[#888] focus:outline-none transition-all ${errors.price
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                      : 'border-[#E9ECEF] dark:border-[#2A2A2A] focus:border-brand-interactive focus:ring-2 focus:ring-brand-interactive/20'
                      }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-500 font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.price}</span>
                  </p>
                )}

                {/* Quick Add Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[3000, 4000, 7000, 12000, 20000, 30000, 40000].map((quickVal) => (
                    <button
                      key={quickVal}
                      type="button"
                      onClick={() => {
                        setPrice(quickVal.toString());
                        if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-surface dark:bg-[#202020] border border-[#E9ECEF] dark:border-[#2E2E2E] hover:border-brand-interactive/50 text-xs font-bold text-[#1A1A1A] dark:text-white transition-all cursor-pointer"
                    >
                      ₦{quickVal.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selector */}
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                    Estimated Service Duration
                  </h2>
                  <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                    How long do you need to complete this service properly?
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = durationMins === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDurationMins(opt.value)}
                        className={`tactile-3d p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-brand-interactive/10 dark:bg-brand-interactive/20 border-brand-interactive shadow-sm ring-2 ring-brand-interactive/30'
                          : 'bg-brand-surface/40 dark:bg-[#1F1F1F] border-[#E9ECEF] dark:border-[#2A2A2A] hover:border-brand-interactive/30'
                          }`}
                      >
                        <Clock className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-brand-interactive' : 'text-[#6C757D]'}`} />
                        <span className={`text-xs sm:text-sm font-bold block ${isSelected ? 'text-brand-interactive' : 'text-[#1A1A1A] dark:text-white'}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Delivery Mode */}
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                    Where is this service performed?
                  </h2>
                  <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                    Specify whether you travel to clients or they come to your studio.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'doorstep',
                      title: 'Doorstep Service',
                      desc: "You travel directly to the customer's home",
                      icon: Truck
                    },
                    {
                      id: 'in_shop',
                      title: 'Studio / Salon Visit',
                      desc: 'Customer arrives at your physical chair',
                      icon: Store
                    }
                  ].map((mode) => {
                    const ModeIcon = mode.icon;
                    const isSelected = serviceDelivery === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setServiceDelivery(mode.id as any)}
                        className={`tactile-3d p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-brand-interactive/10 dark:bg-brand-interactive/20 border-brand-interactive ring-2 ring-brand-interactive/30 shadow-sm'
                          : 'bg-brand-surface/40 dark:bg-[#1F1F1F] border-[#E9ECEF] dark:border-[#2A2A2A] hover:border-brand-interactive/30'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${isSelected ? 'bg-brand-interactive text-white' : 'bg-black/5 dark:bg-white/10 text-[#6C757D]'}`}>
                          <ModeIcon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-white">
                          {mode.title}
                        </h4>
                        <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0] mt-0.5 leading-snug">
                          {mode.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: FEATURES & INCLUSIONS ================= */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm space-y-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                    What is included in this service?
                  </h2>
                  <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                    Check all inclusions that apply or type your own custom features below.
                  </p>
                </div>

                {errors.features && (
                  <p className="text-xs text-red-500 font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.features}</span>
                  </p>
                )}

                {/* Preset Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(PRESET_FEATURES[category] || []).map((feat) => {
                    const isChecked = features.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all duration-200 cursor-pointer ${isChecked
                          ? 'bg-brand-interactive/10 dark:bg-brand-interactive/20 border-brand-interactive/50 text-[#1A1A1A] dark:text-white'
                          : 'bg-brand-surface/30 dark:bg-[#1E1E1E] border-[#E9ECEF] dark:border-[#2A2A2A] text-[#6C757D] hover:border-brand-interactive/30'
                          }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isChecked
                            ? 'bg-brand-interactive text-white shadow-sm'
                            : 'bg-black/10 dark:bg-white/10 text-transparent'
                            }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">{feat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Feature Add Field */}
                <div className="pt-3 border-t border-[#E9ECEF] dark:border-[#262626]">
                  <label htmlFor="custom-inclusion" className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1.5">
                    Add Custom Inclusions / Notes:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="custom-inclusion"
                      type="text"
                      value={customFeatureInput}
                      onChange={(e) => setCustomFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomFeature();
                        }
                      }}
                      placeholder="e.g. Free styling oil or lace band included"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-brand-surface/50 dark:bg-[#1F1F1F] border border-[#E9ECEF] dark:border-[#2A2A2A] text-xs sm:text-sm text-[#1A1A1A] dark:text-white placeholder-[#888] focus:outline-none focus:border-brand-interactive"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFeature}
                      disabled={!customFeatureInput.trim()}
                      className="tactile-3d px-4 py-2.5 rounded-xl bg-brand-interactive text-white text-xs font-bold disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Selected Inclusions Badges (NO PILLS - rounded-xl badges) */}
                {features.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-[#6C757D] dark:text-[#A0A0A0] block mb-2">
                      Active Inclusions ({features.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feat) => (
                        <span
                          key={feat}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-interactive/10 dark:bg-brand-interactive/20 border border-brand-interactive/30 text-xs font-bold text-brand-interactive"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => toggleFeature(feat)}
                            className="hover:text-red-500 ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= STEP 4: PORTFOLIO PHOTOS & LIVE REVIEW ================= */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Strict Zero-Tolerance Policy Warning Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-red-500/10 dark:bg-red-500/15 border-2 border-red-500/40 text-red-950 dark:text-red-200 shadow-md space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-red-900 dark:text-red-300 uppercase tracking-wider">
                        Zero Tolerance: Genuine Client Work Only
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                        Automatic Ban & Account Blacklist Policy
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-red-900/90 dark:text-red-300/90 leading-relaxed font-semibold space-y-2 pl-0.5">
                  <p>
                    Everything Beauty is a verified Nigerian beauty marketplace built exclusively on genuine human craftsmanship. <strong className="text-red-600 dark:text-red-400">Stock photography (Unsplash, Shutterstock), AI-generated images, Pinterest downloads, and photos taken from other stylists are strictly prohibited.</strong>
                  </p>
                  <p>
                    Every portfolio upload undergoes mandatory visual audit by our platform security team. Specialists caught uploading fake or unverified work face <strong className="text-red-600 dark:text-red-400">immediate permanent platform expulsion and complete forfeiture of all pending escrow earnings.</strong>
                  </p>
                </div>

                {/* Mandatory Legal Certification Checkbox */}
                <label className="flex items-start space-x-3 p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#1E1E1E]/80 border-2 border-red-500/40 cursor-pointer select-none mt-2 shadow-sm">
                  <input
                    type="checkbox"
                    checked={certifyAuthentic}
                    onChange={(e) => setCertifyAuthentic(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold text-[#1A1A1A] dark:text-white leading-snug">
                    I formally certify under penalty of permanent platform ban that all photos uploaded here represent 100% my own authentic craftsmanship performed on real clients.
                  </span>
                </label>
              </div>

              {/* Photo Showcase Manager */}
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                    Showcase Photos of Your Work
                  </h2>
                  <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                    Upload real examples of this service so customers can trust your craftsmanship.
                  </p>
                </div>

                {/* Upload Action Row */}
                <div className="flex flex-wrap gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingFile}
                    className={`tactile-3d relative overflow-hidden px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md cursor-pointer transition-colors duration-200 ${uploadSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-brand-interactive text-white shadow-brand-interactive/20 disabled:opacity-90'
                      }`}
                  >
                    {/* Micro Progress Bar across bottom of button */}
                    {isUploadingFile && (
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-white/70 transition-all duration-150 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    )}
                    {uploadSuccess ? (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="flex items-center space-x-2 text-white font-black"
                      >
                        <div className="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3.5] text-white" />
                        </div>
                        <span>Added!</span>
                      </motion.div>
                    ) : (
                      <>
                        <Upload className={`w-4 h-4 ${isUploadingFile ? 'animate-bounce text-white' : ''}`} />
                        <span>{isUploadingFile ? `Uploading... ${uploadProgress}%` : 'Upload Photos'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex-1 min-w-[240px] flex space-x-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste image web link (https://...)"
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-brand-surface/50 dark:bg-[#1F1F1F] border border-[#E9ECEF] dark:border-[#2A2A2A] text-xs font-semibold text-[#1A1A1A] dark:text-white placeholder-[#888] focus:outline-none focus:border-brand-interactive"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="tactile-3d px-4 py-2.5 rounded-2xl bg-brand-surface dark:bg-[#222] border border-[#E9ECEF] dark:border-[#2E2E2E] text-xs font-bold text-[#1A1A1A] dark:text-white hover:border-brand-interactive cursor-pointer"
                    >
                      Add Link
                    </button>
                  </div>
                </div>

                {/* Media Preview Grid */}
                {mediaUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {mediaUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden aspect-square border border-black/10 dark:border-white/10 group shadow-sm bg-black/5"
                      >
                        <img src={url} alt={`Showcase ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-brand-primary/90 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                            Cover Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-[#E9ECEF] dark:border-[#262626] text-center bg-brand-surface/20 dark:bg-black/20">
                    <ImageIcon className="w-8 h-8 text-[#6C757D] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-[#6C757D] dark:text-[#A0A0A0]">
                      No photos uploaded yet. Upload at least one real photo of your craft.
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      Stock and AI-generated images are strictly prohibited.
                    </p>
                  </div>
                )}
              </div>

              {/* Live Marketplace Card Preview */}
              <div className="bg-white dark:bg-[#161616] p-5 sm:p-7 rounded-3xl border border-[#E9ECEF] dark:border-[#262626] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white flex items-center space-x-2">
                      <PreviewEye className="w-4 h-4 text-brand-interactive" />
                      <span>Live Client Preview</span>
                    </h2>
                    <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] mt-0.5">
                      This is how your service appears to paying customers nationwide.
                    </p>
                  </div>
                </div>

                {/* Realistic Service Card */}
                <div className="max-w-md mx-auto rounded-3xl border border-[#E9ECEF] dark:border-[#262626] bg-brand-background dark:bg-[#1A1A1A] shadow-xl overflow-hidden">
                  {mediaUrls.length > 0 ? (
                    <div className="relative aspect-[16/10] bg-black/10 overflow-hidden">
                      <img
                        src={mediaUrls[0]}
                        alt={name || 'Service Preview'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-brand-primary/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                        {category}
                      </div>
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/95 dark:bg-[#111]/95 text-brand-interactive font-black text-sm shadow-md backdrop-blur-md">
                        ₦{numericPrice.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] bg-brand-surface/40 dark:bg-[#141414] border-b border-[#E9ECEF] dark:border-[#262626] flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#6C757D] dark:text-[#888] mb-2.5">
                        <ImageIcon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white">
                        No photo uploaded yet
                      </h4>
                      <p className="text-[11px] text-[#6C757D] dark:text-[#A0A0A0] mt-0.5 max-w-xs leading-snug">
                        Upload genuine client photos of your craft to display here
                      </p>
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-brand-primary/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                        {category}
                      </div>
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/95 dark:bg-[#111]/95 text-brand-interactive font-black text-sm shadow-md backdrop-blur-md">
                        ₦{numericPrice.toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-black text-[#1A1A1A] dark:text-white line-clamp-1">
                        {name || 'Service Title'}
                      </h3>
                      <p className="text-xs text-[#6C757D] dark:text-[#A0A0A0] line-clamp-2 mt-1">
                        {description || 'Comprehensive beauty session provided by certified specialist.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E9ECEF] dark:border-[#262626] flex items-center justify-between text-xs text-[#6C757D] dark:text-[#A0A0A0]">
                      <span className="flex items-center space-x-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-brand-interactive" />
                        <span>{durationMins} mins</span>
                      </span>
                      <span className="flex items-center space-x-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-interactive" />
                        <span className="capitalize">{serviceDelivery.replace('_', ' ')}</span>
                      </span>
                    </div>

                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {features.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="px-2.5 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] font-bold text-[#1A1A1A] dark:text-white"
                          >
                            {f}
                          </span>
                        ))}
                        {features.length > 3 && (
                          <span className="px-2 py-0.5 rounded-lg bg-brand-interactive/10 text-[10px] font-black text-brand-interactive">
                            +{features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Navigation Bar (Fixed / Sticky tactile controls) */}
        <div className="mt-8 pt-6 border-t border-[#E9ECEF] dark:border-[#262626] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="tactile-3d px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#262626] font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-white hover:border-brand-interactive/50 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="tactile-3d px-7 py-3 sm:px-8 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#6C35A6] to-[#7B3DB8] text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-interactive/30 hover:shadow-brand-interactive/45 flex items-center space-x-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className={`tactile-3d relative overflow-hidden px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl text-white font-black text-sm sm:text-base flex items-center space-x-2.5 cursor-pointer disabled:opacity-90 transition-all duration-300 ${publishSuccess
                ? 'bg-emerald-600 shadow-xl shadow-emerald-600/40'
                : 'bg-gradient-to-r from-[#6C35A6] via-[#7B3DB8] to-[#32104D] shadow-xl shadow-brand-interactive/35 hover:shadow-brand-interactive/50'
                }`}
            >
              {/* Micro Progress Bar across bottom of publish button */}
              {isSubmitting && !publishSuccess && (
                <div
                  className="absolute bottom-0 left-0 h-1.5 bg-white/70 transition-all duration-150 ease-out"
                  style={{ width: `${publishProgress}%` }}
                />
              )}

              {publishSuccess ? (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="flex items-center space-x-2.5 text-white font-black"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3.5] text-white" />
                  </div>
                  <span>Published!</span>
                </motion.div>
              ) : isSubmitting ? (
                <div className="flex items-center space-x-2.5 text-white">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2] animate-spin" />
                  <span>Publishing Service... {publishProgress}%</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Publish Service Now</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateService;