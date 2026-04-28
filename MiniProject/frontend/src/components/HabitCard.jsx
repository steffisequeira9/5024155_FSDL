import './HabitCard.css';

const HabitCard = ({ habit, onToggle }) => {
  return (
    <div className={`habit-card ${habit.completed ? 'completed' : ''}`} onClick={() => onToggle(habit.id)}>
      <div className="habit-icon">{habit.icon}</div>
      <div className="habit-info">
        <h4>{habit.title}</h4>
        {habit.co2 > 0 && <span className="co2-badge">Save {habit.co2}kg CO₂</span>}
      </div>
      <div className="habit-action">
        <button className={`toggle-btn ${habit.completed ? 'active' : ''}`}>
          {habit.completed ? '✓' : ''}
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
