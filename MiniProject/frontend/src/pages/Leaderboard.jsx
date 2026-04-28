import { useState, useEffect } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/progress/leaderboard');
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch leaderboard');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="loading">Loading leaderboard...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="leaderboard-container">
      <header className="dashboard-header text-center">
        <h2>Global Leaderboard</h2>
        <p>Top Eco Warriors making a difference.</p>
      </header>

      <div className="leaderboard-list">
        {users.length === 0 ? (
          <div className="text-center">No users found.</div>
        ) : (
          users.map((u, index) => (
            <div key={u._id} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
              <div className="rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="user-info">
                <h4>{u.name}</h4>
                <div className="user-stats-mini">
                  <span>🔥 {u.streak} Days</span>
                  <span>🏆 {u.badges.length} Badges</span>
                </div>
              </div>
              <div className="user-score">
                {u.totalCO2Saved.toFixed(2)} <span>kg CO₂</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
