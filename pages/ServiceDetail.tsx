import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, Heart, Share2, Check, ArrowRight, Calendar, Play, ChevronLeft, ChevronRight, MessageSquare, Send, AlertCircle, RefreshCw, User } from 'lucide-react';
import { Service, Review } from '../types';
import { getServiceById, getReviewsForService, createReview, isVideoUrl } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, currentUser } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const [serviceRes, reviewsRes] = await Promise.all([
      getServiceById(id),
      getReviewsForService(id)
    ]);

    if (serviceRes.error) {
      setError(serviceRes.error);
    } else {
      setService(serviceRes.data);
    }

    if (reviewsRes.data) {
      setReviews(reviewsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!loading && service) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('book') === 'true') {
        setIsBookingOpen(true);
      }
    }
  }, [loading, service, location.search]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !newComment.trim()) return;
    if (!user) {
      setReviewError('Please log in to submit a verified review.');
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);

    const success = await createReview({
      customerId: user.id,
      serviceId: service.id,
      rating: newRating,
      comment: newComment
    });

    if (success) {
      setReviews(prev => [
        {
          id: 'new-' + Date.now(),
          userName: currentUser?.name || 'You',
          userAvatar: currentUser?.avatar || '',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rating: newRating,
          text: newComment,
          serviceName: service.name,
          serviceId: service.id,
          customerId: user.id
        },
        ...prev
      ]);
      setNewComment('');
      setShowReviewForm(false);
    } else {
      setReviewError('Failed to post review. Please try again.');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-24 bg-white dark:bg-[#0D0D0D] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 bg-gray-200 dark:bg-white/5 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 dark:bg-white/5 rounded-[2rem] animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-white/5 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/2 animate-pulse" />
            </div>
            <div className="lg:col-span-1">
              <div className="h-80 bg-gray-200 dark:bg-white/5 rounded-[2.5rem] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen pt-32 text-center bg-white dark:bg-[#0D0D0D] px-4">
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl">
          <AlertCircle className="w-12 h-12 text-rosePink mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-2">Service not found</h2>
          <p className="text-sm text-[#6C757D] mb-6">This service record could not be found in the database.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={loadData}
              className="px-6 py-2.5 bg-rosePink text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Retry
            </button>
            <Link to="/services" className="px-6 py-2.5 bg-[#F8F9FA] dark:bg-[#252525] rounded-xl text-xs font-bold uppercase tracking-wider text-[#6C757D]">
              All Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gallery = service.gallery && service.gallery.length > 0 ? service.gallery : (service.image ? [{ type: isVideoUrl(service.image) ? 'video' : 'image' as const, url: service.image }] : []);
  const currentMedia = gallery[currentMediaIndex] || gallery[0];

  return (
    <div className="pt-24 pb-24 bg-white dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex space-x-2 text-sm text-[#6C757D] mb-8">
          <Link to="/services" className="hover:text-rosePink">Services</Link>
          <span>/</span>
          <span className="text-rosePink font-bold">{service.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8 group">
              {/* Main Media Viewer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden bg-black shadow-2xl mb-4"
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentMediaIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center bg-black"
                  >
                    {currentMedia?.type === 'video' && !videoError ? (
                      <div className="relative w-full h-full">
                        <video
                          src={currentMedia.url}
                          className="w-full h-full object-contain"
                          poster={currentMedia.thumbnail}
                          controls
                          autoPlay={isPlaying}
                          onError={() => setVideoError(true)}
                        />
                      </div>
                    ) : currentMedia?.url ? (
                      <img
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        alt={service.name}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-rosePink p-6 text-center">
                        <span className="font-serif font-bold text-2xl text-white mb-2">{service.name}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-rosePink">{service.category}</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Overlays (Heart/Share) */}
                <div className="absolute top-6 right-6 flex space-x-4 z-10">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-3 sm:p-4 backdrop-blur-md rounded-full border transition-all ${
                      isSaved ? 'bg-rosePink border-rosePink text-white' : 'bg-white/80 dark:bg-black/50 border-white/20 text-[#1A1A1A] dark:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: service.name, url: window.location.href });
                      }
                    }}
                    className="p-3 sm:p-4 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-[#1A1A1A] dark:text-white hover:text-rosePink"
                  >
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Navigation Arrows */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentMediaIndex(prev => (prev === 0 ? gallery.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentMediaIndex(prev => (prev === gallery.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnail Strip */}
              {gallery.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {gallery.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentMediaIndex(idx);
                        setIsPlaying(item.type === 'video');
                      }}
                      className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all ${
                        currentMediaIndex === idx ? 'border-rosePink ring-2 ring-rosePink/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center text-white">
                          <Play className="w-6 h-6" />
                        </div>
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-[#1A1A1A] dark:text-white">{service.name}</h1>
              <div className="flex flex-wrap items-center gap-6 mb-8 text-[#1A1A1A] dark:text-white">
                <div className="flex items-center text-lg">
                  <Star className={`w-5 h-5 mr-2 ${service.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                  <span className="font-bold">{service.rating > 0 ? service.rating : 'New'}</span>
                  <span className="text-[#6C757D] ml-2">({reviews.length} reviews)</span>
                </div>
                {service.durationMins > 0 && (
                  <div className="flex items-center text-[#6C757D]">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>~{service.durationMins} mins</span>
                  </div>
                )}
                {service.agentLocation && (
                  <div className="flex items-center text-[#6C757D]">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{service.agentLocation}</span>
                  </div>
                )}
              </div>

              {service.description && (
                <div className="prose dark:prose-invert max-w-none mb-12">
                  <h3 className="text-2xl font-serif font-bold mb-4">Description</h3>
                  <p className="text-lg leading-relaxed text-[#6C757D] dark:text-[#B0B0B0]">
                    {service.description}
                  </p>
                </div>
              )}

              {/* Features / What's Included */}
              {service.features && service.features.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-serif font-bold mb-6 text-[#1A1A1A] dark:text-white">What's Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((item, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-2xl border border-transparent hover:border-rosePink/20 transition-all">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-[#1A1A1A] dark:text-white">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <section>
                <div className="flex justify-between items-end mb-8">
                  <h3 className="text-3xl font-serif font-bold text-[#1A1A1A] dark:text-white">Client Reviews</h3>
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-rosePink font-bold hover:underline flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{showReviewForm ? 'Cancel Review' : 'Write a review'}</span>
                  </button>
                </div>

                {reviewError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-500 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Review Form */}
                <AnimatePresence>
                  {showReviewForm && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleReviewSubmit}
                      className="mb-8 p-6 bg-[#F8F9FA] dark:bg-[#1A1A1A] rounded-3xl border border-rosePink/20 space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">Your Rating:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="text-yellow-400 p-1"
                            >
                              <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        required
                        placeholder="Share your genuine experience with this service..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-sm outline-none focus:border-rosePink transition-all h-24 resize-none text-[#1A1A1A] dark:text-white"
                      />

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-3 bg-rosePink text-white rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg shadow-rosePink/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="p-8 bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-rosePink/10 flex items-center justify-center text-rosePink font-bold overflow-hidden">
                              {review.userAvatar ? (
                                <img src={review.userAvatar} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#1A1A1A] dark:text-white">{review.userName}</div>
                              <div className="text-xs text-[#6C757D] flex items-center">
                                <Calendar className="w-3 h-3 mr-1" /> {review.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[#6C757D] dark:text-[#B0B0B0] italic leading-relaxed">"{review.text}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 bg-white dark:bg-[#1A1A1A] rounded-[2rem] border border-[#E9ECEF] dark:border-[#2D2D2D] text-center text-[#6C757D]">
                      <p className="text-sm">No client reviews yet. Be the first to book and share your feedback!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-xl"
              >
                <div className="mb-8">
                  <div className="text-[#6C757D] text-sm font-bold uppercase tracking-wider mb-2">Service Price</div>
                  <div className="text-4xl font-serif font-bold text-rosePink">₦{service.price.toLocaleString()}</div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm p-3 rounded-xl bg-[#F8F9FA] dark:bg-[#252525]">
                    <Check className="w-4 h-4 text-rosePink mr-3" />
                    <span className="text-[#1A1A1A] dark:text-white">Expert consultation included</span>
                  </div>
                  <div className="flex items-center text-sm p-3 rounded-xl bg-[#F8F9FA] dark:bg-[#252525]">
                    <Check className="w-4 h-4 text-rosePink mr-3" />
                    <span className="text-[#1A1A1A] dark:text-white">Direct on-demand scheduling</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full py-5 bg-rosePink text-white rounded-2xl font-bold text-xl hover:bg-[#E57B8D] transition-all transform hover:scale-[1.02] shadow-xl shadow-rosePink/20 mb-4 flex items-center justify-center space-x-3"
                >
                  <Calendar className="w-6 h-6" />
                  <span>Book Appointment</span>
                </button>
                <p className="text-center text-xs text-[#6C757D]">Direct database reservation with the beauty specialist.</p>
              </motion.div>

              {service.agentId && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-8 bg-rosePink/5 dark:bg-rosePink/10 rounded-[2.5rem] border border-rosePink/15"
                >
                  <div className="flex items-center mb-6">
                    {service.agentImage ? (
                      <img src={service.agentImage} className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-[#1A1A1A] mr-4 shadow-md" alt="" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-rosePink/10 text-rosePink flex items-center justify-center mr-4 font-bold border-4 border-white dark:border-[#1A1A1A] shadow-md">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <div className="text-[#6C757D] text-[10px] font-bold uppercase tracking-widest mb-1">Service by</div>
                      <div className="text-xl font-serif font-bold text-[#1A1A1A] dark:text-white">{service.agentName}</div>
                      <div className="text-xs text-rosePink font-bold">{service.agentSpecialty}</div>
                    </div>
                  </div>
                  <Link to={`/agent/${service.agentId}`} className="flex items-center text-rosePink font-bold group">
                    View Full Artist Profile <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        service={service}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default ServiceDetail;
