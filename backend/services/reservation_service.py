from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from models.location_reservation import LocationReservation, ReservationStatus
from models.user import User
from models.review import Review
from core.utils import normalize_location
from services.coin_service import CoinService
from schemas.coin import CoinTransactionCreate
from schemas.reservation import LocationReservationCreate

class ReservationService:
    
    @staticmethod
    def can_user_reserve(db: Session, user_id: int) -> dict:
        """Kiểm tra user có thể đặt cọc không"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"can_reserve": False, "reason": "User not found"}
        
        # Check if user has enough coins (50 minimum)
        if user.coin_balance < 50:
            return {"can_reserve": False, "reason": "Insufficient coins (need 50 coins minimum)"}
        
        # Check if user already has an active reservation
        active_reservation = db.query(LocationReservation).filter(
            and_(
                LocationReservation.user_id == user_id,
                LocationReservation.status == ReservationStatus.ACTIVE
            )
        ).first()
        
        if active_reservation:
            return {
                "can_reserve": False, 
                "reason": "You already have an active reservation",
                "existing_reservation": {
                    "id": active_reservation.id,
                    "location_name": active_reservation.location_name,
                    "hours_remaining": active_reservation.hours_remaining
                }
            }
        
        # Check if user is in "cooldown" period (lost deposit within 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_expired = db.query(LocationReservation).filter(
            and_(
                LocationReservation.user_id == user_id,
                LocationReservation.status == ReservationStatus.EXPIRED,
                LocationReservation.expires_at > seven_days_ago
            )
        ).first()
        
        if recent_expired:
            return {
                "can_reserve": False,
                "reason": "Cooldown period active (7 days after losing deposit)",
                "cooldown_until": recent_expired.expires_at + timedelta(days=7)
            }
        
        return {"can_reserve": True}
    
    @staticmethod
    def reserve_location(db: Session, user_id: int, reservation_data: LocationReservationCreate) -> LocationReservation:
        """Đặt cọc giữ chỗ location"""
        # Check if user can reserve
        can_reserve = ReservationService.can_user_reserve(db, user_id)
        if not can_reserve["can_reserve"]:
            raise ValueError(can_reserve["reason"])
        
        location_key = normalize_location(reservation_data.location_name, reservation_data.address)
        
        # Check if location already has review or active reservation
        existing_review = db.query(Review).filter(Review.location_key == location_key).first()
        if existing_review:
            raise ValueError("Location already has a review")
        
        active_reservation = db.query(LocationReservation).filter(
            and_(
                LocationReservation.location_key == location_key,
                LocationReservation.status == ReservationStatus.ACTIVE
            )
        ).first()
        
        if active_reservation:
            raise ValueError(f"Location is already reserved by another user until {active_reservation.expires_at}")
        
        # Deduct 50 coins from user
        coin_transaction = CoinService.spend_coins(
            db, user_id, 50, 
            f"Location reservation deposit: {reservation_data.location_name}",
            reference_type="location_reservation"
        )
        
        # Create reservation
        reservation = LocationReservation(
            location_name=reservation_data.location_name,
            address=reservation_data.address,
            location_key=location_key,
            user_id=user_id,
            coin_transaction_id=coin_transaction.id
        )
        
        db.add(reservation)
        db.commit()
        db.refresh(reservation)
        
        return reservation
    
    @staticmethod
    def complete_reservation(db: Session, reservation_id: int, review_id: int) -> LocationReservation:
        """Hoàn thành reservation khi review được tạo"""
        reservation = db.query(LocationReservation).filter(
            LocationReservation.id == reservation_id
        ).first()
        
        if not reservation:
            raise ValueError("Reservation not found")
        
        if reservation.status != ReservationStatus.ACTIVE:
            raise ValueError("Reservation is not active")
        
        # Update reservation
        reservation.status = ReservationStatus.COMPLETED
        reservation.completed_at = datetime.utcnow()
        reservation.review_id = review_id
        
        # Refund deposit
        CoinService.add_transaction(
            db, reservation.user_id,
            CoinTransactionCreate(
                amount=50,
                transaction_type="refund",
                description=f"Deposit refund: Successfully created review for '{reservation.location_name}'",
                reference_id=review_id,
                reference_type="reservation_completion"
            )
        )
        
        db.commit()
        db.refresh(reservation)
        return reservation
    
    @staticmethod
    def expire_reservations(db: Session) -> int:
        """Batch job để expire các reservations hết hạn"""
        now = datetime.utcnow()
        
        expired_reservations = db.query(LocationReservation).filter(
            and_(
                LocationReservation.status == ReservationStatus.ACTIVE,
                LocationReservation.expires_at < now
            )
        ).all()
        
        for reservation in expired_reservations:
            reservation.status = ReservationStatus.EXPIRED
        
        db.commit()
        return len(expired_reservations)
    
    @staticmethod
    def cancel_reservation(db: Session, reservation_id: int, user_id: int) -> LocationReservation:
        """Hủy reservation (không hoàn tiền cọc)"""
        reservation = db.query(LocationReservation).filter(
            and_(
                LocationReservation.id == reservation_id,
                LocationReservation.user_id == user_id,
                LocationReservation.status == ReservationStatus.ACTIVE
            )
        ).first()
        
        if not reservation:
            raise ValueError("Active reservation not found")
        
        reservation.status = ReservationStatus.CANCELLED
        db.commit()
        db.refresh(reservation)
        
        return reservation
    
    @staticmethod
    def get_user_reservations(db: Session, user_id: int) -> list[LocationReservation]:
        """Lấy tất cả reservations của user"""
        return db.query(LocationReservation).filter(
            LocationReservation.user_id == user_id
        ).order_by(LocationReservation.reserved_at.desc()).all() 