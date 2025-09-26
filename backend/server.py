from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from decimal import Decimal

# AI agents
from ai_agents.agents import AgentConfig, SearchAgent, ChatAgent


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# AI agents init
agent_config = AgentConfig()
search_agent: Optional[SearchAgent] = None
chat_agent: Optional[ChatAgent] = None

# Main app
app = FastAPI(title="AI Agents API", description="Minimal AI Agents API with LangGraph and MCP support")

# API router
api_router = APIRouter(prefix="/api")


# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


# Baking service models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image_url: str
    ingredients: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)
    available: bool = True
    prep_time_hours: int = 24  # hours notice needed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    ingredients: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)
    available: bool = True
    prep_time_hours: int = 24


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    available: Optional[bool] = None
    prep_time_hours: Optional[int] = None


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: str
    delivery_notes: Optional[str] = None
    items: List[OrderItem]
    total_amount: float
    status: str = "pending"  # pending, confirmed, preparing, ready, delivered, cancelled
    order_date: datetime = Field(default_factory=datetime.utcnow)
    delivery_date: Optional[datetime] = None
    special_instructions: Optional[str] = None


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: str
    delivery_notes: Optional[str] = None
    items: List[OrderItem]
    delivery_date: Optional[datetime] = None
    special_instructions: Optional[str] = None


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str
    product_id: Optional[str] = None
    order_id: Optional[str] = None
    approved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReviewCreate(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str
    product_id: Optional[str] = None
    order_id: Optional[str] = None


class ReviewUpdate(BaseModel):
    approved: bool


# AI agent models
class ChatRequest(BaseModel):
    message: str
    agent_type: str = "chat"  # "chat" or "search"
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    agent_type: str
    capabilities: List[str]
    metadata: dict = Field(default_factory=dict)
    error: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResponse(BaseModel):
    success: bool
    query: str
    summary: str
    search_results: Optional[dict] = None
    sources_count: int
    error: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# Product routes
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj


@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, available_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if available_only:
        query["available"] = True

    products = await db.products.find(query).sort("created_at", -1).to_list(1000)
    return [Product(**product) for product in products]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.products.update_one(
            {"id": product_id},
            {"$set": update_data}
        )

    updated_product = await db.products.find_one({"id": product_id})
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**updated_product)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# Order routes
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    # Calculate total amount
    total_amount = sum(item.price * item.quantity for item in order.items)

    order_dict = order.dict()
    order_dict["total_amount"] = total_amount
    order_obj = Order(**order_dict)

    await db.orders.insert_one(order_obj.dict())
    return order_obj


@api_router.get("/orders", response_model=List[Order])
async def get_orders(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status

    orders = await db.orders.find(query).sort("order_date", -1).to_list(1000)
    return [Order(**order) for order in orders]


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)


@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": f"Order status updated to {status}"}


# Review routes
@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate):
    review_dict = review.dict()
    review_obj = Review(**review_dict)
    await db.reviews.insert_one(review_obj.dict())
    return review_obj


@api_router.get("/reviews", response_model=List[Review])
async def get_reviews(approved_only: bool = True, product_id: Optional[str] = None):
    query = {}
    if approved_only:
        query["approved"] = True
    if product_id:
        query["product_id"] = product_id

    reviews = await db.reviews.find(query).sort("created_at", -1).to_list(1000)
    return [Review(**review) for review in reviews]


@api_router.get("/reviews/{review_id}", response_model=Review)
async def get_review(review_id: str):
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return Review(**review)


@api_router.put("/reviews/{review_id}/approve", response_model=Review)
async def approve_review(review_id: str, review_update: ReviewUpdate):
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"approved": review_update.approved}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

    updated_review = await db.reviews.find_one({"id": review_id})
    return Review(**updated_review)


@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted successfully"}


# Analytics routes
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics():
    # Get counts
    total_products = await db.products.count_documents({})
    available_products = await db.products.count_documents({"available": True})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    total_reviews = await db.reviews.count_documents({})
    approved_reviews = await db.reviews.count_documents({"approved": True})

    # Get recent orders
    recent_orders = await db.orders.find().sort("order_date", -1).limit(5).to_list(5)
    recent_orders_data = [Order(**order) for order in recent_orders]

    # Get pending reviews
    pending_reviews = await db.reviews.find({"approved": False}).sort("created_at", -1).limit(10).to_list(10)
    pending_reviews_data = [Review(**review) for review in pending_reviews]

    return {
        "products": {
            "total": total_products,
            "available": available_products
        },
        "orders": {
            "total": total_orders,
            "pending": pending_orders
        },
        "reviews": {
            "total": total_reviews,
            "approved": approved_reviews,
            "pending": total_reviews - approved_reviews
        },
        "recent_orders": recent_orders_data,
        "pending_reviews": pending_reviews_data
    }


# AI agent routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    # Chat with AI agent
    global search_agent, chat_agent
    
    try:
        # Init agents if needed
        if request.agent_type == "search" and search_agent is None:
            search_agent = SearchAgent(agent_config)
            
        elif request.agent_type == "chat" and chat_agent is None:
            chat_agent = ChatAgent(agent_config)
        
        # Select agent
        agent = search_agent if request.agent_type == "search" else chat_agent
        
        if agent is None:
            raise HTTPException(status_code=500, detail="Failed to initialize agent")
        
        # Execute agent
        response = await agent.execute(request.message)
        
        return ChatResponse(
            success=response.success,
            response=response.content,
            agent_type=request.agent_type,
            capabilities=agent.get_capabilities(),
            metadata=response.metadata,
            error=response.error
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(
            success=False,
            response="",
            agent_type=request.agent_type,
            capabilities=[],
            error=str(e)
        )


@api_router.post("/search", response_model=SearchResponse)
async def search_and_summarize(request: SearchRequest):
    # Web search with AI summary
    global search_agent
    
    try:
        # Init search agent if needed
        if search_agent is None:
            search_agent = SearchAgent(agent_config)
        
        # Search with agent
        search_prompt = f"Search for information about: {request.query}. Provide a comprehensive summary with key findings."
        result = await search_agent.execute(search_prompt, use_tools=True)
        
        if result.success:
            return SearchResponse(
                success=True,
                query=request.query,
                summary=result.content,
                search_results=result.metadata,
                sources_count=result.metadata.get("tools_used", 0)
            )
        else:
            return SearchResponse(
                success=False,
                query=request.query,
                summary="",
                sources_count=0,
                error=result.error
            )
            
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return SearchResponse(
            success=False,
            query=request.query,
            summary="",
            sources_count=0,
            error=str(e)
        )


@api_router.get("/agents/capabilities")
async def get_agent_capabilities():
    # Get agent capabilities
    try:
        capabilities = {
            "search_agent": SearchAgent(agent_config).get_capabilities(),
            "chat_agent": ChatAgent(agent_config).get_capabilities()
        }
        return {
            "success": True,
            "capabilities": capabilities
        }
    except Exception as e:
        logger.error(f"Error getting capabilities: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging config
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Initialize agents on startup
    global search_agent, chat_agent
    logger.info("Starting AI Agents API...")
    
    # Lazy agent init for faster startup
    logger.info("AI Agents API ready!")


@app.on_event("shutdown")
async def shutdown_db_client():
    # Cleanup on shutdown
    global search_agent, chat_agent
    
    # Close MCP
    if search_agent and search_agent.mcp_client:
        # MCP cleanup automatic
        pass
    
    client.close()
    logger.info("AI Agents API shutdown complete.")
