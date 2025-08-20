from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.user import User
from schemas.coin import CoinBalance, CoinTransaction, COIN_PACKAGES, PurchasePackage, CoinTransactionCreate
from services.coin_service import CoinService
from typing import List

router = APIRouter(prefix="/api/coins", tags=["coins"])

@router.get("/balance", response_model=CoinBalance)
def get_my_coin_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thông tin coin balance của user hiện tại"""
    try:
        return CoinService.get_user_balance(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/transactions", response_model=List[CoinTransaction])
def get_my_transactions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy lịch sử transactions của user"""
    from models.coin_transaction import CoinTransaction as CoinTransactionModel
    
    transactions = db.query(CoinTransactionModel)\
                    .filter(CoinTransactionModel.user_id == current_user.id)\
                    .order_by(CoinTransactionModel.created_at.desc())\
                    .offset(skip).limit(limit).all()
    
    return transactions

@router.get("/packages", response_model=List[PurchasePackage])
def get_coin_packages():
    """Lấy danh sách gói coin có thể mua"""
    return COIN_PACKAGES

@router.post("/purchase/{package_id}")
def purchase_coins(
    package_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mua coin package (mock implementation)
    Trong production sẽ tích hợp payment gateway
    """
    # Find package
    package = next((p for p in COIN_PACKAGES if p.id == package_id), None)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    try:
        # Mock purchase - trong thực tế sẽ có payment processing
        total_coins = package.coins + package.bonus_coins
        
        transaction = CoinService.add_transaction(
            db, current_user.id,
            CoinTransactionCreate(
                amount=total_coins,
                transaction_type="purchase",
                description=f"Purchased {package.name} - {package.coins} coins + {package.bonus_coins} bonus",
                reference_type="purchase",
                reference_id=None
            )
        )
        
        return {
            "success": True,
            "message": f"Successfully purchased {total_coins} coins",
            "transaction_id": transaction.id,
            "new_balance": current_user.coin_balance + total_coins
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/tip/{user_id}")
def tip_user(
    user_id: int,
    amount: int,
    message: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tip coin cho user khác"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot tip yourself")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Tip amount must be positive")
    
    if amount > 500:  # Max tip limit
        raise HTTPException(status_code=400, detail="Maximum tip is 500 coins")
    
    # Check recipient exists
    recipient = db.query(User).filter(User.id == user_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    try:
        sender_tx, receiver_tx = CoinService.transfer_coins(
            db, current_user.id, user_id, amount, 
            message or f"Tip to {recipient.username}"
        )
        
        return {
            "success": True,
            "message": f"Tipped {amount} coins to {recipient.username}",
            "sender_transaction": sender_tx.id,
            "receiver_transaction": receiver_tx.id
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) 