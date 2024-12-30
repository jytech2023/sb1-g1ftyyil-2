import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartItemCard from '../components/cart/CartItemCard';
import CartSummary from '../components/cart/CartSummary';
import DeliveryForm from '../components/delivery/DeliveryForm';
import { createOrder } from '../services/orderService';
import { delay } from '../utils/orderUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { DeliveryDetails } from '../types/delivery';

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmitOrder = async (details: DeliveryDetails) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const orderData = {
        items: state.items.map(item => ({
          dish_id: item.dish_id,
          quantity: item.quantity,
          price: item.price
        })),
        delivery_name: details.name || details.contactName,
        delivery_phone: details.phone || details.contactPhone,
        delivery_address: details.address || details.contactAddress,
        contact_person_name: details.contactName,
        contact_person_phone: details.contactPhone,
        contact_person_address: details.contactAddress,
        arrival_time: details.arrivalTime.toISOString()
      };

      const response = await createOrder(orderData);
      
      // Add delay to ensure backend updates are complete
      await delay(500);

      // Clear cart and navigate to order tracking
      dispatch({ type: 'CLEAR_CART' });
      navigate(`/order/${response.order_id}`, { 
        state: { preparation_hours: response.preparation_hours }
      });
    } catch (err) {
      console.error('Failed to create order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Rest of the component remains the same...
}