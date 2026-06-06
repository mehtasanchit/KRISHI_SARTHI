from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import json
import os
import shutil
from datetime import datetime
from pydantic import BaseModel
from marketplace_db import get_db
from ai_config import translate_content

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class UserAuth(BaseModel):
    name: Optional[str] = None
    phone: str
    password: str
    location: Optional[str] = None

class ProductCreate(BaseModel):
    user_id: int
    name: str
    category: str
    price: float
    description: str
    location: str
    contact_number: str

@router.post("/auth/register")
def register(user: UserAuth):
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (name, phone, password, location) VALUES (?, ?, ?, ?)",
                  (user.name, user.phone, user.password, user.location))
        user_id = c.lastrowid
        conn.commit()
        return {"id": user_id, "name": user.name, "phone": user.phone, "location": user.location}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Phone number already registered")
    finally:
        conn.close()

@router.post("/auth/login")
def login(user: UserAuth):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, name, phone, location, is_verified FROM users WHERE phone=? AND password=?", (user.phone, user.password))
    row = c.fetchone()
    conn.close()
    if row:
        return {"id": row["id"], "name": row["name"], "phone": row["phone"], "location": row["location"], "is_verified": bool(row["is_verified"])}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/products")
def get_products(category: str = "", search: str = "", sort: str = "", user_id: int = 0):
    conn = get_db()
    c = conn.cursor()
    
    query = "SELECT p.*, u.name as seller_name, u.is_verified FROM products p JOIN users u ON p.user_id = u.id WHERE p.status = 'available'"
    params = []
    
    if category:
        query += " AND p.category = ?"
        params.append(category)
    if search:
        query += " AND p.name LIKE ?"
        params.append(f"%{search}%")
    if user_id > 0:
        # override status filter for user dashboard to show all
        query = "SELECT p.*, u.name as seller_name, u.is_verified FROM products p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?"
        params = [user_id]
        
    if sort == 'price_asc':
        query += " ORDER BY p.price ASC"
    elif sort == 'price_desc':
        query += " ORDER BY p.price DESC"
    else:
        query += " ORDER BY p.created_at DESC"
        
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        item = dict(r)
        # Handle images gracefully if json decoding fails
        try:
            item["images"] = json.loads(item["images"]) if item["images"] else []
        except:
            item["images"] = [item["images"]] if item["images"] else []
        
        try:
            item["translations"] = json.loads(item["translations"]) if item["translations"] else {}
        except:
            item["translations"] = {}
        results.append(item)
    return results

@router.post("/products")
async def create_product(
    user_id: int = Form(...),
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    description: str = Form(""),
    location: str = Form(""),
    contact_number: str = Form(...),
    images: List[UploadFile] = File(None)
):
    image_paths = []
    if images:
        for image in images:
            if image.filename:
                # Basic unique filename
                filename = f"{datetime.now().timestamp()}_{image.filename}"
                filepath = os.path.join(UPLOAD_DIR, filename)
                with open(filepath, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                image_paths.append(filename)
                
    # Automated Translation using Gemini
    target_langs = ['hi', 'pa', 'mr', 'ta', 'te', 'bn']
    translations_map = translate_content(name, description, location, target_langs)
    
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO products (user_id, name, category, price, description, location, contact_number, images, translations)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, name, category, price, description, location, contact_number, json.dumps(image_paths), json.dumps(translations_map)))
    conn.commit()
    conn.close()
    return {"message": "Product created successfully"}

@router.put("/products/{product_id}/status")
def update_status(product_id: int, status: str = Form(...)):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE products SET status = ? WHERE id = ?", (status, product_id))
    conn.commit()
    conn.close()
    return {"message": "Status updated"}

@router.delete("/products/{product_id}")
def delete_product(product_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"message": "Product deleted"}
