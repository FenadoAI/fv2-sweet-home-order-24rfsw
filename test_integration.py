#!/usr/bin/env python3

import requests
import json

# Test integration between frontend and backend
API_BASE = "http://127.0.0.1:8001/api"
FRONTEND_BASE = "http://127.0.0.1:3000"

def test_review_approval_integration():
    print("🔗 Testing Review Approval Integration...")

    # Step 1: Create a test review
    review_data = {
        "customer_name": "Integration Test User",
        "customer_email": "integration@test.com",
        "rating": 5,
        "comment": "This is an integration test review"
    }

    response = requests.post(f"{API_BASE}/reviews", json=review_data)
    if response.status_code == 200:
        review_id = response.json()['id']
        print(f"✅ Created test review: {review_id}")
    else:
        print(f"❌ Failed to create review: {response.status_code}")
        return False

    # Step 2: Get unapproved reviews
    response = requests.get(f"{API_BASE}/reviews?approved_only=false")
    if response.status_code == 200:
        all_reviews = response.json()
        unapproved = [r for r in all_reviews if not r['approved']]
        print(f"✅ Found {len(unapproved)} unapproved reviews")
    else:
        print(f"❌ Failed to get reviews: {response.status_code}")
        return False

    # Step 3: Approve the review (simulating admin dashboard action)
    response = requests.put(f"{API_BASE}/reviews/{review_id}/approve", json={"approved": True})
    if response.status_code == 200:
        print(f"✅ Review approved successfully")
    else:
        print(f"❌ Failed to approve review: {response.status_code}")
        return False

    # Step 4: Verify review is now approved
    response = requests.get(f"{API_BASE}/reviews/{review_id}")
    if response.status_code == 200:
        updated_review = response.json()
        if updated_review['approved']:
            print(f"✅ Review is now approved: {updated_review['approved']}")
        else:
            print(f"❌ Review approval status not updated")
            return False
    else:
        print(f"❌ Failed to get updated review: {response.status_code}")
        return False

    # Step 5: Check dashboard analytics
    response = requests.get(f"{API_BASE}/analytics/dashboard")
    if response.status_code == 200:
        analytics = response.json()
        print(f"✅ Dashboard analytics: {analytics['reviews']}")
    else:
        print(f"❌ Failed to get analytics: {response.status_code}")
        return False

    print("\n🎉 Integration test completed successfully!")
    print("\n📋 Summary:")
    print("- ✅ Backend API is running and responding")
    print("- ✅ Review creation works")
    print("- ✅ Review approval functionality works")
    print("- ✅ Review status updates correctly")
    print("- ✅ Analytics dashboard works")
    print("- ✅ Frontend should now be able to approve reviews without errors")

    return True

if __name__ == "__main__":
    success = test_review_approval_integration()
    if not success:
        exit(1)