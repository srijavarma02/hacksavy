import React from 'react';
import './RecommendationList.css';

function RecommendationList({ recommendations = [] }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendation-list">
        <div className="no-recommendations">
          <span className="icon">✅</span>
          <p>No recommendations at this time. All systems operating optimally!</p>
        </div>
      </div>
    );
  }

  // Group recommendations by priority
  const groupedByPriority = {
    high: recommendations.filter(r => r.priority === 'high'),
    medium: recommendations.filter(r => r.priority === 'medium'),
    low: recommendations.filter(r => r.priority === 'low')
  };

  // Group recommendations by category
  const groupedByCategory = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {});

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'energy': return '⚡';
      case 'alerts': return '🔔';
      case 'sustainability': return '🌱';
      case 'maintenance': return '🔧';
      default: return '📋';
    }
  };

  const getCategoryLabel = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="recommendation-list">
      <div className="recommendations-header">
        <h3>💡 Recommendations</h3>
        <div className="recommendation-stats">
          <span className="stat high">{groupedByPriority.high.length} High</span>
          <span className="stat medium">{groupedByPriority.medium.length} Medium</span>
          <span className="stat low">{groupedByPriority.low.length} Low</span>
        </div>
      </div>

      {/* Priority-based view */}
      <div className="priority-section">
        {['high', 'medium', 'low'].map(priority => {
          const items = groupedByPriority[priority];
          if (items.length === 0) return null;

          return (
            <div key={priority} className={`priority-group priority-${priority}`}>
              <h4 className="priority-header">
                {getPriorityIcon(priority)} {priority.toUpperCase()} Priority
              </h4>
              <div className="recommendations-grid">
                {items.map((rec, index) => (
                  <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                    <div className="card-header">
                      <span className="category-badge">
                        {getCategoryIcon(rec.category)} {getCategoryLabel(rec.category)}
                      </span>
                      <span className="priority-badge">{getPriorityIcon(rec.priority)}</span>
                    </div>
                    <h5 className="recommendation-title">{rec.title}</h5>
                    <p className="recommendation-description">{rec.description}</p>
                    {rec.expectedImpact && (
                      <div className="expected-impact">
                        <span className="impact-label">Expected Impact:</span>
                        <span className="impact-value">{rec.expectedImpact}</span>
                      </div>
                    )}
                    {rec.buildingIds && rec.buildingIds.length > 0 && (
                      <div className="affected-buildings">
                        <span className="buildings-label">Affected Buildings:</span>
                        <span className="buildings-value">
                          {rec.buildingIds.length} building{rec.buildingIds.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category-based summary */}
      <div className="category-summary">
        <h4>📊 By Category</h4>
        <div className="category-grid">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="category-card">
              <span className="category-icon">{getCategoryIcon(category)}</span>
              <div className="category-info">
                <span className="category-name">{getCategoryLabel(category)}</span>
                <span className="category-count">{items.length} recommendation{items.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecommendationList;
