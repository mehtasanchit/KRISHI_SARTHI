from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import Optional
import community_db
from auth_api import get_current_user, get_admin_user, SECRET_KEY, ALGORITHM
import jwt

router = APIRouter()

# Models
class QuestionCreate(BaseModel):
    user_id: int
    title: str
    description: str
    category: str
    location: str

class AnswerCreate(BaseModel):
    user_id: int
    question_id: int
    answer_text: str

class VoteCreate(BaseModel):
    vote_type: int # 1 or -1

class VideoCreate(BaseModel):
    title: str
    description: str
    youtube_url: str
    category: str
    language: str
    location: str = "All India"

@router.get("/questions")
def get_questions(category: Optional[str] = None, location: Optional[str] = None):
    conn = community_db.get_db()
    c = conn.cursor()
    query = '''
        SELECT q.*, u.name as user_name, u.reputation as user_reputation,
        (SELECT COUNT(*) FROM answers WHERE question_id = q.id AND report_count < 3) as answer_count
        FROM questions q
        JOIN users u ON q.user_id = u.id
        WHERE q.report_count < 3
    '''
    params = []
    if category:
        query += " AND q.category = ?"
        params.append(category)
    if location:
        query += " AND q.location = ?"
        params.append(location)
    query += " ORDER BY q.created_at DESC"
    
    c.execute(query, params)
    questions = [dict(row) for row in c.fetchall()]
    conn.close()
    return questions

@router.post("/questions")
def create_question(q: QuestionCreate, current_user: dict = Depends(get_current_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO questions (user_id, title, description, category, location)
        VALUES (?, ?, ?, ?, ?)
    ''', (current_user["id"], q.title, q.description, q.category, q.location))
    conn.commit()
    new_id = c.lastrowid
    conn.close()
    return {"id": new_id, "message": "Question created successfully"}

@router.get("/questions/{q_id}")
def get_question_detail(q_id: int):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute('''
        SELECT q.*, u.name as user_name, u.reputation as user_reputation
        FROM questions q
        JOIN users u ON q.user_id = u.id
        WHERE q.id = ? AND q.report_count < 3
    ''', (q_id,))
    q_row = c.fetchone()
    if not q_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Question not found or hidden")
        
    c.execute('''
        SELECT a.*, u.name as user_name, u.role as user_role, u.reputation as user_reputation,
        IFNULL((SELECT SUM(vote_type) FROM answer_votes WHERE answer_id = a.id), 0) as score
        FROM answers a
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id = ? AND a.report_count < 3
        ORDER BY a.is_verified DESC, 
                 CASE WHEN u.role = 'expert' THEN 1 ELSE 0 END DESC, 
                 score DESC, 
                 a.created_at ASC
    ''', (q_id,))
    answers = [dict(row) for row in c.fetchall()]
    
    conn.close()
    result = dict(q_row)
    result["answers"] = answers
    return result

@router.post("/answers")
def create_answer(a: AnswerCreate, current_user: dict = Depends(get_current_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO answers (question_id, user_id, answer_text)
        VALUES (?, ?, ?)
    ''', (a.question_id, current_user["id"], a.answer_text))
    conn.commit()
    conn.close()
    return {"message": "Answer added"}

@router.patch("/answers/{a_id}/verify")
def verify_answer(a_id: int, current_user: dict = Depends(get_admin_user)): 
    conn = community_db.get_db()
    c = conn.cursor()
        
    # Get answer
    c.execute("SELECT question_id FROM answers WHERE id = ?", (a_id,))
    ans = c.fetchone()
    if not ans:
        conn.close()
        raise HTTPException(status_code=404, detail="Answer not found")
        
    question_id = ans["question_id"]
    
    # Unverify all other answers for this question
    c.execute("SELECT id, user_id, is_verified FROM answers WHERE question_id = ?", (question_id,))
    all_answers = c.fetchall()
    
    for a in all_answers:
        if a["id"] == a_id and not a["is_verified"]:
            # Newly verified: +50 to reputation
            c.execute("UPDATE users SET reputation = reputation + 50 WHERE id = ?", (a["user_id"],))
            c.execute("UPDATE answers SET is_verified = 1 WHERE id = ?", (a_id,))
        elif a["id"] != a_id and a["is_verified"]:
            # Lost verified status: -50 from reputation
            c.execute("UPDATE users SET reputation = reputation - 50 WHERE id = ?", (a["user_id"],))
            c.execute("UPDATE answers SET is_verified = 0 WHERE id = ?", (a["id"],))

    conn.commit()
    conn.close()
    return {"message": "Answer verified"}

@router.post("/answers/{a_id}/vote")
def vote_answer(a_id: int, v: VoteCreate, current_user: dict = Depends(get_current_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    
    # Check if answer exists and get author id
    c.execute("SELECT user_id FROM answers WHERE id = ?", (a_id,))
    ans = c.fetchone()
    if not ans:
        conn.close()
        raise HTTPException(status_code=404, detail="Answer not found")
        
    author_id = ans["user_id"]
    if author_id == current_user["id"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot vote on your own answer")
        
    vote_val = 1 if v.vote_type > 0 else -1
    
    c.execute("SELECT vote_type FROM answer_votes WHERE answer_id = ? AND user_id = ?", (a_id, current_user["id"]))
    existing_vote = c.fetchone()
    
    if existing_vote:
        old_vote = existing_vote["vote_type"]
        if old_vote == vote_val:
            # Removing vote
            c.execute("DELETE FROM answer_votes WHERE answer_id = ? AND user_id = ?", (a_id, current_user["id"]))
            rep_diff = -10 if old_vote == 1 else 10 # if they remove an upvote, rep goes down 10. If they remove a downvote, rep usually stays same or goes up 10 (StackOverflow doesn't deduct for receiving downvote typically but giving it costs rep. For simplicity, let's say removing downvote gives +0 or +2. Let's make it symmetric for simplicity: up is +10, down is -10. Removing up is -10, removing down is +10). Let's use simple logic: +10 per upvote, downvotes don't deduct rep. 
            if old_vote == 1:
                c.execute("UPDATE users SET reputation = reputation - 10 WHERE id = ?", (author_id,))
        else:
            # Changing vote
            c.execute("UPDATE answer_votes SET vote_type = ? WHERE answer_id = ? AND user_id = ?", (vote_val, a_id, current_user["id"]))
            if vote_val == 1:
                # Was downvote (-1), now upvote (1). Add 10 rep.
                c.execute("UPDATE users SET reputation = reputation + 10 WHERE id = ?", (author_id,))
            else:
                # Was upvote (1), now downvote (-1). Subtract 10 rep.
                c.execute("UPDATE users SET reputation = reputation - 10 WHERE id = ?", (author_id,))
    else:
        # New vote
        c.execute("INSERT INTO answer_votes (answer_id, user_id, vote_type) VALUES (?, ?, ?)", (a_id, current_user["id"], vote_val))
        if vote_val == 1:
            c.execute("UPDATE users SET reputation = reputation + 10 WHERE id = ?", (author_id,))
            
    conn.commit()
    conn.close()
    return {"message": "Vote processed"}

@router.get("/videos/dashboard")
def get_video_dashboard(request: Request):
    user_id = None
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        try:
            payload = jwt.decode(auth.split(" ")[1], SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub"))
        except:
            pass
            
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM videos WHERE report_count < 3 ORDER BY views DESC LIMIT 6")
    popular = [dict(row) for row in c.fetchall()]
    
    saved = []
    continue_w = []
    recommended = popular
    region_specific = []
    
    if user_id:
        c.execute("SELECT location FROM users WHERE id = ?", (user_id,))
        u = c.fetchone()
        user_loc = u["location"] if u else "All India"
        
        if user_loc != "All India":
            c.execute("SELECT * FROM videos WHERE (location = ? OR location = 'All India') AND report_count < 3 ORDER BY views DESC LIMIT 6", (user_loc,))
            region_specific = [dict(row) for row in c.fetchall()]
            
        c.execute("SELECT v.* FROM videos v JOIN video_bookmarks b ON v.id = b.video_id WHERE b.user_id = ? AND v.report_count < 3 ORDER BY b.created_at DESC", (user_id,))
        saved = [dict(row) for row in c.fetchall()]
        
        c.execute("SELECT v.* FROM videos v JOIN video_watches w ON v.id = w.video_id WHERE w.user_id = ? AND v.report_count < 3 ORDER BY w.watched_at DESC LIMIT 6", (user_id,))
        continue_w = [dict(row) for row in c.fetchall()]
        
        c.execute("SELECT category FROM video_watches w JOIN videos v ON w.video_id = v.id WHERE w.user_id = ? AND v.report_count < 3 GROUP BY category ORDER BY COUNT(*) DESC LIMIT 2", (user_id,))
        cats = [row["category"] for row in c.fetchall()]
        if cats:
            places = ",".join("?" * len(cats))
            c.execute(f"SELECT * FROM videos WHERE category IN ({places}) AND report_count < 3 ORDER BY views DESC LIMIT 6", cats)
            recommended = [dict(row) for row in c.fetchall()]
            
    conn.close()
    return {
        "popular": popular,
        "saved": saved,
        "continue_watching": continue_w,
        "recommended": recommended,
        "region_specific": region_specific
    }

@router.post("/videos/{v_id}/watch")
def watch_video(v_id: int, request: Request):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("UPDATE videos SET views = views + 1 WHERE id = ?", (v_id,))
    
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        try:
            payload = jwt.decode(auth.split(" ")[1], SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub"))
            if user_id:
                c.execute("INSERT INTO video_watches (user_id, video_id) VALUES (?, ?) ON CONFLICT(user_id, video_id) DO UPDATE SET watched_at = CURRENT_TIMESTAMP", (user_id, v_id))
        except:
            pass

    conn.commit()
    conn.close()
    return {"message": "Watched"}

@router.post("/videos/{v_id}/bookmark")
def toggle_bookmark(v_id: int, current_user: dict = Depends(get_current_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM video_bookmarks WHERE user_id = ? AND video_id = ?", (current_user["id"], v_id))
    bm = c.fetchone()
    if bm:
        c.execute("DELETE FROM video_bookmarks WHERE id = ?", (bm["id"],))
        msg = "Removed from saved"
    else:
        c.execute("INSERT INTO video_bookmarks (user_id, video_id) VALUES (?, ?)", (current_user["id"], v_id))
        msg = "Saved to bookmarks"
    conn.commit()
    conn.close()
    return {"message": msg, "bookmarked": not bm}

@router.get("/videos/{v_id}/related")
def get_related_videos(v_id: int):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("SELECT category FROM videos WHERE id = ?", (v_id,))
    cat = c.fetchone()
    if not cat:
        conn.close()
        return []
    c.execute("SELECT * FROM videos WHERE category = ? AND id != ? ORDER BY views DESC LIMIT 4", (cat["category"], v_id))
    res = [dict(row) for row in c.fetchall()]
    conn.close()
    return res

@router.get("/videos")
def get_videos(category: Optional[str] = None, language: Optional[str] = None):
    conn = community_db.get_db()
    c = conn.cursor()
    query = "SELECT * FROM videos WHERE 1=1"
    params = []
    if category:
        query += " AND category = ?"
        params.append(category)
    if language:
        query += " AND language = ?"
        params.append(language)
    query += " ORDER BY created_at DESC"
    
    c.execute(query, params)
    videos = [dict(row) for row in c.fetchall()]
    conn.close()
    return videos

@router.post("/videos")
def create_video(v: VideoCreate, current_user: dict = Depends(get_admin_user)):
    conn = community_db.get_db()
    c = conn.cursor()
        
    c.execute('''
        INSERT INTO videos (title, description, youtube_url, category, language, location)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (v.title, v.description, v.youtube_url, v.category, v.language, v.location))
    conn.commit()
    conn.close()
    return {"message": "Video added"}

@router.get("/users")
def get_users(current_user: dict = Depends(get_admin_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute('''
        SELECT u.id, u.name, u.email, u.role, u.reputation,
        (SELECT COUNT(*) FROM answers WHERE user_id = u.id) as answer_count
        FROM users u
        ORDER BY u.role, u.reputation DESC
    ''')
    users = [dict(row) for row in c.fetchall()]
    conn.close()
    return users

class ReportCreate(BaseModel):
    item_type: str
    item_id: int

@router.post("/report")
def report_content(r: ReportCreate, current_user: dict = Depends(get_current_user)):
    if r.item_type not in ["question", "answer", "video"]:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    conn = community_db.get_db()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO item_reports (user_id, item_type, item_id) VALUES (?, ?, ?)", (current_user["id"], r.item_type, r.item_id))
        if r.item_type == "question":
            c.execute("UPDATE questions SET report_count = report_count + 1 WHERE id = ?", (r.item_id,))
        elif r.item_type == "answer":
            c.execute("UPDATE answers SET report_count = report_count + 1 WHERE id = ?", (r.item_id,))
        elif r.item_type == "video":
            c.execute("UPDATE videos SET report_count = report_count + 1 WHERE id = ?", (r.item_id,))
        conn.commit()
    except:
        pass # Already reported
    conn.close()
    return {"message": "Content reported to moderators"}

@router.delete("/questions/{q_id}")
def delete_question(q_id: int, current_user: dict = Depends(get_admin_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("DELETE FROM questions WHERE id = ?", (q_id,))
    c.execute("DELETE FROM answers WHERE question_id = ?", (q_id,))
    conn.commit()
    conn.close()
    return {"message": "Question deleted"}

@router.delete("/answers/{a_id}")
def delete_answer(a_id: int, current_user: dict = Depends(get_admin_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("DELETE FROM answers WHERE id = ?", (a_id,))
    conn.commit()
    conn.close()
    return {"message": "Answer deleted"}

@router.delete("/videos/{v_id}")
def delete_video(v_id: int, current_user: dict = Depends(get_admin_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("DELETE FROM videos WHERE id = ?", (v_id,))
    conn.commit()
    conn.close()
    return {"message": "Video deleted"}

class RoleUpdate(BaseModel):
    role: str

@router.patch("/users/{u_id}/role")
def update_user_role(u_id: int, r: RoleUpdate, current_user: dict = Depends(get_admin_user)):
    if r.role not in ['farmer', 'expert', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("UPDATE users SET role = ? WHERE id = ?", (r.role, u_id))
    conn.commit()
    conn.close()
    return {"message": f"User upgraded to {r.role}"}

@router.get("/videos/{v_id}")
def get_video_detail(v_id: int):
    conn = community_db.get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM videos WHERE id = ?", (v_id,))
    v = c.fetchone()
    conn.close()
    if not v:
        raise HTTPException(status_code=404, detail="Video not found")
    return dict(v)

@router.get("/admin/analytics")
def get_analytics(current_user: dict = Depends(get_admin_user)):
    conn = community_db.get_db()
    c = conn.cursor()
    
    # Totals
    c.execute("SELECT COUNT(*) FROM users")
    total_users = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM questions")
    total_questions = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM answers")
    total_answers = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM videos")
    total_videos = c.fetchone()[0]
    
    # Active Users
    c.execute('''
        SELECT u.name, u.reputation, COUNT(a.id) as answer_count
        FROM users u
        LEFT JOIN answers a ON u.id = a.user_id
        GROUP BY u.id
        ORDER BY answer_count DESC
        LIMIT 5
    ''')
    active_users = [dict(row) for row in c.fetchall()]
    
    # Viewed Videos
    c.execute("SELECT title, views FROM videos ORDER BY views DESC LIMIT 5")
    top_videos = [dict(row) for row in c.fetchall()]
    
    conn.close()
    
    return {
        "totals": {
            "users": total_users,
            "questions": total_questions,
            "answers": total_answers,
            "videos": total_videos
        },
        "top_users": active_users,
        "top_videos": top_videos
    }
