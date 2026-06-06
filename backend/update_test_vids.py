import sqlite3
conn = sqlite3.connect('community_v7.db')
videos = [
    (1, 'https://www.youtube.com/watch?v=yW66-zS3u0c'),
    (2, 'https://www.youtube.com/watch?v=kY0R_K3Xp2k'),
    (3, 'https://www.youtube.com/watch?v=Fm5iZf99999'),
    (4, 'https://www.youtube.com/watch?v=9bZkp7q19f0'),
    (5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
]
for vid_id, url in videos:
    conn.execute('UPDATE videos SET youtube_url = ? WHERE id = ?', (url, vid_id))
conn.commit()
conn.close()
print("Videos updated successfully with test agriculture URLs")
