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
  const { user } = useContext(AuthContext);
  const [habits, setHabits] = useState(HABITS_DATA.map(h => ({ ...h, completed: false })));
  const [totalCO2, setTotalCO2] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  
  // Local state for hydration streak logic
  const [hydrationStreak, setHydrationStreak] = useState(0);

  const [isCalculatorSubmitted, setIsCalculatorSubmitted] = useState(false);

  useEffect(() => {
    // Load state from backend/localStorage on mount
    if (user) {
      setTotalCO2(user.totalCO2Saved || 0);
      setStreak(user.streak || 0);
      setUnlockedBadges(user.badges || []);
    }

    const today = new Date().toDateString();
    const localData = JSON.parse(localStorage.getItem('eco_tracker_state')) || {};

    if (localData.lastDate === today) {
      setHabits(localData.habits || HABITS_DATA.map(h => ({ ...h, completed: false })));
      setHydrationStreak(localData.hydrationStreak || 0);
      setIsCalculatorSubmitted(localData.isCalculatorSubmitted || false);
      setWalkingCO2(localData.walkingCO2 || 0);
      setTransportCO2(localData.transportCO2 || 0);
      setCalcTotalCO2(localData.calcTotalCO2 || 0);
    } else {
      // New day: check streak reset logic
      let newStreak = streak;
      if (localData.lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (localData.lastDate !== yesterday.toDateString()) {
          newStreak = 0; // Missed a day
        } else if (localData.habits && !localData.habits.some(h => h.completed)) {
          newStreak = 0; // Didn't complete anything yesterday
        }
      }
      setStreak(newStreak);
      setHabits(HABITS_DATA.map(h => ({ ...h, completed: false })));
      setIsCalculatorSubmitted(false);
      setWalkingCO2(0);
      setTransportCO2(0);
      setCalcTotalCO2(0);
    }
  }, [user]);

  // Save to local storage whenever state changes
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('eco_tracker_state', JSON.stringify({
      lastDate: today,
      habits,
      hydrationStreak,
      isCalculatorSubmitted,
      walkingCO2,
      transportCO2,
      calcTotalCO2
    }));
  }, [habits, hydrationStreak, isCalculatorSubmitted, walkingCO2, transportCO2, calcTotalCO2]);

  const syncProgress = async (newTotalCO2, newStreak, newUnlockedBadges) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('http://localhost:5000/api/progress/update', {
        totalCO2Saved: newTotalCO2,
        streak: newStreak,
        badges: newUnlockedBadges
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  };

  const handleToggleHabit = async (id) => {
    if (!habits || !Array.isArray(habits)) return;
    
    const newHabits = habits.map(h => {
      if (h.id === id) {
        return { ...h, completed: !h.completed };
      }
      return h;
    });

    const toggledHabit = newHabits.find(h => h.id === id);
    if (!toggledHabit) return;
    const completedNow = toggledHabit.completed;
    
    // Handle specific logic like Hydration Hero
    let newHydrationStreak = Number(hydrationStreak) || 0;
    if (id === 'h1' && completedNow) newHydrationStreak += 1;
    if (id === 'h1' && !completedNow) newHydrationStreak = Math.max(0, newHydrationStreak - 1);
    
    // Update streak (just +1 if this is the first habit of the day)
    let newStreak = Number(streak) || 0;
    const completedCount = newHabits.filter(h => h.completed).length;
    if (completedCount === 1 && completedNow) {
       newStreak += 1;
    } else if (completedCount === 0 && !completedNow) {
       newStreak = Math.max(0, newStreak - 1);
    }

    // Check Badges
    const newlyUnlocked = new Set(unlockedBadges || []);
    if (completedCount >= 1) newlyUnlocked.add('First Step');
    if (newHydrationStreak >= 7) newlyUnlocked.add('Hydration Hero');
    if ((Number(totalCO2) || 0) >= 5) newlyUnlocked.add('Carbon Crusher'); // Using existing totalCO2
    if (newStreak >= 10) newlyUnlocked.add('Consistency King');
    if (completedCount === 8) newlyUnlocked.add('Eco Legend');

    setHabits(newHabits);
    setStreak(newStreak);
    setHydrationStreak(newHydrationStreak);
    
    const badgesArray = Array.from(newlyUnlocked);
    setUnlockedBadges(badgesArray);

    syncProgress(totalCO2, newStreak, badgesArray);
  };

  const completedHabits = Array.isArray(habits) ? habits.filter(h => h.completed).length : 0;
  const progressPercent = (completedHabits / 8) * 100;

  // Carbon Footprint Calculator State
  const [walkingKm, setWalkingKm] = useState('');
  const [transitKm, setTransitKm] = useState('');
  const [walkingCO2, setWalkingCO2] = useState(0);
  const [transportCO2, setTransportCO2] = useState(0);
  const [calcTotalCO2, setCalcTotalCO2] = useState(0);

  const handleCalculateClick = () => {
    if (isCalculatorSubmitted) return;

    const kmWalked = Number(walkingKm) || 0;
    const kmTransport = Number(transitKm) || 0;
    
    const wCO2 = kmWalked * 0.21;
    const tCO2 = kmTransport * 0.1;
    const total = wCO2 + tCO2;
    
    setWalkingCO2(wCO2);
    setTransportCO2(tCO2);
    setCalcTotalCO2(total);
    setIsCalculatorSubmitted(true);

    // Update Lifetime CO2 Contribution
    const newTotalCO2 = (Number(totalCO2) || 0) + total;
    setTotalCO2(newTotalCO2);

    // Check Badges again just in case hitting Carbon Crusher
    const newlyUnlocked = new Set(unlockedBadges || []);
    if (newTotalCO2 >= 5) newlyUnlocked.add('Carbon Crusher');
    const badgesArray = Array.from(newlyUnlocked);
    setUnlockedBadges(badgesArray);

    // Reset fields
    setWalkingKm('');
    setTransitKm('');

    syncProgress(newTotalCO2, streak, badgesArray);
  };

  if (!user) {
    return <div className="loading" style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading dashboard...</div>;
  }

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
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="habits-list">
            <h3>Daily Eco Habits</h3>
            {habits && habits.length > 0 ? (
              habits.map(habit => (
                <HabitCard key={habit.id} habit={habit} onToggle={handleToggleHabit} />
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
                  value={walkingKm}
                  onChange={(e) => setWalkingKm(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  step="0.1"
                  disabled={isCalculatorSubmitted}
                />
              </div>
              <div className="form-group">
                <label>Kilometers via Public Transport</label>
                <input 
                  type="number" 
                  value={transitKm}
                  onChange={(e) => setTransitKm(e.target.value)}
                  placeholder="e.g. 15"
                  min="0"
                  step="0.1"
                  disabled={isCalculatorSubmitted}
                />
              </div>
              <button 
                type="button" 
                onClick={handleCalculateClick} 
                className="calc-btn"
                disabled={isCalculatorSubmitted}
                style={{ opacity: isCalculatorSubmitted ? 0.5 : 1, cursor: isCalculatorSubmitted ? 'not-allowed' : 'pointer' }}
              >
                {isCalculatorSubmitted ? 'Submitted' : 'Calculate'}
              </button>
            </div>

            {isCalculatorSubmitted && (
              <div style={{ color: 'var(--accent, #39FF14)', marginTop: '10px', fontSize: '0.9rem', textAlign: 'center' }}>
                Today's entry saved ✔<br/>Come back tomorrow to add more!
              </div>
            )}

            {(isCalculatorSubmitted || calcTotalCO2 > 0) && (
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
            {BADGES_DATA && BADGES_DATA.length > 0 ? (
              BADGES_DATA.map(badge => (
                <BadgeCard 
                  key={badge.id} 
                  badge={{ ...badge, unlocked: (unlockedBadges || []).includes(badge.id) }} 
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
