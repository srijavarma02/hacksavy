/**
 * Example usage of RecommendationList component
 * This demonstrates how the component should be used with sample data
 */

import React from 'react';
import RecommendationList from './RecommendationList';

// Sample recommendations data matching the design spec
const sampleRecommendations = [
  {
    priority: 'high',
    category: 'energy',
    title: 'Reduce Peak Energy Consumption in Engineering Building',
    description: 'Energy consumption exceeds historical average by 15% during peak hours. Consider implementing load shifting strategies.',
    expectedImpact: 'Save 200 kWh per day, reduce costs by ₹1,500/day',
    buildingIds: [1, 2]
  },
  {
    priority: 'high',
    category: 'maintenance',
    title: 'Schedule HVAC System Maintenance',
    description: 'HVAC system in Science Lab showing signs of inefficiency with 20% higher energy usage than baseline.',
    expectedImpact: 'Improve efficiency by 10%, save ₹800/day',
    buildingIds: [3]
  },
  {
    priority: 'medium',
    category: 'alerts',
    title: 'Improve Alert Response Time',
    description: 'Average response time is 25 minutes, exceeding the target of 15 minutes. Review alert notification settings.',
    expectedImpact: 'Reduce response time by 40%, prevent escalation of minor issues',
    buildingIds: []
  },
  {
    priority: 'medium',
    category: 'sustainability',
    title: 'Increase Renewable Energy Usage',
    description: 'Current renewable percentage is 30%, below the target of 50%. Explore solar panel expansion opportunities.',
    expectedImpact: 'Reduce CO2 emissions by 100 kg/day, improve sustainability score',
    buildingIds: [1, 2, 3, 4]
  },
  {
    priority: 'low',
    category: 'energy',
    title: 'Optimize Night-time Energy Usage',
    description: 'Night-time energy consumption is 5% higher than optimal. Review automated systems and lighting schedules.',
    expectedImpact: 'Save 50 kWh per day, reduce costs by ₹400/day',
    buildingIds: [1]
  }
];

function RecommendationListExample() {
  return (
    <div style={{ padding: '20px', background: '#0f172a', minHeight: '100vh' }}>
      <h1 style={{ color: '#ccd6f6', marginBottom: '20px' }}>
        RecommendationList Component Example
      </h1>
      
      <h2 style={{ color: '#8892b0', marginBottom: '15px' }}>
        With Recommendations:
      </h2>
      <RecommendationList recommendations={sampleRecommendations} />
      
      <h2 style={{ color: '#8892b0', marginTop: '40px', marginBottom: '15px' }}>
        Empty State (No Recommendations):
      </h2>
      <RecommendationList recommendations={[]} />
    </div>
  );
}

export default RecommendationListExample;
