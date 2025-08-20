from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.user import User
from schemas.reservation import LocationReservationCreate, LocationReservation, ReservationSummary
from services.reservation_service import ReservationService
from typing import List

router = APIRouter(prefix="/api/reservations", tags=["reservations"])

@router.get("/check-eligibility")
def check_reservation_eligibility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kiểm tra user có thể đặt cọc giữ chỗ không"""
    result = ReservationService.can_user_reserve(db, current_user.id)
    return result

@router.post("/", response_model=LocationReservation)
def create_reservation(
    reservation_data: LocationReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Đặt cọc giữ chỗ location (50 coins)"""
    try:
        reservation = ReservationService.reserve_location(db, current_user.id, reservation_data)
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-reservations", response_model=List[ReservationSummary])
def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách reservations của user hiện tại"""
    reservations = ReservationService.get_user_reservations(db, current_user.id)
    return reservations

@router.get("/{reservation_id}", response_model=LocationReservation)
def get_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thông tin chi tiết reservation"""
    from models.location_reservation import LocationReservation as LocationReservationModel
    
    reservation = db.query(LocationReservationModel).filter(
        LocationReservationModel.id == reservation_id,
        LocationReservationModel.user_id == current_user.id
    ).first()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return reservation

@router.delete("/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Hủy reservation (mất cọc)"""
    try:
        reservation = ReservationService.cancel_reservation(db, reservation_id, current_user.id)
        return {
            "success": True,
            "message": "Reservation cancelled successfully",
            "reservation_id": reservation.id,
            "note": "Deposit (50 coins) is not refunded for cancelled reservations"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/expire-batch")
def expire_reservations_batch(db: Session = Depends(get_db)):
    """Admin endpoint để expire hàng loạt reservations hết hạn"""
    # TODO: Add admin authentication
    expired_count = ReservationService.expire_reservations(db)
    return {
        "success": True,
        "expired_reservations": expired_count,
        "message": f"Expired {expired_count} reservations"
    } 