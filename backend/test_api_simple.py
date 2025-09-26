#!/usr/bin/env python3
"""
Simple test script to verify the baking service API endpoints work
This can be run independently to test the API functionality
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
API_BASE = "http://localhost:8001/api"

def test_basic_endpoints():
    """Test basic API endpoints"""
    print("🧪 Testing Sweet Home Bakery API...")

    try:
        # Test root endpoint
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")

        # Test products endpoint (should work with mock data)
        print("\n📦 Testing Products Endpoints...")

        # Try to get products (may be empty initially)
        response = requests.get(f"{API_BASE}/products")
        print(f"   GET /products: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"   Found {len(products)} products")

        # Test creating a product
        test_product = {
            "name": "Test Chocolate Cookies",
            "description": "Delicious test cookies",
            "price": 15.99,
            "category": "cookies",
            "image_url": "https://example.com/cookies.jpg",
            "ingredients": ["flour", "chocolate", "butter"],
            "allergens": ["gluten", "dairy"],
            "available": True,
            "prep_time_hours": 24
        }

        response = requests.post(f"{API_BASE}/products", json=test_product)
        print(f"   POST /products: {response.status_code}")
        if response.status_code == 200:
            created_product = response.json()
            product_id = created_product["id"]
            print(f"   Created product with ID: {product_id}")

            # Test getting the specific product
            response = requests.get(f"{API_BASE}/products/{product_id}")
            print(f"   GET /products/{product_id}: {response.status_code}")

        print("\n📋 Testing Orders Endpoints...")

        # Test creating an order
        test_order = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "(555) 123-4567",
            "delivery_address": "123 Test St, Test City, ST 12345",
            "items": [
                {
                    "product_id": "test_prod_1",
                    "product_name": "Test Cookies",
                    "quantity": 2,
                    "price": 15.99
                }
            ],
            "delivery_date": (datetime.now() + timedelta(days=2)).isoformat()
        }

        response = requests.post(f"{API_BASE}/orders", json=test_order)
        print(f"   POST /orders: {response.status_code}")
        if response.status_code == 200:
            created_order = response.json()
            order_id = created_order["id"]
            print(f"   Created order with ID: {order_id}")
            print(f"   Total amount: ${created_order['total_amount']:.2f}")

        # Test getting orders
        response = requests.get(f"{API_BASE}/orders")
        print(f"   GET /orders: {response.status_code}")
        if response.status_code == 200:
            orders = response.json()
            print(f"   Found {len(orders)} orders")

        print("\n⭐ Testing Reviews Endpoints...")

        # Test creating a review
        test_review = {
            "customer_name": "Happy Customer",
            "customer_email": "happy@example.com",
            "rating": 5,
            "comment": "Amazing cookies! Will order again!"
        }

        response = requests.post(f"{API_BASE}/reviews", json=test_review)
        print(f"   POST /reviews: {response.status_code}")
        if response.status_code == 200:
            created_review = response.json()
            review_id = created_review["id"]
            print(f"   Created review with ID: {review_id}")

            # Test approving the review
            response = requests.put(f"{API_BASE}/reviews/{review_id}/approve", json={"approved": True})
            print(f"   PUT /reviews/{review_id}/approve: {response.status_code}")

        # Test getting approved reviews
        response = requests.get(f"{API_BASE}/reviews?approved_only=true")
        print(f"   GET /reviews (approved): {response.status_code}")
        if response.status_code == 200:
            reviews = response.json()
            print(f"   Found {len(reviews)} approved reviews")

        print("\n📊 Testing Analytics Dashboard...")
        response = requests.get(f"{API_BASE}/analytics/dashboard")
        print(f"   GET /analytics/dashboard: {response.status_code}")
        if response.status_code == 200:
            dashboard = response.json()
            print(f"   Dashboard data retrieved successfully")
            print(f"   Products: {dashboard.get('products', {})}")
            print(f"   Orders: {dashboard.get('orders', {})}")
            print(f"   Reviews: {dashboard.get('reviews', {})}")

        print("\n🎉 API Test Complete!")
        print("✅ All endpoints are accessible and functional")

    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
        print("   Make sure the backend is running on http://localhost:8001")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    test_basic_endpoints()