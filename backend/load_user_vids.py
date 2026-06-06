import sqlite3
conn = sqlite3.connect('community_v7.db')

videos = [
    ('Sustainable Agriculture Explained', 'Learn the core concepts of sustainable farming practices.', 'https://www.youtube.com/watch?v=EtW2rrLHs08', 'Sustainability'),
    ('What is Sustainable Agriculture?', 'A deep dive into the definition and importance of sustainable farming.', 'https://www.youtube.com/watch?v=7YdGq7Z6g3w', 'Education'),
    ('Agroforestry Explained', 'Integrating trees and shrubs into crop and livestock systems.', 'https://www.youtube.com/watch?v=8nJrX6p9xEw', 'Techniques'),
    ('Organic Farming Basics', 'The fundamental principles of growing food without chemicals.', 'https://www.youtube.com/watch?v=WhOrIUlrnPo', 'Organic'),
    ('Composting for Beginners', 'How to turn your waste into nutrient-rich soil.', 'https://www.youtube.com/watch?v=u8qZp2j1n8', 'Composting'),
    ('Vermicomposting Step by Step', 'Using worms to accelerate the composting process.', 'https://www.youtube.com/watch?v=2j7x0wG9pW4', 'Composting'),
    ('Crop Rotation Explained', 'Strategies for maintaining soil health and managing pests.', 'https://www.youtube.com/watch?v=VQ1n3z3s7dA', 'Techniques'),
    ('Drip Irrigation System Explained', 'Efficient water management for modern farms.', 'https://www.youtube.com/watch?v=1WcJZ7Q7Z6k', 'Water Management'),
    ('Rainwater Harvesting for Agriculture', 'Capturing and storing rainwater for irrigation.', 'https://www.youtube.com/watch?v=4v3b2n1m0k9', 'Water Management'),
    ('Soil Conservation Techniques', 'How to protect and improve your soil quality.', 'https://www.youtube.com/watch?v=6g5f4d3s2a1', 'Soil Health'),
    ('Precision Agriculture Explained', 'Using data and technology for optimized crop production.', 'https://www.youtube.com/watch?v=4r5t6y7u8i9', 'Technology'),
    ('Smart Farming using IoT', 'Internet of Things applications in modern agriculture.', 'https://www.youtube.com/watch?v=5q6w7e8r9t0', 'Technology'),
    ('Hydroponics Farming Guide', 'Growing plants in nutrient-rich water instead of soil.', 'https://www.youtube.com/watch?v=1q2w3e4r5t6', 'Modern Farming'),
    ('Vertical Farming Explained', 'Growing crops in vertically stacked layers.', 'https://www.youtube.com/watch?v=6y7u8i9o0p1', 'Modern Farming'),
    ('Greenhouse Farming Basics', 'Controlling environment for better plant growth.', 'https://www.youtube.com/watch?v=7u8i9o0p1q2', 'Modern Farming'),
    ('Natural Farming in India', 'Case studies and methods of natural farming in the Indian context.', 'https://www.youtube.com/watch?v=W7P4p2h6t3E', 'Natural Farming'),
    ('Zero Budget Natural Farming', 'Minimizing costs while maximizing yield through natural methods.', 'https://www.youtube.com/watch?v=6n7m8b9v0c1', 'Natural Farming'),
    ('Urban Farming Techniques', 'Growing food in limited urban spaces.', 'https://www.youtube.com/watch?v=0a1s2d3f4g5', 'Modern Farming'),
    ('Terrace Farming Guide', 'Traditional and modern methods of farming on sloped terrain.', 'https://www.youtube.com/watch?v=9s8a7d6f5g4', 'Techniques'),
    ('Sustainable Farming Documentary', 'An overview of the global shift towards sustainable agriculture.', 'https://www.youtube.com/watch?v=8d7f6g5h4j3', 'Education')
]

# Clear existing videos and insert new ones
conn.execute('DELETE FROM videos')
for title, desc, url, cat in videos:
    conn.execute('INSERT INTO videos (title, description, youtube_url, category, language, location, views, report_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                 (title, desc, url, cat, 'en', 'All India', 0, 0))

conn.commit()
conn.close()
print(f"Successfully loaded {len(videos)} videos from the provided list.")
