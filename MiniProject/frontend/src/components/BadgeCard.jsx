import './BadgeCard.css';

const BadgeCard = ({ badge }) => {
  return (
    <div className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
      <div className="badge-icon">{badge.icon}</div>
      <div className="badge-details">
        <h5>{badge.title}</h5>
        <p>{badge.description}</p>
      </div>
    </div>
  );
};

export default BadgeCard;
