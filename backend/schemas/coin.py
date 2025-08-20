from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    PURCHASE = "purchase"
    EARNED = "earned"
    SPENT = "spent"
    REWARD = "reward"
    REFUND = "refund"

class CoinTransactionCreate(BaseModel):
    amount: int
    transaction_type: TransactionType
    description: str
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    
    @validator('amount')
    def amount_must_be_valid(cls, v):
        if v == 0:
            raise ValueError('Amount cannot be zero')
        return v

class CoinTransaction(BaseModel):
    id: int
    user_id: int
    amount: int
    transaction_type: TransactionType
    description: str
    reference_id: Optional[int]
    reference_type: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CoinBalance(BaseModel):
    """User's current coin balance info"""
    user_id: int
    current_balance: int
    total_earned: int
    total_spent: int
    recent_transactions: list[CoinTransaction]

class PurchasePackage(BaseModel):
    """Coin purchase packages"""
    id: str
    name: str
    coins: int
    price_vnd: int
    bonus_coins: int
    bonus_percentage: int
    description: str
    popular: bool = False

# Predefined packages theo đặc tả
COIN_PACKAGES = [
    PurchasePackage(
        id="package_50k",
        name="Gói Khởi Đầu",
        coins=500,
        price_vnd=50000,
        bonus_coins=0,
        bonus_percentage=0,
        description="Gói cơ bản để bắt đầu",
        popular=False
    ),
    PurchasePackage(
        id="package_100k", 
        name="Gói Phổ Biến",
        coins=1100,
        price_vnd=100000,
        bonus_coins=100,
        bonus_percentage=10,
        description="Thưởng 10% - Phổ biến nhất",
        popular=True
    ),
    PurchasePackage(
        id="package_200k",
        name="Gói Tiết Kiệm", 
        coins=2300,
        price_vnd=200000,
        bonus_coins=300,
        bonus_percentage=15,
        description="Thưởng 15% - Tiết kiệm hơn",
        popular=False
    ),
    PurchasePackage(
        id="package_500k",
        name="Gói Nhà Tài Trợ",
        coins=6000,
        price_vnd=500000, 
        bonus_coins=1000,
        bonus_percentage=20,
        description="Thưởng 20% + Huy hiệu đặc biệt",
        popular=False
    )
] 