import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import HabitCard from '../components/HabitCard';
import BadgeCard from '../components/BadgeCard';
import './Dashboard.css';

const HABITS_DATA = [
  { id: 'h1', title: 'Drink 8 glasses of water', icon: '💧', co2: 0 },
  { id: 'h2', title: 'Exercise 30 minutes', icon: '🏃', co2: 0 },
  { id: 'h3', title: 'Turn off unused lights', icon: '💡', co2: 0 },
  { id: 'h4', title: 'Water plants', icon: '🌱', co2: 0 },
  { id: 'h5', title: 'Walk instead of driving', icon: '🚶', co2: 0 },
  { id: 'h6', title: 'Recycle waste', icon: '♻️', co2: 0 },
  { id: 'h7', title: 'Eat plant-based meal', icon: '🥗', co2: 0 },
  { id: 'h8', title: '1 hour screen-free time', icon: '📵', co2: 0 }
];

const BADGES_DATA = [
  { id: 'First Step', title: 'First Step', description: 'Complete your first habit', icon: '🌱' },
  { id: 'Hydration Hero', title: 'Hydration Hero', description: 'Drink water for 7 days', icon: '💧' },
  { id: 'Carbon Crusher', title: 'Carbon Crusher', description: 'Save 5 kg CO₂', icon: '🌍' },
  { id: 'Consistency King', title: 'Consistency King', description: 'Reach a 10-day streak', icon: '🔥' },
  { id: 'Eco Legend', title: 'Eco Legend', description: 'Complete all daily habits', icon: '👑' }
];

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  // State with rock-solid defaults
  const [habits, setHabits] = useState(() => {
    return HABITS_DATA.map(h => ({ ...h, completed: false }));
  });
  const [totalCO2, setTotalCO2] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [hydrationStreak, setHydrationStreak] = useState(0);
  const [isCalculatorSubmitted, setIsCalculatorSubmitted] = useState(false);
  const [walkingKm, setWalkingKm] = useState('');
  const [transitKm, setTransitKm] = useState('');
  const [walkingCO2, setWalkingCO2] = useState(0);
  const [transportCO2, setTransportCO2] = useState(0);
  const [calcTotalCO2, setCalcTotalCO2] = useState(0);
  
  // NEW: History State
  const [footprintHistory, setFootprintHistory] = useState([]);

  useEffect(() => {
    const fetchCarbonData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch History
        const historyRes = await axios.get('http://localhost:5000/api/footprint/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const historyData = Array.isArray(historyRes.data) ? historyRes.data : [];
        setFootprintHistory(historyData);

        // Fetch Total CO2 and Streak
        const totalRes = await axios.get('http://localhost:5000/api/footprint/total', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTotalCO2(Number(totalRes.data?.totalCO2Saved) || 0);
        setStreak(Number(totalRes.data?.streak) || 0);

        // Check if today is submitted
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        const hasSubmittedToday = historyData.some(entry => entry?.date === todayStr);
        setIsCalculatorSubmitted(hasSubmittedToday);
        
        if (hasSubmittedToday) {
           const todayEntry = historyData.find(entry => entry?.date === todayStr);
           setWalkingCO2(Number(todayEntry?.walkingCO2Saved) || 0);
           setTransportCO2(Number(todayEntry?.transportCO2Saved) || 0);
           setCalcTotalCO2(Number(todayEntry?.totalCO2Saved) || 0);
        }

      } catch (error) {
        console.error("Failed to fetch footprint data", error);
      }
    };

    if (user) {
      fetchCarbonData();
      setUnlockedBadges(Array.isArray(user?.badges) ? user.badges : []);
    }

    const todayDateStr = new Date().toDateString();
    let localData = {};
    try {
      const stored = localStorage.getItem('eco_tracker_state');
      if (stored) {
        localData = JSON.parse(stored) || {};
      }
    } catch (e) {
      console.error("Local storage parse error", e);
      localData = {};
    }

    if (localData?.lastDate === todayDateStr) {
      setHabits(Array.isArray(localData.habits) ? localData.habits : HABITS_DATA.map(h => ({ ...h, completed: false })));
      setHydrationStreak(Number(localData.hydrationStreak) || 0);
    } else {
      let newStreak = streak;
      if (localData?.lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (localData.lastDate !== yesterday.toDateString()) {
          newStreak = 0;
        } else if (Array.isArray(localData.habits) && !localData.habits.some(h => h?.completed)) {
          newStreak = 0;
        }
      }
      setStreak(Number(newStreak) || 0);
      setHabits(HABITS_DATA.map(h => ({ ...h, completed: false })));
    }
  }, [user]);

  useEffect(() => {
    const today = new Date().toDateString();
    try {
      localStorage.setItem('eco_tracker_state', JSON.stringify({
        lastDate: today,
        habits: habits || [],
        hydrationStreak: Number(hydrationStreak) || 0
      }));
    } catch (e) {
      console.error("Error saving to local storage", e);
    }
  }, [habits, hydrationStreak]);

  const syncProgress = async (newTotalCO2, newStreak, newUnlockedBadges) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('http://localhost:5000/api/progress/update', {
        totalCO2Saved: Number(newTotalCO2) || 0,
        streak: Number(newStreak) || 0,
        badges: Array.isArray(newUnlockedBadges) ? newUnlockedBadges : []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  };

  const handleToggleHabit = async (id) => {
    if (!Array.isArray(habits)) return;
    
    const newHabits = habits.map(h => {
      if (h?.id === id) {
        return { ...h, completed: !h.completed };
      }
      return h;
    });

    const toggledHabit = newHabits.find(h => h?.id === id);
    if (!toggledHabit) return;
    const completedNow = toggledHabit.completed;
    
    let newHydrationStreak = Number(hydrationStreak) || 0;
    if (id === 'h1' && completedNow) newHydrationStreak += 1;
    if (id === 'h1' && !completedNow) newHydrationStreak = Math.max(0, newHydrationStreak - 1);
    
    let newStreak = Number(streak) || 0;
    const completedCount = newHabits.filter(h => h?.completed).length;
    if (completedCount === 1 && completedNow) {
       newStreak += 1;
    } else if (completedCount === 0 && !completedNow) {
       newStreak = Math.max(0, newStreak - 1);
    }

    const newlyUnlocked = new Set(unlockedBadges || []);
    if (completedCount >= 1) newlyUnlocked.add('First Step');
    if (newHydrationStreak >= 7) newlyUnlocked.add('Hydration Hero');
    if ((Number(totalCO2) || 0) >= 5) newlyUnlocked.add('Carbon Crusher');
    if (newStreak >= 10) newlyUnlocked.add('Consistency King');
    if (completedCount === 8) newlyUnlocked.add('Eco Legend');

    setHabits(newHabits);
    setStreak(newStreak);
    setHydrationStreak(newHydrationStreak);
    
    const badgesArray = Array.from(newlyUnlocked);
    setUnlockedBadges(badgesArray);

    syncProgress(Number(totalCO2) || 0, newStreak, badgesArray);
  };

  const handleCalculateClick = async () => {
    if (isCalculatorSubmitted) return;

    const kmWalked = Number(walkingKm) || 0;
    const kmTransport = Number(transitKm) || 0;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.post('http://localhost:5000/api/footprint/add', {
        kilometersWalked: kmWalked,
        kilometersPublicTransport: kmTransport
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { footprint, lifetimeCO2Saved } = res.data;
    
      setWalkingCO2(Number(footprint?.walkingCO2Saved) || 0);
      setTransportCO2(Number(footprint?.transportCO2Saved) || 0);
      setCalcTotalCO2(Number(footprint?.totalCO2Saved) || 0);
      setIsCalculatorSubmitted(true);

      const newTotalCO2 = Number(lifetimeCO2Saved) || 0;
      setTotalCO2(newTotalCO2);

      const newlyUnlocked = new Set(unlockedBadges || []);
      if (newTotalCO2 >= 5) newlyUnlocked.add('Carbon Crusher');
      const badgesArray = Array.from(newlyUnlocked);
      setUnlockedBadges(badgesArray);

      setWalkingKm('');
      setTransitKm('');

      if (footprint) {
         setFootprintHistory(prev => [footprint, ...(Array.isArray(prev) ? prev : [])]);
      }

      syncProgress(newTotalCO2, Number(streak) || 0, badgesArray);

    } catch (error) {
      console.error("Failed to add footprint", error);
      if (error.response?.status === 400) {
        setIsCalculatorSubmitted(true); // Lock it anyway if server says duplicate
      }
    }
  };

  if (!user) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading dashboard...</div>;
  }

  const completedHabits = Array.isArray(habits) ? habits.filter(h => h?.completed).length : 0;
  const progressPercent = (completedHabits / 8) * 100;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Your Eco Dashboard</h2>
        <p>Track your daily habits and save the planet!</p>
      </header>

      <div className="dashboard-grid">
        <div className="main-col">
          <div className="progress-section">
            <div className="progress-header">
              <h3>Today's Progress</h3>
              <span>{completedHabits}/8 Habits</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${Number(progressPercent) || 0}%` }}></div>
            </div>
          </div>

          <div className="habits-list">
            <h3>Daily Eco Habits</h3>
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map(habit => (
                <HabitCard key={habit?.id || Math.random()} habit={habit || {}} onToggle={handleToggleHabit} />
              ))
            ) : (
              <p style={{ color: '#aaa' }}>No habits loaded.</p>
            )}
          </div>
        </div>

        <div className="side-col">
          <div className="stats-card">
            <h3>Your Impact</h3>
            <div className="stat-row">
              <span className="stat-label">Your CO₂ Contribution</span>
              <span className="stat-value">{Number(totalCO2 || 0).toFixed(2)} kg 🌍</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{Number(streak || 0)} Days 🔥</span>
            </div>
          </div>

          <div className="stats-card calculator-card">
            <h3>Carbon Footprint Calculator</h3>
            <div className="calculator-form">
              <div className="form-group">
                <label>Kilometers Walked</label>
                <input 
                  type="number" 
                  value={walkingKm || ''}
                  onChange={(e) => setWalkingKm(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  step="0.1"
                  disabled={!!isCalculatorSubmitted}
                />
              </div>
              <div className="form-group">
                <label>Kilometers via Public Transport</label>
                <input 
                  type="number" 
                  value={transitKm || ''}
                  onChange={(e) => setTransitKm(e.target.value)}
                  placeholder="e.g. 15"
                  min="0"
                  step="0.1"
                  disabled={!!isCalculatorSubmitted}
                />
              </div>
              <button 
                type="button" 
                onClick={handleCalculateClick} 
                className="calc-btn"
                disabled={!!isCalculatorSubmitted}
                style={{ opacity: isCalculatorSubmitted ? 0.5 : 1, cursor: isCalculatorSubmitted ? 'not-allowed' : 'pointer' }}
              >
                {isCalculatorSubmitted ? 'Submitted' : 'Calculate'}
              </button>
            </div>

            {!!isCalculatorSubmitted && (
              <div style={{ color: 'var(--accent, #39FF14)', marginTop: '10px', fontSize: '0.9rem', textAlign: 'center' }}>
                Today's entry saved ✔<br/>Come back tomorrow to add more!
              </div>
            )}

            {(!!isCalculatorSubmitted || Number(calcTotalCO2) > 0) && (
              <div className="calc-results">
                <div className="stat-row">
                  <span className="stat-label">Walking Savings</span>
                  <span className="stat-value">{Number(walkingCO2 || 0).toFixed(2)} kg</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Transit Savings</span>
                  <span className="stat-value">{Number(transportCO2 || 0).toFixed(2)} kg</span>
                </div>
                <div className="stat-row highlight-row">
                  <span className="stat-label">Calculated CO₂ Saved</span>
                  <span className="stat-value">{Number(calcTotalCO2 || 0).toFixed(2)} kg 🌍</span>
                </div>
              </div>
            )}
          </div>

          <div className="badges-section">
            <h3>Achievements</h3>
            {Array.isArray(BADGES_DATA) && BADGES_DATA.length > 0 ? (
              BADGES_DATA.map(badge => (
                <BadgeCard 
                  key={badge?.id || Math.random()} 
                  badge={{ ...(badge || {}), unlocked: Array.isArray(unlockedBadges) ? unlockedBadges.includes(badge?.id) : false }} 
                />
              ))
            ) : (
              <p style={{ color: '#aaa' }}>No badges loaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
