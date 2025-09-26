import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

const Cart = ({ isOpen, onClose, cart, onUpdateQuantity, total }) => {
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = (productId, change) => {
    const currentItem = cart.find(item => item.product.id === productId);
    if (currentItem) {
      const newQuantity = currentItem.quantity + change;
      onUpdateQuantity(productId, Math.max(0, newQuantity));
    }
  };

  const removeItem = (productId) => {
    onUpdateQuantity(productId, 0);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderComplete = () => {
    setShowCheckout(false);
    onClose();
    // Clear cart after successful order
    cart.forEach(item => onUpdateQuantity(item.product.id, 0));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Your Order ({cart.length} items)
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some delicious baked goods to get started!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <Card key={item.product.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600">${item.product.price.toFixed(2)} each</p>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {item.product.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {item.quantity} × ${item.product.price.toFixed(2)}
                        </span>
                        <span className="font-semibold text-amber-600">
                          ${(item.quantity * item.product.price).toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Local Delivery</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-amber-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Payment will be collected upon delivery
                </p>
              </div>
            </>
          )}
        </div>

        {/* Checkout Form Modal */}
        {showCheckout && (
          <CheckoutForm
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            cart={cart}
            total={total}
            onOrderComplete={handleOrderComplete}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;