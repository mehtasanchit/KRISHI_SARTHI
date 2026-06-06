import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Video, Leaf, MapPin, Search, HelpCircle, FileText, Bookmark, Share2, PlayCircle, ShieldCheck,
  ThumbsUp, CheckCircle, GraduationCap, ChevronRight, MessageSquare, Play, Plus, X, UserCheck, ChevronUp, ChevronDown, Trash2, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/community`;



const TRANSLATIONS = {
  en: {
    videos: "Video Tutorials",
    guides: "Organic Guides",
    qa: "Expert Q&A",
    regional: "Regional Techniques",
    searchVideos: "Search videos...",
    searchQA: "Search questions...",
    askQuestion: "Ask a Question",
    selectRegion: "Select your State",
    expertVerified: "Expert Verified",
    lowDataMode: "Low Data Mode",
    addVideo: "Add Video",
    postQuestion: "Post Question",
    submitAnswer: "Submit Answer",
    verifiedAnswer: "Verified Answer"
  },
  hi: {
    videos: "वीडियो ट्यूटोरियल",
    guides: "जैविक खेती गाइड",
    qa: "विशेषज्ञ प्रश्नोत्तर",
    regional: "क्षेत्रीय तकनीकें",
    searchVideos: "वीडियो खोजें...",
    searchQA: "प्रश्न खोजें...",
    askQuestion: "प्रश्न पूछें",
    selectRegion: "अपना राज्य चुनें",
    expertVerified: "विशेषज्ञ द्वारा सत्यापित",
    lowDataMode: "कम डेटा मोड",
    addVideo: "वीडियो जोड़ें",
    postQuestion: "प्रश्न पोस्ट करें",
    submitAnswer: "उत्तर दें",
    verifiedAnswer: "सत्यापित उत्तर"
  }
};

const GUIDES = [
  { id: 1, title: "Composting Methods", desc: "Complete guide to Vermicompost and traditional composting methods.", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80" },
  { id: 2, title: "Natural Pest Control", desc: "Identify and eliminate pests using Neem oil and garlic sprays.", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=300&q=80" },
  { id: 3, title: "Soil Health Management", desc: "Understanding NPK ratios, natural fertilizers, and cover cropping.", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=300&q=80" }
];

const REGIONS = {
  Punjab: {
    crops: ["Wheat", "Rice", "Maize", "Cotton"],
    advice: "Focus on water management due to declining water tables. Adopt direct seeding of rice (DSR) and precision farming. Current season: Rabi harvesting preparation."
  },
  "Haryana": {
    crops: ["Wheat", "Mustard", "Sugarcane", "Pearl Millet"],
    advice: "Utilize solar water pumps supported by PM-KUSUM. Delay wheat sowing slightly if temperatures remain above 25°C in November."
  },
  Maharashtra: {
    crops: ["Sugarcane", "Cotton", "Soybean", "Onion"],
    advice: "Drip irrigation is highly recommended for sugarcane. Monitor for pink bollworm in cotton fields."
  }
};

const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  // Alternative fallback regex
  const altMatch = url.match(/(?:v=|\/|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return altMatch ? altMatch[1] : null;
};

export default function FarmerLearningHub({ language }) {
  const { currentUser } = useAuth();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [lowDataMode, setLowDataMode] = useState(false);
  
  const [dashboard, setDashboard] = useState({ popular: [], saved: [], continue_watching: [], recommended: [] });
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // Forms States
  const [showAskForm, setShowAskForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [qData, setQData] = useState({ title: '', description: '', category: '', location: '' });
  const [vData, setVData] = useState({ title: '', description: '', youtube_url: '', category: 'organic', language: 'en' });
  const [answerText, setAnswerText] = useState('');
  const [usersInfo, setUsersInfo] = useState([]);

  useEffect(() => {
    fetchVideos();
    fetchQuestions();
    if (currentUser?.role === 'admin') {
      fetchUsers();
      fetchAnalytics();
    }
  }, [language, currentUser]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/analytics`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setAnalytics(res.data);
    } catch(e) { }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsersInfo(res.data);
    } catch(e) { }
  };

  const handlePromoteExpert = async (id) => {
    try {
      await axios.patch(`${API_BASE}/users/${id}/role`, { role: 'expert' });
      fetchUsers();
    } catch (e) {
      alert("Failed to promote user");
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/videos/dashboard`);
      setDashboard(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVideoSelect = async (video) => {
    setSelectedVideo(video);
    try {
      await axios.post(`${API_BASE}/videos/${video.id}/watch`);
      const relRes = await axios.get(`${API_BASE}/videos/${video.id}/related`);
      setRelatedVideos(relRes.data);
      fetchVideos(); // update history silently
    } catch(e) {}
  };

  const handleBookmark = async (vId) => {
    if (!currentUser) return alert("Please Login to bookmark.");
    try {
      await axios.post(`${API_BASE}/videos/${vId}/bookmark`);
      fetchVideos(); // update saved list silently
      alert("Bookmark updated!");
    } catch(e) {}
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/questions`);
      setQuestions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestionDetail = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/questions/${id}`);
      setSelectedQuestion(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostVideo = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return alert("Only admin");
    try {
      await axios.post(`${API_BASE}/videos`, vData);
      setShowVideoForm(false);
      setVData({ title: '', description: '', youtube_url: '', category: 'organic', language: 'en' });
      fetchVideos();
    } catch (err) {
      alert("Error posting video");
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please Login to ask questions.");
    try {
      await axios.post(`${API_BASE}/questions`, { ...qData, user_id: currentUser.id });
      setShowAskForm(false);
      setQData({ title: '', description: '', category: '', location: '' });
      fetchQuestions();
    } catch (err) {
      alert("Error posting question");
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please Login to post answers.");
    try {
      await axios.post(`${API_BASE}/answers`, {
        user_id: currentUser.id,
        question_id: selectedQuestion.id,
        answer_text: answerText
      });
      setAnswerText('');
      fetchQuestionDetail(selectedQuestion.id);
      fetchQuestions();
    } catch (err) {
      alert("Error posting answer");
    }
  };

  const handleVerifyAnswer = async (answerId) => {
    if (!currentUser || currentUser.role !== 'admin') return alert("Action not allowed.");
    try {
      await axios.patch(`${API_BASE}/answers/${answerId}/verify`);
      fetchQuestionDetail(selectedQuestion.id);
    } catch (err) {
      alert("Only an admin can verify answers.");
    }
  };

  const handleVote = async (answerId, voteVal) => {
    if (!currentUser) return alert("Please Login to vote.");
    try {
      await axios.post(`${API_BASE}/answers/${answerId}/vote`, { vote_type: voteVal });
      fetchQuestionDetail(selectedQuestion.id);
    } catch (err) {
      alert("Vote Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleReport = async (itemType, itemId) => {
    if (!currentUser) return alert("Please Login to report content.");
    if (!window.confirm("Flag this content to moderators?")) return;
    try {
      await axios.post(`${API_BASE}/report`, { item_type: itemType, item_id: itemId });
      alert("Content reported safely.");
      fetchQuestions(); 
      if (selectedQuestion) fetchQuestionDetail(selectedQuestion.id);
      fetchVideos();
    } catch (e) { }
  };

  const handleDelete = async (itemType, itemId) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!window.confirm(`Permanently Delete this ${itemType}?`)) return;
    try {
      await axios.delete(`${API_BASE}/${itemType}s/${itemId}`);
      if (itemType === 'video') { setSelectedVideo(null); fetchVideos(); }
      if (itemType === 'question') { setSelectedQuestion(null); fetchQuestions(); }
      if (itemType === 'answer') fetchQuestionDetail(selectedQuestion.id);
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  const renderVideoRow = (title, videoList) => {
    if (!videoList || videoList.length === 0) return null;
    return (
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.2rem', paddingLeft: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>{title}</h4>
        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', padding: '0.5rem' }}>
          {videoList.map(video => {
            const yId = extractYouTubeId(video.youtube_url);
            console.log("Rendering Thumbnail for ID:", yId, "from URL:", video.youtube_url);
            const thumb = yId ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg` : null;
            return (
              <motion.div key={video.id} className="card" whileHover={{ scale: 1.02 }} style={{ minWidth: '280px', maxWidth: '300px', cursor: 'pointer', flexShrink: 0, padding: '1rem' }} onClick={() => handleVideoSelect(video)}>
                {!lowDataMode && thumb && (
                  <div style={{ position: 'relative', width: '100%', height: '160px', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', background: '#ccc' }}>
                    <img src={thumb} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <PlayCircle size={48} color="white" />
                    </div>
                  </div>
                )}
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{video.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{video.category.toUpperCase()}</span>
                  <span>{video.views} Views</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // UI Renderers
  const renderVideos = () => (
    <div className="learning-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{t.videos}</h3>
        {currentUser && currentUser.role === 'admin' && (
          <button className="button" onClick={() => setShowVideoForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> {t.addVideo}
          </button>
        )}
      </div>

      {renderVideoRow("Continue Watching", dashboard.continue_watching)}
      {renderVideoRow("Region-specific Videos 📍", dashboard.region_specific)}
      {renderVideoRow("Recommended for You", dashboard.recommended)}
      {renderVideoRow("Popular on Krishi Sarthi", dashboard.popular)}
      {currentUser && renderVideoRow("Saved Videos 🔖", dashboard.saved)}
      
    </div>
  );

  const renderQA = () => {
    if (selectedQuestion) return renderQuestionDetail();
    
    const nearbyQuestions = currentUser && currentUser.location !== 'All India' ? questions.filter(q => q.location.toLowerCase() === currentUser.location.toLowerCase()) : [];
    const otherQuestions = currentUser && currentUser.location !== 'All India' ? questions.filter(q => q.location.toLowerCase() !== currentUser.location.toLowerCase()) : questions;

    const renderQuestionCard = (q) => (
      <div key={q.id} className="card" style={{ borderLeft: '4px solid var(--primary-color)', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => fetchQuestionDetail(q.id)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-color)' }}>{q.title}</h4>
          <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-color)' }}>
            {q.answer_count} answers
          </span>
        </div>
        <p style={{ margin: '0 0 1rem 0', opacity: 0.7, fontSize: '0.95rem' }}>{q.description.substring(0, 100)}...</p>
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#888', alignItems: 'center' }}>
          <span>Asked by: <strong>{q.user_name}</strong></span> •
          <span>{q.category}</span> •
          <span>{q.location}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {currentUser && (
              <button onClick={(e) => { e.stopPropagation(); handleReport('question', q.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', display: 'flex', alignItems: 'center' }} title="Report">
                <Flag size={16} />
              </button>
            )}
            {currentUser && currentUser.role === 'admin' && (
              <button onClick={(e) => { e.stopPropagation(); handleDelete('question', q.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)', display: 'flex', alignItems: 'center' }} title="Delete">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="learning-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{t.qa} Community</h3>
          <button className="button" onClick={() => setShowAskForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} /> {t.askQuestion}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {nearbyQuestions.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2e7d32', fontSize: '1.1rem', borderBottom: '2px solid #2e7d32', paddingBottom: '0.5rem', display: 'inline-block' }}>Nearby Questions 📍</h4>
              {nearbyQuestions.map(renderQuestionCard)}
            </div>
          )}
          
          <div>
            {nearbyQuestions.length > 0 && <h4 style={{ margin: '0 0 1rem 0', color: '#555', fontSize: '1.1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', display: 'inline-block' }}>Global Community</h4>}
            {otherQuestions.map(renderQuestionCard)}
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionDetail = () => {
    const q = selectedQuestion;
    const verifiedAnswer = q.answers.find(a => a.is_verified);
    const otherAnswers = q.answers.filter(a => !a.is_verified);

    return (
      <div className="learning-section">
        <button onClick={() => setSelectedQuestion(null)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }}/> Back to Q&A
        </button>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>{q.title}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>{q.description}</p>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <span>By: <strong>{q.user_name}</strong> (Rep: {q.user_reputation})</span> • <span>Loc: {q.location}</span> • <span>Cat: {q.category}</span>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem' }}>{q.answers.length} Answers</h3>
        
        {verifiedAnswer && (
          <div className="card" style={{ border: '2px solid #2e7d32', marginBottom: '1rem', position: 'relative', overflow: 'hidden', display: 'flex', gap: '1.5rem' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#2e7d32' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
              <button onClick={() => handleVote(verifiedAnswer.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><ChevronUp size={28} /></button>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{verifiedAnswer.score || 0}</span>
              <button onClick={() => handleVote(verifiedAnswer.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><ChevronDown size={28} /></button>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontWeight: 'bold', marginBottom: '1rem', marginTop: '1rem' }}>
                <CheckCircle size={20} /> {t.verifiedAnswer} (Admin approved)
              </div>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>{verifiedAnswer.answer_text}</p>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                <span>Answered by: {verifiedAnswer.user_name} ({verifiedAnswer.user_role === 'expert' ? <span style={{ color: '#d4af37', fontWeight: 'bold' }}>🌾 Expert</span> : verifiedAnswer.user_role} | Rep: {verifiedAnswer.user_reputation})</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {currentUser && (
                    <button onClick={() => handleReport('answer', verifiedAnswer.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }} title="Report"><Flag size={16} /></button>
                  )}
                  {currentUser && currentUser.role === 'admin' && (
                    <button onClick={() => handleVerifyAnswer(verifiedAnswer.id)} style={{ padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>Unverify</button>
                  )}
                  {currentUser && currentUser.role === 'admin' && (
                    <button onClick={() => handleDelete('answer', verifiedAnswer.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }} title="Delete"><Trash2 size={16}/></button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {otherAnswers.map(a => {
          const isExpert = a.user_role === 'expert';
          return (
          <div key={a.id} className="card" style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem', ...(isExpert ? { border: '2px solid #edc967', background: '#fffdf5' } : {}) }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button onClick={() => handleVote(a.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><ChevronUp size={28} /></button>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{a.score || 0}</span>
              <button onClick={() => handleVote(a.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><ChevronDown size={28} /></button>
            </div>

            <div style={{ flex: 1 }}>
              {isExpert && <div style={{ fontSize: '0.85rem', color: '#d4af37', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={16}/> 🌾 Expert Advice</div>}
              <p style={{ fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>{a.answer_text}</p>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                <span>Answered by: {a.user_name} ({isExpert ? <span style={{ color: '#d4af37', fontWeight: 'bold' }}>🌾 Expert</span> : a.user_role} | Rep: {a.user_reputation})</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {currentUser && (
                    <button onClick={() => handleReport('answer', a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }} title="Report"><Flag size={16} /></button>
                  )}
                  {currentUser && currentUser.role === 'admin' && (
                    <button onClick={() => handleVerifyAnswer(a.id)} className="button" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Approve & Verify</button>
                  )}
                  {currentUser && currentUser.role === 'admin' && (
                    <button onClick={() => handleDelete('answer', a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }} title="Delete"><Trash2 size={16}/></button>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })}

      {currentUser ? (
        <form onSubmit={handlePostAnswer} className="card" style={{ marginTop: '2rem', background: '#f9f9f9', border: '1px solid var(--border-color)' }}>
          <h4>Your Answer</h4>
          <textarea 
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px', marginBottom: '1rem', fontSize: '1rem' }}
            placeholder="Write your solution here..."
            required
          />
          <button type="submit" className="button">{t.submitAnswer}</button>
        </form>
      ) : (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.7 }}>
          <p>Please login to answer questions.</p>
        </div>
      )}
      </div>
    );
  };

  return (
    <div className="section-container" style={{ animation: 'fadeIn 0.5s' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
        <div style={{ background: 'var(--primary-color)', padding: '12px', borderRadius: '12px', color: 'white' }}>
          <GraduationCap size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Farmer Learning Hub</h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.7 }}>Community Q&A and Video Education Platform</p>
        </div>
      </div>

      <div className="tab-switcher" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button className={`button ${activeTab === 'videos' ? '' : 'secondary'}`} onClick={() => { setActiveTab('videos'); setSelectedVideo(null); }}>
          <Video size={16} style={{ marginRight: '6px' }} /> {t.videos}
        </button>
        <button className={`button ${activeTab === 'qa' ? '' : 'secondary'}`} onClick={() => { setActiveTab('qa'); setSelectedQuestion(null); }}>
          <HelpCircle size={16} style={{ marginRight: '6px' }} /> {t.qa}
        </button>
        {currentUser && currentUser.role === 'admin' && (
          <button className={`button ${activeTab === 'admin' ? '' : 'secondary'}`} onClick={() => { setActiveTab('admin'); setSelectedQuestion(null); }}>
            <ShieldCheck size={16} style={{ marginRight: '6px' }} /> Admin Panel
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'videos' && !selectedVideo && <motion.div key="v" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>{renderVideos()}</motion.div>}
        {activeTab === 'qa' && <motion.div key="q" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>{renderQA()}</motion.div>}
        
        {activeTab === 'admin' && (
          <motion.div key="admin" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
            <div className="learning-section">
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Admin Dashboard</h3>
              
              {analytics && (
                <div style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ textAlign: 'center', background: '#e3f2fd' }}><h3>{analytics.totals.users}</h3><p style={{ margin: 0, opacity: 0.8 }}>Total Users</p></div>
                    <div className="card" style={{ textAlign: 'center', background: '#e8f5e9' }}><h3>{analytics.totals.questions}</h3><p style={{ margin: 0, opacity: 0.8 }}>Questions</p></div>
                    <div className="card" style={{ textAlign: 'center', background: '#fff3e0' }}><h3>{analytics.totals.answers}</h3><p style={{ margin: 0, opacity: 0.8 }}>Answers</p></div>
                    <div className="card" style={{ textAlign: 'center', background: '#f3e5f5' }}><h3>{analytics.totals.videos}</h3><p style={{ margin: 0, opacity: 0.8 }}>Videos</p></div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="card">
                      <h4 style={{ margin: '0 0 1rem 0' }}>Most Active Experts (Answers)</h4>
                      <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '12px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                        {analytics.top_users.map((u, i) => {
                          const maxAns = Math.max(...analytics.top_users.map(us => us.answer_count), 1);
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-color)' }}>{u.answer_count}</span>
                              <div style={{ width: '100%', background: 'var(--primary-color)', height: `${(u.answer_count / maxAns) * 100}%`, minHeight: '10px', borderRadius: '4px 4px 0 0' }}></div>
                              <span style={{ fontSize: '0.7rem', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }} title={u.name}>{u.name.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="card">
                      <h4 style={{ margin: '0 0 1rem 0' }}>Most Viewed Content</h4>
                      <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '12px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                        {analytics.top_videos.map((v, i) => {
                          const maxV = Math.max(...analytics.top_videos.map(vi => vi.views), 1);
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-color)' }}>{v.views}</span>
                              <div style={{ width: '100%', background: '#ff9800', height: `${(v.views / maxV) * 100}%`, minHeight: '10px', borderRadius: '4px 4px 0 0' }}></div>
                              <span style={{ fontSize: '0.7rem', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }} title={v.title}>{v.title.substring(0, 8)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <h4 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', display: 'inline-block' }}>User Management</h4>
              <div className="grid">
                {usersInfo.map(u => (
                  <div key={u.id} className="card">
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{u.name}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.9rem' }}>{u.email}</p>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Role: {u.role === 'expert' ? <span style={{ color: '#d4af37' }}>🌾 Expert</span> : u.role}</p>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-color)', borderTop: '1px solid #eee', paddingTop: '0.5rem', marginTop: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Rep: {u.reputation} | Answers: {u.answer_count}</span>
                      {u.role !== 'expert' && u.role !== 'admin' && (
                        <button onClick={() => handlePromoteExpert(u.id)} className="button" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Promote</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {selectedVideo && (
          <motion.div key={`v-detail-${selectedVideo.id}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="learning-section">
            <button onClick={() => setSelectedVideo(null)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }}/> Back to Dashboard
            </button>
            <div className="card">
              <div key={`yt-container-${selectedVideo.id}`} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', marginBottom: '1.5rem', background: '#000' }}>
                <iframe 
                  title={selectedVideo.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideo.youtube_url)}`} 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0' }}>{selectedVideo.title}</h2>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '1rem' }}>{selectedVideo.views || 0} Views • {selectedVideo.category}</div>
                </div>
                {currentUser && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleReport('video', selectedVideo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }} title="Report Video">
                      <Flag size={20} />
                    </button>
                    {currentUser.role === 'admin' && (
                      <button onClick={() => handleDelete('video', selectedVideo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }} title="Delete Video">
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button onClick={() => handleBookmark(selectedVideo.id)} className="button secondary" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Bookmark size={16} /> Save / Bookmark
                    </button>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{selectedVideo.description}</p>
            </div>

            {relatedVideos.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                {renderVideoRow("Related Videos", relatedVideos)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals for Forms */}
      {showAskForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Ask a Question</h3>
              <X cursor="pointer" onClick={() => setShowAskForm(false)} />
            </div>
            <form onSubmit={handlePostQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Question Title (e.g., Yellow leaves on tomato)" required value={qData.title} onChange={e => setQData({...qData, title: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}/>
              <textarea placeholder="Describe your problem in detail..." required value={qData.description} onChange={e => setQData({...qData, description: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '120px' }}/>
              <input type="text" placeholder="Category (e.g., Pest, Soil, Seeds)" required value={qData.category} onChange={e => setQData({...qData, category: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}/>
              <input type="text" placeholder="Your Location (e.g., Punjab)" required value={qData.location} onChange={e => setQData({...qData, location: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}/>
              <button type="submit" className="button" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>{t.postQuestion}</button>
            </form>
          </div>
        </div>
      )}

      {showVideoForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Add New Video (Admin)</h3>
              <X cursor="pointer" onClick={() => setShowVideoForm(false)} />
            </div>
            <form onSubmit={handlePostVideo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Video Title" required value={vData.title} onChange={e => setVData({...vData, title: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}/>
              <input type="url" placeholder="YouTube URL" required value={vData.youtube_url} onChange={e => setVData({...vData, youtube_url: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}/>
              <textarea placeholder="Video Description" required value={vData.description} onChange={e => setVData({...vData, description: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px' }}/>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Category" required value={vData.category} onChange={e => setVData({...vData, category: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}/>
                <select value={vData.language} onChange={e => setVData({...vData, language: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="pa">Punjabi</option>
                  <option value="mr">Marathi</option>
                </select>
                <select value={vData.location || "All India"} onChange={e => setVData({...vData, location: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <option value="All India">All India</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>
              <button type="submit" className="button" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>Save Video</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
