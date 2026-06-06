import sqlite3
conn = sqlite3.connect('community_v7.db')
videos = [
    (1, 'Modern Organic Cultivation', 'Learn how Two Brothers Organic Farm manages their fields scientifically.', 'https://www.youtube.com/watch?v=k8yJ7g3L80U', 'ORGANIC'),
    (2, 'Organic Farming Business', 'A complete guide on starting and scaling an organic farming venture in India.', 'https://www.youtube.com/watch?v=9B8l_o3V6_M', 'BUSINESS'),
    (3, 'Ancient Farming Wisdom', 'Traditional Indian farming secrets that are still relevant today.', 'https://www.youtube.com/watch?v=c-4r7QzO5Yw', 'TRADITIONAL'),
    (4, 'The Organic Village', 'Exploring an entire village in India that has successfully converted to 100% organic.', 'https://www.youtube.com/watch?v=4S6r9p2G1kU', 'SUCCESS STORY'),
    (5, 'Young Organic Pioneers', 'Case study of a young couple using modern technology for organic success.', 'https://www.youtube.com/watch?v=v_4xI7jA9zY', 'CASE STUDY')
]
for vid_id, title, desc, url, cat in videos:
    conn.execute('UPDATE videos SET title = ?, description = ?, youtube_url = ?, category = ? WHERE id = ?', (title, desc, url, cat, vid_id))
conn.commit()
conn.close()
print("Videos updated with relevant agricultural content")
