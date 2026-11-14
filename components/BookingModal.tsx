// components/BookingModal.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../types';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * BookingModal acts as an intelligent router bridge.
 * When triggered, it seamlessly routes the customer to the dedicated
 * responsive booking screen at `#/book/:id`.
 */
const BookingModal: React.FC<BookingModalProps> = ({ service, isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && service?.id) {
      onClose();
      navigate(`/book/${service.id}`);
    }
  }, [isOpen, service?.id, navigate, onClose]);

  return null;
};

export default BookingModal;
