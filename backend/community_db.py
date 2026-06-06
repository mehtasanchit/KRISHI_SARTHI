import sqlite3
import os
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), 'community_v7.db')

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
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'farmer', -- 'farmer', 'expert', 'admin'
            reputation INTEGER DEFAULT 0,
            location TEXT DEFAULT 'All India'
        )
    ''')
    
    # Questions table
    c.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT,
            location TEXT,
            report_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Answers table
    c.execute('''
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            answer_text TEXT NOT NULL,
            is_verified BOOLEAN DEFAULT 0,
            report_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Votes table
    c.execute('''
        CREATE TABLE IF NOT EXISTS answer_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answer_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            vote_type INTEGER NOT NULL, -- 1 for up, -1 for down
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (answer_id) REFERENCES answers (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(answer_id, user_id)
        )
    ''')
    
    # Videos table
    c.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            youtube_url TEXT NOT NULL,
            category TEXT,
            language TEXT DEFAULT 'en',
            views INTEGER DEFAULT 0,
            location TEXT DEFAULT 'All India',
            report_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Moderation tracking
    c.execute('''
        CREATE TABLE IF NOT EXISTS item_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item_type TEXT NOT NULL,
            item_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, item_type, item_id)
        )
    ''')

    # Video Watches (History)
    c.execute('''
        CREATE TABLE IF NOT EXISTS video_watches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            video_id INTEGER NOT NULL,
            watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (video_id) REFERENCES videos (id),
            UNIQUE(user_id, video_id)
        )
    ''')

    # Video Bookmarks
    c.execute('''
        CREATE TABLE IF NOT EXISTS video_bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            video_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (video_id) REFERENCES videos (id),
            UNIQUE(user_id, video_id)
        )
    ''')
    
    # Insert some dummy users and data if empty
    c.execute('SELECT COUNT(*) FROM users')
    if c.fetchone()[0] == 0:
        admin_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        farmer_hash = bcrypt.hashpw("farmer123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        expert_hash = bcrypt.hashpw("expert123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        c.executemany("INSERT INTO users (id, name, email, password_hash, role, location) VALUES (?, ?, ?, ?, ?, ?)", [
            (1, 'Admin User', 'admin@krishi.com', admin_hash, 'admin', 'All India'),
            (2, 'Farmer Ram', 'ram@krishi.com', farmer_hash, 'farmer', 'Punjab'),
            (3, 'Expert Singh', 'expert@krishi.com', expert_hash, 'expert', 'Punjab')
        ])
        
        c.executemany("INSERT INTO questions (id, user_id, title, description, category, location) VALUES (?, ?, ?, ?, ?, ?)", [
            (1, 2, "My tomato plant leaves are turning yellow, what should I do?", "The bottom leaves are dying and it's spreading up.", "infestation", "Punjab"),
            (2, 2, "Best time to sow mustard in Punjab?", "When should I plant mustard in the rabi season?", "crops", "Punjab")
        ])
        
        c.executemany("INSERT INTO answers (question_id, user_id, answer_text, is_verified) VALUES (?, ?, ?, ?)", [
            (1, 3, "This is likely early blight. Apply a nitrogen-rich compost tea and remove affected leaves.", 1),
            (2, 3, "Mid-October is ideal. Ensure good soil moisture.", 0)
        ])
        
        c.executemany("INSERT INTO videos (id, title, description, youtube_url, category, language, views, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
            (1, "Modern Organic Cultivation", "Learn advanced techniques for high-yield organic farming.", "https://www.youtube.com/watch?v=0kFj2x_1K0o", "organic", "en", 120, 'All India'),
            (2, "जैविक खेती कैसे करें", "संपूर्ण गाइड", "https://www.youtube.com/watch?v=h2qfXmFf0K8", "organic", "hi", 340, 'All India'),
            (3, "Drip Irrigation Setup", "Save water and improve crop yield with drip systems.", "https://www.youtube.com/watch?v=wN8vF-k48-4", "irrigation", "en", 50, 'All India'),
            (4, "Natural Pest Control", "Make your own neem oil spray.", "https://www.youtube.com/watch?v=A8F11rVw_4U", "pest", "en", 80, 'All India'),
            (5, "Punjab Wheat Sowing Tips", "Optimal techniques for the upcoming Rabi season in Punjab.", "https://www.youtube.com/watch?v=b1A9h_y9_yY", "crops", "pa", 210, 'Punjab')
        ])

        c.executemany("INSERT INTO video_bookmarks (user_id, video_id) VALUES (?, ?)", [(2, 1), (2, 3)])
        c.executemany("INSERT INTO video_watches (user_id, video_id) VALUES (?, ?)", [(2, 1), (2, 5)])
        
    conn.commit()
    conn.close()

init_db()
