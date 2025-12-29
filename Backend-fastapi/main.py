from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import engine, Base, get_db
from models import Budget, Customer, Task, Sales, Traffic
from typing import List, Dict, Any

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Dashboard API",
    description="FastAPI Backend for Dashboard Application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
       "http://localhost:9000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Dashboard API with FastAPI",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "metrics": "/api/dashboard/metrics",
            "sales": "/api/dashboard/sales",
            "traffic": "/api/dashboard/traffic"
        }
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "message": "Dashboard API is running"
    }

# Get dashboard metrics
@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get all dashboard metrics (Budget, Customers, Task Progress, Profit)"""
    
    try:
        # Budget metrics
        budget_total = db.query(func.sum(Budget.amount)).scalar() or 24000
        budget_change = 12.0
        
        # Customer metrics
        customer_count = db.query(func.count(Customer.id)).scalar() or 1600
        customer_change = -16.0
        
        # Task progress
        total_tasks = db.query(func.count(Task.id)).scalar() or 100
        completed_tasks = db.query(func.count(Task.id)).filter(
            Task.status == "completed"
        ).scalar() or 75
        task_progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 75.5
        
        # Profit
        total_profit = db.query(func.sum(Sales.amount)).filter(
            Sales.status == "completed"
        ).scalar() or 15000
        
        return {
            "budget": {
                "value": f"${int(budget_total/1000)}k",
                "change": f"+{int(budget_change)}%" if budget_change > 0 else f"{int(budget_change)}%",
                "changeText": "Since last month",
                "isPositive": budget_change > 0
            },
            "customers": {
                "value": f"{customer_count/1000:.1f}k",
                "change": f"+{int(customer_change)}%" if customer_change > 0 else f"{int(customer_change)}%",
                "changeText": "Since last month",
                "isPositive": customer_change > 0
            },
            "taskProgress": {
                "value": f"{task_progress:.1f}%",
                "progress": task_progress
            },
            "profit": {
                "value": f"${int(total_profit/1000)}k"
            }
        }
    except Exception as e:
        return {
            "budget": {"value": "$24k", "change": "+12%", "changeText": "Since last month", "isPositive": True},
            "customers": {"value": "1.6k", "change": "-16%", "changeText": "Since last month", "isPositive": False},
            "taskProgress": {"value": "75.5%", "progress": 75.5},
            "profit": {"value": "$15k"}
        }

# Get sales data
@app.get("/api/dashboard/sales")
async def get_sales_data(db: Session = Depends(get_db)):
    """Get monthly sales data for chart"""
    
    try:
        # Query sales grouped by month
        sales_data = db.query(
            func.to_char(Sales.sale_date, 'Mon').label('month'),
            func.sum(Sales.amount).label('sales')
        ).filter(
            Sales.status == "completed"
        ).group_by(
            func.to_char(Sales.sale_date, 'Mon'),
            extract('month', Sales.sale_date)
        ).order_by(
            extract('month', Sales.sale_date)
        ).all()
        
        # Default data if no records
        if not sales_data:
            return [
                {"month": "Jan", "sales": 15000},
                {"month": "Feb", "sales": 18000},
                {"month": "Mar", "sales": 12000},
                {"month": "Apr", "sales": 14000},
                {"month": "May", "sales": 10000},
                {"month": "Jun", "sales": 16000},
                {"month": "Jul", "sales": 15500},
                {"month": "Aug", "sales": 17000},
                {"month": "Sep", "sales": 19000},
                {"month": "Oct", "sales": 20000},
                {"month": "Nov", "sales": 18500},
                {"month": "Dec", "sales": 21000}
            ]
        
        return [{"month": row.month, "sales": float(row.sales)} for row in sales_data]
    except Exception as e:
        # Return default data on error
        return [
            {"month": "Jan", "sales": 15000},
            {"month": "Feb", "sales": 18000},
            {"month": "Mar", "sales": 12000},
            {"month": "Apr", "sales": 14000},
            {"month": "May", "sales": 10000},
            {"month": "Jun", "sales": 16000},
            {"month": "Jul", "sales": 15500},
            {"month": "Aug", "sales": 17000},
            {"month": "Sep", "sales": 19000},
            {"month": "Oct", "sales": 20000},
            {"month": "Nov", "sales": 18500},
            {"month": "Dec", "sales": 21000}
        ]

# Get traffic source data
@app.get("/api/dashboard/traffic")
async def get_traffic_data(db: Session = Depends(get_db)):
    """Get traffic source data by device type"""
    
    try:
        # Query traffic grouped by device type
        total_visits = db.query(func.sum(Traffic.visits)).scalar() or 0
        
        traffic_data = db.query(
            Traffic.device_type,
            func.sum(Traffic.visits).label('visits')
        ).group_by(Traffic.device_type).all()
        
        # Default data if no records
        if not traffic_data or total_visits == 0:
            return [
                {"name": "Desktop", "value": 63.0},
                {"name": "Tablet", "value": 15.0},
                {"name": "Phone", "value": 23.0}
            ]
        
        return [
            {
                "name": row.device_type.capitalize(),
                "value": round((row.visits / total_visits * 100), 1)
            }
            for row in traffic_data
        ]
    except Exception as e:
        # Return default data on error
        return [
            {"name": "Desktop", "value": 63.0},
            {"name": "Tablet", "value": 15.0},
            {"name": "Phone", "value": 23.0}
        ]

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )