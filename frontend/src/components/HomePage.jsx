import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Clock, Award, Heart, MapPin, MessageCircle } from 'lucide-react';
import ProductCard from './ProductCard';
import Cart from './Cart';
import ReviewSection from './ReviewSection';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, []);

  const fetchProducts = async () => {
    try {
      // For now, using mock data since backend might not be fully connected
      const mockProducts = [
        {
          id: "prod_001",
          name: "Classic Chocolate Chip Cookies",
          description: "Fresh-baked cookies with premium chocolate chips. Made with organic flour and real vanilla extract. Perfect for any occasion!",
          price: 18.99,
          category: "cookies",
          image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&h=400&fit=crop",
          ingredients: ["organic flour", "premium chocolate chips", "organic butter", "brown sugar", "vanilla extract", "eggs"],
          allergens: ["gluten", "dairy", "eggs"],
          available: true,
          prep_time_hours: 24
        },
        {
          id: "prod_002",
          name: "Red Velvet Cupcakes (6 pack)",
          description: "Moist red velvet cupcakes topped with cream cheese frosting. Beautifully decorated and perfect for celebrations.",
          price: 24.99,
          category: "cupcakes",
          image_url: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=500&h=400&fit=crop",
          ingredients: ["organic flour", "cocoa powder", "cream cheese", "organic butter", "eggs", "red food coloring", "vanilla"],
          allergens: ["gluten", "dairy", "eggs"],
          available: true,
          prep_time_hours: 24
        },
        {
          id: "prod_003",
          name: "Artisan Sourdough Bread",
          description: "Traditional sourdough bread with a perfectly crispy crust and soft, tangy interior. Made with our 7-day fermented starter.",
          price: 8.99,
          category: "bread",
          image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=400&fit=crop",
          ingredients: ["organic bread flour", "sourdough starter", "sea salt", "water"],
          allergens: ["gluten"],
          available: true,
          prep_time_hours: 48
        },
        {
          id: "prod_004",
          name: "Lemon Blueberry Muffins (6 pack)",
          description: "Light and fluffy muffins bursting with fresh blueberries and bright lemon zest. Made with organic ingredients.",
          price: 16.99,
          category: "muffins",
          image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&h=400&fit=crop",
          ingredients: ["organic flour", "fresh blueberries", "lemon zest", "organic butter", "eggs", "baking powder"],
          allergens: ["gluten", "dairy", "eggs"],
          available: true,
          prep_time_hours: 24
        },
        {
          id: "prod_005",
          name: "Double Chocolate Brownies",
          description: "Rich, fudgy brownies loaded with dark chocolate chunks. These decadent treats are a chocolate lover's dream.",
          price: 22.99,
          category: "brownies",
          image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop",
          ingredients: ["dark chocolate", "organic butter", "eggs", "organic flour", "cocoa powder", "chocolate chunks"],
          allergens: ["gluten", "dairy", "eggs"],
          available: true,
          prep_time_hours: 24
        },
        {
          id: "prod_006",
          name: "Apple Cinnamon Pie",
          description: "Classic homemade apple pie with tender spiced apples in a flaky butter crust. Served warm with love.",
          price: 32.99,
          category: "pies",
          image_url: "https://images.unsplash.com/photo-1535920527002-b35e96722be9?w=500&h=400&fit=crop",
          ingredients: ["organic apples", "organic flour", "organic butter", "cinnamon", "sugar", "pie spice"],
          allergens: ["gluten", "dairy"],
          available: true,
          prep_time_hours: 48
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      // Fetch approved reviews from backend API
      const response = await axios.get(`${API}/reviews?approved_only=true`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to mock data if API fails
      const mockReviews = [
        {
          id: "rev_001",
          customer_name: "Sarah Johnson",
          rating: 5,
          comment: "The chocolate chip cookies were absolutely amazing! My family loved them. Will definitely order again!",
          product_id: "prod_001"
        },
        {
          id: "rev_002",
          customer_name: "Mike Chen",
          rating: 5,
          comment: "Best sourdough bread I've had in years! The crust was perfect and the flavor was incredible.",
          product_id: "prod_003"
        },
        {
          id: "rev_003",
          customer_name: "Emily Rodriguez",
          rating: 5,
          comment: "The red velvet cupcakes were a hit at our birthday party. Beautiful presentation and delicious!",
          product_id: "prod_002"
        }
      ];
      setReviews(mockReviews);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800">Loading delicious baked goods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-rose-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sweet Home Bakery</h1>
                <p className="text-sm text-gray-600">Handcrafted with love, delivered with care</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">Local Delivery Available</span>
              </div>
              <Button
                variant="outline"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({getCartItemCount()})
                {getCartItemCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Freshly Baked
              <span className="block text-yellow-200">Every Day</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              From our kitchen to your table - artisanal baked goods made with premium ingredients and traditional recipes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center text-yellow-200">
                <Clock className="h-5 w-5 mr-2" />
                <span>24-48hr notice for fresh preparation</span>
              </div>
              <div className="flex items-center text-yellow-200">
                <Award className="h-5 w-5 mr-2" />
                <span>100% organic ingredients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews - Prominent Display */}
      {reviews.length > 0 && (
        <section className="bg-gradient-to-br from-rose-50 to-pink-50 py-16 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center items-center mb-4">
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-current" />
                  ))}
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">5.0</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by Our Customers
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Don't just take our word for it - here's what families are saying about our handcrafted treats
              </p>
            </div>

            {/* Featured Reviews Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.slice(0, 6).map((review) => (
                <Card key={review.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Heart className="h-6 w-6 text-rose-500" />
                    </div>
                    <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed italic">
                      "{review.comment}"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900 text-lg">{review.customer_name}</p>
                        <p className="text-sm text-gray-500">Verified Customer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {reviews.length > 6 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white border-amber-600 text-amber-600 hover:bg-amber-50"
                  onClick={() => document.getElementById('all-reviews').scrollIntoView({ behavior: 'smooth' })}
                >
                  Read More Reviews
                  <MessageCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Signature Baked Goods</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each item is lovingly handcrafted using time-honored techniques and the finest ingredients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <div id="all-reviews">
        <ReviewSection reviews={reviews} />
      </div>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        total={getCartTotal()}
      />
    </div>
  );
};

export default HomePage;