import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, DollarSign, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Service } from '../../types';
import { updateService, deleteService } from '../../services/supabaseService';
import { useSnackbar } from '../Snackbar';

interface EditServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
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

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onUpdated
}) => {
  const { showSnackbar } = useSnackbar();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [durationMins, setDurationMins] = useState('60');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setCategory(service.category || CATEGORIES[0]);
      setPrice(service.price ? service.price.toString() : '');
      setDurationMins(service.durationMins ? service.durationMins.toString() : '60');
      setDescription(service.description || '');
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Service title is required');
      return;
    }

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price in Naira');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await updateService(service.id, {
      name: name.trim(),
      category,
      price: priceNum,
      durationMins: parseInt(durationMins, 10) || 60,
      description: description.trim()
    });

    setSaving(false);
    if (res.success) {
      showSnackbar('Service updated successfully', 'success');
      onUpdated();
      onClose();
    } else {
      setError(res.error || 'Failed to update service');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    const res = await deleteService(service.id);
    setDeleting(false);

    if (res.success) {
      showSnackbar('Service removed from catalog', 'info');
      onUpdated();
      onClose();
    } else {
      setError(res.error || 'Failed to delete service');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative w-full max-w-xl bg-brand-background dark:bg-[#161616] rounded-3xl border border-[#E9ECEF] dark:border-[#2D2D2D] shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-white">
                Edit Published Service
              </h3>
              <p className="text-xs text-[#6C757D] font-medium">Update pricing, service title, and duration</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#6C757D] mb-1.5 uppercase tracking-wider">
                Service Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-sm font-bold text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#6C757D] mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-sm font-bold text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#6C757D] mb-1.5 uppercase tracking-wider flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1 text-green-500" />
                  Price (₦)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="500"
                  step="500"
                  className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-sm font-black text-green-500 outline-none focus:border-brand-interactive transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#6C757D] mb-1.5 uppercase tracking-wider flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-brand-interactive" />
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  min="15"
                  step="15"
                  className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-sm font-bold text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive transition-all"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="p-3 bg-brand-interactive/5 rounded-2xl border border-brand-interactive/10 text-xs text-[#6C757D]">
                  Estimated Service Session: <strong className="text-brand-interactive">{durationMins} mins</strong>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#6C757D] mb-1.5 uppercase tracking-wider">
                Service Description & Inclusions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3.5 bg-brand-surface dark:bg-[#0D0D0D] border border-[#E9ECEF] dark:border-[#2D2D2D] rounded-2xl text-sm text-[#1A1A1A] dark:text-white outline-none focus:border-brand-interactive transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#E9ECEF] dark:border-[#2D2D2D] flex flex-col sm:flex-row items-center justify-between gap-3">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Service</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-red-500 text-white hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold text-[#6C757D] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl text-xs font-bold text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-brand-interactive text-white rounded-2xl text-xs font-black shadow-lg shadow-brand-interactive/25 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditServiceModal;
