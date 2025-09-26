import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Heart, MessageCircle, Send } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const ReviewSection = ({ reviews }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    customer_name: '',
    customer_email: '',
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setNewReview(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit review to backend API
      const reviewData = {
        customer_name: newReview.customer_name,
        customer_email: newReview.customer_email || null,
        rating: newReview.rating,
        comment: newReview.comment
      };

      await axios.post(`${API}/reviews`, reviewData);

      // Reset form
      setNewReview({
        customer_name: '',
        customer_email: '',
        rating: 5,
        comment: ''
      });
      setShowReviewForm(false);

      alert('Thank you for your review! It will be published after approval.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onStarClick(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from the families we've sweetened with our baked goods
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.customer_name}</h4>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <p className="text-gray-600 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Review Section */}
        <div className="text-center">
          {!showReviewForm ? (
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-900">Share Your Experience</h4>
              <p className="text-gray-600">
                Loved our baked goods? We'd love to hear about it!
              </p>
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-amber-600 hover:bg-amber-700"
                size="lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-6">Write Your Review</h4>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name">Name *</Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        value={newReview.customer_name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_email">Email (optional)</Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={newReview.customer_email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="block mb-2">Rating *</Label>
                    <div className="flex items-center space-x-2">
                      {renderStars(newReview.rating, true, handleRatingChange)}
                      <span className="text-sm text-gray-600 ml-4">
                        {newReview.rating} star{newReview.rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Your Review *</Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      value={newReview.comment}
                      onChange={handleInputChange}
                      placeholder="Tell us about your experience with our baked goods..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Submit Review
                        </div>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>

                <p className="text-xs text-gray-500 mt-4">
                  Reviews will be published after approval. We may contact you to verify your order.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;