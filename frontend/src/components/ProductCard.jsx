import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Clock, AlertCircle } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    onAddToCart(product, quantity);

    // Show feedback
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 600);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-amber-800 capitalize">
            {product.category}
          </Badge>
        </div>
        {!product.available && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
          <span className="text-2xl font-bold text-amber-600">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* Preparation Time */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4 mr-2" />
          <span>{product.prep_time_hours}hr notice needed</span>
        </div>

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <div className="flex items-start mb-4">
            <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Contains:</span> {product.allergens.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Ingredients Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Made with:</span> {product.ingredients.slice(0, 3).join(', ')}
            {product.ingredients.length > 3 && '...'}
          </p>
        </div>

        {/* Add to Cart Section */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-gray-700">
              Qty:
            </label>
            <select
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border rounded px-2 py-1 text-sm min-w-16"
              disabled={!product.available}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!product.available || isAdding}
            className={`${
              isAdding
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-amber-600 hover:bg-amber-700'
            } transition-all duration-300`}
          >
            {isAdding ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Added!
              </div>
            ) : (
              <div className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;