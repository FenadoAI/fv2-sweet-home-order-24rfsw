import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Seed products data
PRODUCTS_DATA = [
    {
        "id": "prod_001",
        "name": "Classic Chocolate Chip Cookies",
        "description": "Fresh-baked cookies with premium chocolate chips. Made with organic flour and real vanilla extract. Perfect for any occasion!",
        "price": 18.99,
        "category": "cookies",
        "image_url": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&h=400&fit=crop",
        "ingredients": ["organic flour", "premium chocolate chips", "organic butter", "brown sugar", "vanilla extract", "eggs"],
        "allergens": ["gluten", "dairy", "eggs"],
        "available": True,
        "prep_time_hours": 24
    },
    {
        "id": "prod_002",
        "name": "Red Velvet Cupcakes (6 pack)",
        "description": "Moist red velvet cupcakes topped with cream cheese frosting. Beautifully decorated and perfect for celebrations.",
        "price": 24.99,
        "category": "cupcakes",
        "image_url": "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=500&h=400&fit=crop",
        "ingredients": ["organic flour", "cocoa powder", "cream cheese", "organic butter", "eggs", "red food coloring", "vanilla"],
        "allergens": ["gluten", "dairy", "eggs"],
        "available": True,
        "prep_time_hours": 24
    },
    {
        "id": "prod_003",
        "name": "Artisan Sourdough Bread",
        "description": "Traditional sourdough bread with a perfectly crispy crust and soft, tangy interior. Made with our 7-day fermented starter.",
        "price": 8.99,
        "category": "bread",
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=400&fit=crop",
        "ingredients": ["organic bread flour", "sourdough starter", "sea salt", "water"],
        "allergens": ["gluten"],
        "available": True,
        "prep_time_hours": 48
    },
    {
        "id": "prod_004",
        "name": "Lemon Blueberry Muffins (6 pack)",
        "description": "Light and fluffy muffins bursting with fresh blueberries and bright lemon zest. Made with organic ingredients.",
        "price": 16.99,
        "category": "muffins",
        "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&h=400&fit=crop",
        "ingredients": ["organic flour", "fresh blueberries", "lemon zest", "organic butter", "eggs", "baking powder"],
        "allergens": ["gluten", "dairy", "eggs"],
        "available": True,
        "prep_time_hours": 24
    },
    {
        "id": "prod_005",
        "name": "Double Chocolate Brownies",
        "description": "Rich, fudgy brownies loaded with dark chocolate chunks. These decadent treats are a chocolate lover's dream.",
        "price": 22.99,
        "category": "brownies",
        "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop",
        "ingredients": ["dark chocolate", "organic butter", "eggs", "organic flour", "cocoa powder", "chocolate chunks"],
        "allergens": ["gluten", "dairy", "eggs"],
        "available": True,
        "prep_time_hours": 24
    },
    {
        "id": "prod_006",
        "name": "Apple Cinnamon Pie",
        "description": "Classic homemade apple pie with tender spiced apples in a flaky butter crust. Served warm with love.",
        "price": 32.99,
        "category": "pies",
        "image_url": "https://images.unsplash.com/photo-1535920527002-b35e96722be9?w=500&h=400&fit=crop",
        "ingredients": ["organic apples", "organic flour", "organic butter", "cinnamon", "sugar", "pie spice"],
        "allergens": ["gluten", "dairy"],
        "available": True,
        "prep_time_hours": 48
    }
]

# Seed reviews data
REVIEWS_DATA = [
    {
        "id": "rev_001",
        "customer_name": "Sarah Johnson",
        "customer_email": "sarah@example.com",
        "rating": 5,
        "comment": "The chocolate chip cookies were absolutely amazing! My family loved them. Will definitely order again!",
        "product_id": "prod_001",
        "approved": True
    },
    {
        "id": "rev_002",
        "customer_name": "Mike Chen",
        "rating": 5,
        "comment": "Best sourdough bread I've had in years! The crust was perfect and the flavor was incredible.",
        "product_id": "prod_003",
        "approved": True
    },
    {
        "id": "rev_003",
        "customer_name": "Emily Rodriguez",
        "customer_email": "emily@example.com",
        "rating": 5,
        "comment": "The red velvet cupcakes were a hit at our birthday party. Beautiful presentation and delicious!",
        "product_id": "prod_002",
        "approved": True
    },
    {
        "id": "rev_004",
        "customer_name": "David Wilson",
        "rating": 4,
        "comment": "Great brownies! Very rich and chocolatey. Maybe a bit too sweet for my taste, but still excellent quality.",
        "product_id": "prod_005",
        "approved": True
    },
    {
        "id": "rev_005",
        "customer_name": "Lisa Thompson",
        "customer_email": "lisa@example.com",
        "rating": 5,
        "comment": "The apple pie was phenomenal! Brought back memories of my grandmother's baking. Thank you!",
        "product_id": "prod_006",
        "approved": True
    }
]

async def seed_database():
    print("Seeding database...")

    # Clear existing data
    await db.products.delete_many({})
    await db.reviews.delete_many({})
    print("Cleared existing data")

    # Insert products
    await db.products.insert_many(PRODUCTS_DATA)
    print(f"Inserted {len(PRODUCTS_DATA)} products")

    # Insert reviews
    await db.reviews.insert_many(REVIEWS_DATA)
    print(f"Inserted {len(REVIEWS_DATA)} reviews")

    print("Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())