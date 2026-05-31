from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import (
    UserCreate, UserLogin, UserResponse, UserUpdate, Token,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
)
from auth import hash_password, verify_password, create_access_token, get_current_user, decode_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account and return a JWT token."""
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        city=user_data.city,
        state=user_data.state,
    )
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})

    user_resp = UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        phone=new_user.phone,
        city=new_user.city,
        state=new_user.state,
        is_verified=new_user.is_verified,
        created_at=new_user.created_at,
    )

    return Token(access_token=access_token, token_type="bearer", user=user_resp)


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        city=user.city,
        state=user.state,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )

    return Token(access_token=access_token, token_type="bearer", user=user_resp)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile information."""
    if updates.full_name is not None:
        current_user.full_name = updates.full_name
    if updates.phone is not None:
        current_user.phone = updates.phone
    if updates.city is not None:
        current_user.city = updates.city
    if updates.state is not None:
        current_user.state = updates.state

    await db.flush()
    await db.refresh(current_user)

    return current_user


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    
    if not user:
        return {"message": "If an account exists, a reset link has been sent."}

    from datetime import timedelta
    token = create_access_token(data={"sub": str(user.id), "type": "reset"}, expires_delta=timedelta(hours=1))
    
    print(f"\n========== EMAIL MOCK ==========")
    print(f"To: {user.email}")
    print(f"Subject: Reset your password")
    print(f"Link: https://lexaid-mu.vercel.app/reset-password?token={token}")
    print(f"================================\n")
    
    return {"message": "If an account exists, a reset link has been sent.", "mock_link": f"/reset-password?token={token}"}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        from jose import jwt, JWTError
        from auth import SECRET_KEY, ALGORITHM
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
            
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.hashed_password = hash_password(req.new_password)
        await db.commit()
        return {"message": "Password reset successful"}
        
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")


@router.post("/send-verification")
async def send_verification(current_user: User = Depends(get_current_user)):
    if current_user.is_verified:
        return {"message": "User is already verified"}
        
    from datetime import timedelta
    token = create_access_token(data={"sub": str(current_user.id), "type": "verify"}, expires_delta=timedelta(hours=24))
    
    print(f"\n========== EMAIL MOCK ==========")
    print(f"To: {current_user.email}")
    print(f"Subject: Verify your email")
    print(f"Link: https://lexaid-mu.vercel.app/verify-email?token={token}")
    print(f"================================\n")
    
    return {"message": "Verification email sent", "mock_link": f"/verify-email?token={token}"}


@router.post("/verify-email")
async def verify_email(req: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    try:
        from jose import jwt, JWTError
        from auth import SECRET_KEY, ALGORITHM
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "verify":
            raise HTTPException(status_code=400, detail="Invalid token type")
            
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.is_verified = True
        await db.commit()
        return {"message": "Email verified successfully"}
        
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
