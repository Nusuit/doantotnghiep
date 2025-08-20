from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from core.database import get_db
from core.utils import normalize_location, is_similar_location
from models.review import Review
from models.user import User
from schemas.review import ReviewCreate, Review as ReviewSchema, ReviewSummary, ReviewUpdate
from core.security import get_current_user
from services.coin_service import CoinService
from services.reservation_service import ReservationService
from typing import List, Optional

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.post("/check-location")
async def check_location_availability(
    location_name: str,
    address: str,
    db: Session = Depends(get_db)
):
    """
    Kiểm tra xem location đã có review chưa
    Trả về thông tin nếu có conflict hoặc reservation
    """
    location_key = normalize_location(location_name, address)
    
    # Kiểm tra exact match với review
    existing_review = db.query(Review).filter(Review.location_key == location_key).first()
    if existing_review:
        return {
            "available": False,
            "conflict_type": "review_exists",
            "existing_review": {
                "id": existing_review.id,
                "title": existing_review.title,
                "location_name": existing_review.location_name,
                "address": existing_review.address,
                "owner": existing_review.owner.username
            },
            "message": f"Địa điểm này đã có review: '{existing_review.title}'"
        }
    
    # Kiểm tra active reservation
    from models.location_reservation import LocationReservation, ReservationStatus
    active_reservation = db.query(LocationReservation).filter(
        and_(
            LocationReservation.location_key == location_key,
            LocationReservation.status == ReservationStatus.ACTIVE
        )
    ).first()
    
    if active_reservation:
        return {
            "available": False,
            "conflict_type": "reserved",
            "reservation": {
                "id": active_reservation.id,
                "location_name": active_reservation.location_name,
                "reserved_by": "someone_else",  # Don't expose user info
                "expires_at": active_reservation.expires_at.isoformat(),
                "hours_remaining": active_reservation.hours_remaining
            },
            "message": f"Địa điểm này đã được ai đó giữ chỗ. Hết hạn sau {active_reservation.hours_remaining:.1f} giờ."
        }
    
    # Kiểm tra similar locations
    all_reviews = db.query(Review).all()
    for review in all_reviews:
        if is_similar_location(location_key, review.location_key, threshold=0.8):
            return {
                "available": False,
                "conflict_type": "similar",
                "existing_review": {
                    "id": review.id,
                    "title": review.title,
                    "location_name": review.location_name,
                    "address": review.address,
                    "owner": review.owner.username
                },
                "message": f"Tìm thấy địa điểm tương tự: '{review.title}'. Có phải cùng một nơi không?"
            }
    
    return {
        "available": True,
        "location_key": location_key,
        "message": "Địa điểm này có thể tạo review hoặc đặt cọc giữ chỗ!",
        "suggestions": {
            "can_create_immediately": True,
            "can_reserve": True
        }
    }

@router.post("/", response_model=ReviewSchema)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tạo location_key chuẩn hóa
    location_key = normalize_location(review_in.location_name, review_in.address)
    
    # Kiểm tra conflict
    existing_review = db.query(Review).filter(Review.location_key == location_key).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Địa điểm này đã có review",
                "existing_review": {
                    "id": existing_review.id,
                    "title": existing_review.title,
                    "owner": existing_review.owner.username
                }
            }
        )
    
    # Kiểm tra similar locations
    all_reviews = db.query(Review).all()
    for review in all_reviews:
        if is_similar_location(location_key, review.location_key, threshold=0.85):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Tìm thấy địa điểm tương tự",
                    "similar_review": {
                        "id": review.id,
                        "title": review.title,
                        "location_name": review.location_name,
                        "address": review.address,
                        "owner": review.owner.username
                    },
                    "suggestion": "Vui lòng kiểm tra xem có phải cùng một địa điểm không. Nếu đúng, hãy đề xuất chỉnh sửa thay vì tạo mới."
                }
            )
    
    # Tạo review mới
    review_data = review_in.dict()
    review_data['location_key'] = location_key
    review_data['owner_id'] = current_user.id
    
    review = Review(**review_data)
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Check và complete reservation nếu user có active reservation cho location này
    from models.location_reservation import LocationReservation, ReservationStatus
    user_reservation = db.query(LocationReservation).filter(
        and_(
            LocationReservation.user_id == current_user.id,
            LocationReservation.location_key == location_key,
            LocationReservation.status == ReservationStatus.ACTIVE
        )
    ).first()
    
    if user_reservation:
        # Complete reservation và refund deposit
        try:
            ReservationService.complete_reservation(db, user_reservation.id, review.id)
        except Exception as e:
            print(f"Warning: Failed to complete reservation: {e}")
    
    # Thưởng 50 coin cho user khi tạo review thành công
    try:
        CoinService.reward_user(
            db, current_user.id, 50, 
            f"Review creation reward: '{review.title}'",
            reference_id=review.id,
            reference_type="review_creation"
        )
    except Exception as e:
        print(f"Warning: Failed to reward coins for review creation: {e}")
        # Không fail toàn bộ request nếu coin reward có lỗi
    
    return review

@router.get("/", response_model=List[ReviewSummary])
def get_reviews(
    skip: int = Query(0, ge=0, description="Number of reviews to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of reviews to return"),
    search: Optional[str] = Query(None, description="Search in title and location"),
    db: Session = Depends(get_db)
):
    query = db.query(Review).filter(Review.is_published == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Review.title.ilike(search_term),
                Review.location_name.ilike(search_term),
                Review.address.ilike(search_term)
            )
        )
    
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return reviews

@router.get("/{review_id}", response_model=ReviewSchema)
def get_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.is_published == True
    ).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    return review

@router.put("/{review_id}", response_model=ReviewSchema)
def update_review(
    review_id: int,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    
    # Chỉ owner mới được update
    if review.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You can only edit your own reviews"
        )
    
    # Update fields
    update_data = review_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(review, field, value)
    
    db.commit()
    db.refresh(review)
    return review

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Review not found"
        )
    
    # Chỉ owner hoặc admin mới được xóa
    if review.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You can only delete your own reviews"
        )
    
    # Soft delete
    review.is_published = False
    db.commit()
    
    return None

@router.get("/location/{location_key}", response_model=ReviewSchema)
def get_review_by_location(location_key: str, db: Session = Depends(get_db)):
    """Lấy review theo location key"""
    review = db.query(Review).filter(
        Review.location_key == location_key,
        Review.is_published == True
    ).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No review found for this location"
        )
    
    return review 