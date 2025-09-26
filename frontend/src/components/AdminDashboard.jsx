import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Package,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  DollarSign,
  Star,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: { total: 0, available: 0 },
    orders: { total: 0, pending: 0 },
    reviews: { total: 0, approved: 0, pending: 0 }
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    ingredients: '',
    allergens: '',
    prep_time_hours: '24'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load analytics dashboard
      const analyticsResponse = await axios.get(`${API}/analytics/dashboard`);
      const dashboardData = analyticsResponse.data;

      setStats({
        products: dashboardData.products,
        orders: dashboardData.orders,
        reviews: dashboardData.reviews
      });

      // Load products
      const productsResponse = await axios.get(`${API}/products?available_only=false`);
      setProducts(productsResponse.data);

      // Load orders
      const ordersResponse = await axios.get(`${API}/orders`);
      setOrders(ordersResponse.data);

      // Load all reviews (approved and pending)
      const reviewsResponse = await axios.get(`${API}/reviews?approved_only=false`);
      setReviews(reviewsResponse.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock products
    const mockProducts = [
      {
        id: 'prod_001',
        name: 'Classic Chocolate Chip Cookies',
        price: 18.99,
        category: 'cookies',
        available: true,
        created_at: '2024-01-15'
      },
      {
        id: 'prod_002',
        name: 'Red Velvet Cupcakes',
        price: 24.99,
        category: 'cupcakes',
        available: true,
        created_at: '2024-01-16'
      }
    ];

    // Mock orders
    const mockOrders = [
      {
        id: 'ORD-123456',
        customer_name: 'Sarah Johnson',
        total_amount: 43.98,
        status: 'pending',
        order_date: '2024-01-20',
        items: [
          { product_name: 'Chocolate Chip Cookies', quantity: 2 }
        ]
      },
      {
        id: 'ORD-123457',
        customer_name: 'Mike Chen',
        total_amount: 24.99,
        status: 'confirmed',
        order_date: '2024-01-21',
        items: [
          { product_name: 'Red Velvet Cupcakes', quantity: 1 }
        ]
      }
    ];

    // Mock reviews
    const mockReviews = [
      {
        id: 'rev_001',
        customer_name: 'Sarah Johnson',
        rating: 5,
        comment: 'Amazing cookies! My family loved them.',
        approved: true,
        created_at: '2024-01-20'
      },
      {
        id: 'rev_002',
        customer_name: 'New Customer',
        rating: 5,
        comment: 'Waiting for approval...',
        approved: false,
        created_at: '2024-01-22'
      }
    ];

    setProducts(mockProducts);
    setOrders(mockOrders);
    setReviews(mockReviews);
    setStats({
      products: { total: mockProducts.length, available: mockProducts.filter(p => p.available).length },
      orders: { total: mockOrders.length, pending: mockOrders.filter(o => o.status === 'pending').length },
      reviews: { total: mockReviews.length, approved: mockReviews.filter(r => r.approved).length, pending: mockReviews.filter(r => !r.approved).length }
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      id: 'prod_' + Date.now().toString().slice(-3),
      ...newProduct,
      price: parseFloat(newProduct.price),
      available: true,
      created_at: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [product, ...prev]);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      ingredients: '',
      allergens: '',
      prep_time_hours: '24'
    });
    setShowAddProduct(false);
  };

  const toggleProductAvailability = (productId) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, available: !product.available }
          : product
      )
    );
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const approveReview = async (reviewId) => {
    try {
      await axios.put(`${API}/reviews/${reviewId}/approve`, { approved: true });
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, approved: true }
            : review
        )
      );
      // Update stats
      setStats(prev => ({
        ...prev,
        reviews: {
          ...prev.reviews,
          approved: prev.reviews.approved + 1,
          pending: prev.reviews.pending - 1
        }
      }));
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error approving review. Please try again.');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await axios.delete(`${API}/reviews/${reviewId}`);
      const deletedReview = reviews.find(r => r.id === reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));

      // Update stats
      setStats(prev => ({
        ...prev,
        reviews: {
          total: prev.reviews.total - 1,
          approved: deletedReview?.approved ? prev.reviews.approved - 1 : prev.reviews.approved,
          pending: !deletedReview?.approved ? prev.reviews.pending - 1 : prev.reviews.pending
        }
      }));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      preparing: { color: 'bg-purple-100 text-purple-800', text: 'Preparing' },
      ready: { color: 'bg-green-100 text-green-800', text: 'Ready' },
      delivered: { color: 'bg-gray-100 text-gray-800', text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your home bakery business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.products.available}</p>
                  <p className="text-xs text-gray-500">{stats.products.available} available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.orders.total}</p>
                  <p className="text-xs text-gray-500">{stats.orders.pending} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.reviews.total}</p>
                  <p className="text-xs text-gray-500">{stats.reviews.pending} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$1,247</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Management</CardTitle>
                <Button onClick={() => setShowAddProduct(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {showAddProduct && (
                  <form onSubmit={handleAddProduct} className="mb-6 p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Product Name</Label>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={newProduct.category}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={newProduct.image_url}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button type="submit">Add Product</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{product.category}</Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {product.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleProductAvailability(product.id)}
                            >
                              {product.available ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          {order.items.map(item => (
                            <div key={item.product_name} className="text-sm">
                              {item.quantity}x {item.product_name}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                              >
                                Preparing
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Review Management</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => loadDashboardData()}
                  disabled={loading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-600 mr-2" />
                            <div>
                              <p className="text-sm text-green-700">Approved</p>
                              <p className="text-xl font-bold text-green-900">{stats.reviews.approved}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <X className="h-5 w-5 text-yellow-600 mr-2" />
                            <div>
                              <p className="text-sm text-yellow-700">Pending</p>
                              <p className="text-xl font-bold text-yellow-900">{stats.reviews.pending}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                            <div>
                              <p className="text-sm text-blue-700">Total</p>
                              <p className="text-xl font-bold text-blue-900">{stats.reviews.total}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Reviews Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id} className={!review.approved ? 'bg-yellow-50' : ''}>
                            <TableCell className="font-medium">{review.customer_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-sm">
                              <div className="truncate" title={review.comment}>
                                {review.comment.length > 50
                                  ? `${review.comment.substring(0, 50)}...`
                                  : review.comment
                                }
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {review.approved ? 'Approved' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {!review.approved && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => approveReview(review.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteReview(review.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;