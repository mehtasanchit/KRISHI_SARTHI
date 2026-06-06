from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
import bcrypt
import community_db

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "krishi_sarthi_super_secure_vault_32"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "farmer" # default
    location: str = "All India"

class LoginRequest(BaseModel):
    email: str
    password: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Convert back to int since we store sub as string for PyJWT 2.x compatibility
        user_id = int(user_id)
        
        conn = community_db.get_db()
        c = conn.cursor()
        c.execute("SELECT id, name, email, role, reputation, location FROM users WHERE id = ?", (user_id,))
        user_row = c.fetchone()
        conn.close()
        
        if not user_row:
            raise HTTPException(status_code=401, detail="User not found")
            
        return dict(user_row)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

@router.post("/signup")
def signup(req: SignupRequest):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pass = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    try:
        c.execute("INSERT INTO users (name, email, password_hash, role, location) VALUES (?, ?, ?, ?, ?)", 
                  (req.name, req.email, hashed_pass, req.role, req.location))
        conn.commit()
        new_id = c.lastrowid
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    conn.close()
        
    token = create_access_token({"sub": str(new_id), "role": req.role})
    return {"access_token": token, "token_type": "bearer", "user": {"id": new_id, "name": req.name, "email": req.email, "role": req.role, "reputation": 0, "location": req.location}}

@router.post("/login")
def login(req: LoginRequest):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    user = c.fetchone()
    conn.close()
    
    if not user or not bcrypt.checkpw(req.password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "reputation": user["reputation"], "location": user["location"]}}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
