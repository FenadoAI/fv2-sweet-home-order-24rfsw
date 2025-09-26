#!/usr/bin/env python3

import requests
import json
import sys

# Test API endpoints
BASE_URL = "http://127.0.0.1:8001/api"

def test_api_endpoints():
    print("🧪 Testing Review API endpoints...")

    # Test 1: Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ API is running: {response.json()}")
    except Exception as e:
        print(f"❌ API not accessible: {e}")
        return False

    # Test 2: Create a test review
    try:
        review_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "rating": 5,
            "comment": "This is a test review for the API"
        }
        response = requests.post(f"{BASE_URL}/reviews", json=review_data)
        if response.status_code == 200:
            print(f"✅ Review created successfully: {response.json()['id']}")
            review_id = response.json()['id']
        else:
            print(f"❌ Failed to create review: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error creating review: {e}")
        return False

    # Test 3: Get all reviews (including unapproved)
    try:
        response = requests.get(f"{BASE_URL}/reviews?approved_only=false")
        if response.status_code == 200:
            reviews = response.json()
            print(f"✅ Retrieved {len(reviews)} reviews")
        else:
            print(f"❌ Failed to get reviews: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting reviews: {e}")

    # Test 4: Approve the review
    try:
        response = requests.put(f"{BASE_URL}/reviews/{review_id}/approve", json={"approved": True})
        if response.status_code == 200:
            print(f"✅ Review approved successfully")
        else:
            print(f"❌ Failed to approve review: {response.status_code}")
    except Exception as e:
        print(f"❌ Error approving review: {e}")

    # Test 5: Get only approved reviews
    try:
        response = requests.get(f"{BASE_URL}/reviews?approved_only=true")
        if response.status_code == 200:
            approved_reviews = response.json()
            print(f"✅ Retrieved {len(approved_reviews)} approved reviews")
        else:
            print(f"❌ Failed to get approved reviews: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting approved reviews: {e}")

    # Test 6: Test dashboard analytics
    try:
        response = requests.get(f"{BASE_URL}/analytics/dashboard")
        if response.status_code == 200:
            analytics = response.json()
            print(f"✅ Dashboard analytics: {analytics['reviews']}")
        else:
            print(f"❌ Failed to get analytics: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting analytics: {e}")

    print("\n🎉 All tests completed!")
    return True

if __name__ == "__main__":
    success = test_api_endpoints()
    sys.exit(0 if success else 1)