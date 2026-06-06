import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'marketplace.db')

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            location TEXT,
            is_verified BOOLEAN DEFAULT 0
        )
    ''')
    # Products table
    c.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            images TEXT, -- JSON array of image paths
            location TEXT,
            contact_number TEXT,
            status TEXT DEFAULT 'available', -- 'available' or 'sold'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            translations TEXT, -- JSON mapping for other languages
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Check if we need to insert dummy data
    c.execute('SELECT COUNT(*) FROM products')
    if c.fetchone()[0] == 0:
        c.execute("INSERT OR IGNORE INTO users (id, name, phone, password, location, is_verified) VALUES (1, 'Ramesh Kumar', '9876543210', '1234', 'Ludhiana, Punjab', 1)")
        c.execute("INSERT OR IGNORE INTO users (id, name, phone, password, location, is_verified) VALUES (2, 'Suresh Singh', '9876543211', '1234', 'Karnal, Haryana', 0)")
        dummy_products = [
            (1, 'Used Tractor (2018)', 'machines', 450000, 'Good condition Mahindra tractor.', json.dumps(['tractor.jpg']), 'Ludhiana, Punjab', '9876543210', 'available'),
            (1, 'Premium Wheat Seeds', 'seeds', 1200, 'High yield wheat seeds.', json.dumps(['seeds.jpg']), 'Ludhiana, Punjab', '9876543210', 'available'),
            (2, 'Water Pump 2HP', 'tools', 4500, 'Working condition pump.', json.dumps(['pump.jpg']), 'Karnal, Haryana', '9876543211', 'available')
        ]
        c.executemany("INSERT INTO products (user_id, name, category, price, description, images, location, contact_number, status) VALUES (?,?,?,?,?,?,?,?,?)", dummy_products)
    
    conn.commit()
    conn.close()

init_db()
