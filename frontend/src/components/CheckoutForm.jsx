import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, MapPin, Clock, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const CheckoutForm = ({ isOpen, onClose, cart, total, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryNotes: '',
    specialInstructions: ''
  });
  const [deliveryDate, setDeliveryDate] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['customerName', 'customerPhone', 'deliveryAddress'];
    return required.every(field => formData[field].trim() !== '') && deliveryDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fill in all required fields and select a delivery date.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        delivery_address: formData.deliveryAddress,
        delivery_notes: formData.deliveryNotes,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        delivery_date: deliveryDate.toISOString(),
        special_instructions: formData.specialInstructions
      };

      // For demo purposes, we'll simulate the order submission
      // In a real implementation, you would send this to the backend
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          const orderId = 'ORD-' + Date.now().toString().slice(-6);
          resolve({ data: { id: orderId, status: 'pending' } });
        }, 1500);
      });

      setOrderNumber(response.data.id);
      setOrderSubmitted(true);

      // Send confirmation email (simulated)
      console.log('Order submitted:', orderData);

    } catch (error) {
      console.error('Error submitting order:', error);
      alert('There was an error submitting your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderComplete = () => {
    onOrderComplete();
    setOrderSubmitted(false);
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deliveryAddress: '',
      deliveryNotes: '',
      specialInstructions: ''
    });
    setDeliveryDate(undefined);
  };

  // Calculate minimum delivery date (24-48 hours from now based on products)
  const getMinDeliveryDate = () => {
    const maxPrepTime = Math.max(...cart.map(item => item.product.prep_time_hours));
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + Math.ceil(maxPrepTime / 24));
    return minDate;
  };

  if (orderSubmitted) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 mb-4">
                Your order has been successfully placed.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Order Number:</strong> {orderNumber}
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  <strong>Delivery Date:</strong> {format(deliveryDate, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>✓ You'll receive a confirmation call within 2 hours</p>
              <p>✓ Payment will be collected upon delivery</p>
              <p>✓ Fresh baking begins 24 hours before delivery</p>
            </div>
            <Button onClick={handleOrderComplete} className="w-full bg-amber-600 hover:bg-amber-700">
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Complete Your Order</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>${(item.quantity * item.product.price).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-amber-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email Address</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                <Textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Street address, apartment/unit, city, state, zip"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                <Input
                  id="deliveryNotes"
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  placeholder="Gate code, special instructions, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Delivery Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !deliveryDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP") : "Select delivery date *"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) => date < getMinDeliveryDate()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500 mt-2">
                Minimum {Math.ceil(Math.max(...cart.map(item => item.product.prep_time_hours)) / 24)} days notice required for fresh preparation
              </p>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Special Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                placeholder="Any special requests or dietary considerations..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
                <p className="text-sm text-blue-800">
                  Payment will be collected upon delivery. We accept cash, credit cards, and digital payments.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !validateForm()}
            className="w-full bg-amber-600 hover:bg-amber-700"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Order...
              </div>
            ) : (
              'Place Order'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CheckoutForm;