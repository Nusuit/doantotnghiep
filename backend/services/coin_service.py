from sqlalchemy.orm import Session
from sqlalchemy import func
from models.user import User
from models.coin_transaction import CoinTransaction, TransactionType
from schemas.coin import CoinTransactionCreate, CoinBalance

class CoinService:
    
    @staticmethod
    def get_user_balance(db: Session, user_id: int) -> CoinBalance:
        """Lấy thông tin chi tiết về balance của user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Tính tổng earned và spent
        transactions = db.query(CoinTransaction).filter(CoinTransaction.user_id == user_id).all()
        
        total_earned = sum(t.amount for t in transactions if t.amount > 0)
        total_spent = abs(sum(t.amount for t in transactions if t.amount < 0))
        
        # Recent transactions (last 10)
        recent = db.query(CoinTransaction)\
                  .filter(CoinTransaction.user_id == user_id)\
                  .order_by(CoinTransaction.created_at.desc())\
                  .limit(10).all()
        
        return CoinBalance(
            user_id=user_id,
            current_balance=user.coin_balance,
            total_earned=total_earned,
            total_spent=total_spent,
            recent_transactions=recent
        )
    
    @staticmethod
    def add_transaction(db: Session, user_id: int, transaction_data: CoinTransactionCreate) -> CoinTransaction:
        """Thêm transaction và update user balance"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Kiểm tra balance nếu là transaction âm
        if transaction_data.amount < 0 and user.coin_balance + transaction_data.amount < 0:
            raise ValueError("Insufficient coin balance")
        
        # Tạo transaction
        transaction = CoinTransaction(
            user_id=user_id,
            **transaction_data.dict()
        )
        db.add(transaction)
        
        # Update user balance
        user.coin_balance += transaction_data.amount
        
        db.commit()
        db.refresh(transaction)
        
        return transaction
    
    @staticmethod
    def reward_user(db: Session, user_id: int, amount: int, description: str, 
                   reference_id: int = None, reference_type: str = None) -> CoinTransaction:
        """Shortcut để thưởng coin cho user"""
        transaction_data = CoinTransactionCreate(
            amount=amount,
            transaction_type=TransactionType.REWARD,
            description=description,
            reference_id=reference_id,
            reference_type=reference_type
        )
        
        return CoinService.add_transaction(db, user_id, transaction_data)
    
    @staticmethod
    def spend_coins(db: Session, user_id: int, amount: int, description: str,
                   reference_id: int = None, reference_type: str = None) -> CoinTransaction:
        """Shortcut để user chi coin"""
        if amount <= 0:
            raise ValueError("Spend amount must be positive")
            
        transaction_data = CoinTransactionCreate(
            amount=-amount,  # Negative for spending
            transaction_type=TransactionType.SPENT,
            description=description,
            reference_id=reference_id,
            reference_type=reference_type
        )
        
        return CoinService.add_transaction(db, user_id, transaction_data)
    
    @staticmethod
    def can_afford(db: Session, user_id: int, amount: int) -> bool:
        """Kiểm tra user có đủ coin không"""
        user = db.query(User).filter(User.id == user_id).first()
        return user and user.coin_balance >= amount
    
    @staticmethod 
    def transfer_coins(db: Session, from_user_id: int, to_user_id: int, 
                      amount: int, description: str) -> tuple[CoinTransaction, CoinTransaction]:
        """Transfer coin giữa 2 users (để tip)"""
        if amount <= 0:
            raise ValueError("Transfer amount must be positive")
            
        # Kiểm tra balance của sender
        if not CoinService.can_afford(db, from_user_id, amount):
            raise ValueError("Insufficient balance for transfer")
        
        # Sender transaction (negative)
        sender_transaction = CoinService.add_transaction(
            db, from_user_id,
            CoinTransactionCreate(
                amount=-amount,
                transaction_type=TransactionType.SPENT,
                description=f"Tip sent: {description}",
                reference_id=to_user_id,
                reference_type="user_tip"
            )
        )
        
        # Receiver transaction (positive) 
        receiver_transaction = CoinService.add_transaction(
            db, to_user_id,
            CoinTransactionCreate(
                amount=amount,
                transaction_type=TransactionType.EARNED,
                description=f"Tip received: {description}",
                reference_id=from_user_id,
                reference_type="user_tip"
            )
        )
        
        return sender_transaction, receiver_transaction 