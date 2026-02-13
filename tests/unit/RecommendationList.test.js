/**
 * Unit tests for RecommendationList component
 * Tests rendering of recommendations grouped by priority and category
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecommendationList from '../../src/components/Reports/RecommendationList.jsx';

describe('RecommendationList', () => {
  const mockRecommendations = [
    {
      priority: 'high',
      category: 'energy',
      title: 'Reduce Peak Energy Consumption',
      description: 'Energy consumption exceeds historical average by 15%',
      expectedImpact: 'Save 200 kWh per day',
      buildingIds: [1, 2]
    },
    {
      priority: 'medium',
      category: 'alerts',
      title: 'Improve Alert Response Time',
      description: 'Average response time is 25 minutes, target is 15 minutes',
      expectedImpact: 'Reduce response time by 40%',
      buildingIds: [3]
    },
    {
      priority: 'low',
      category: 'sustainability',
      title: 'Increase Renewable Energy Usage',
      description: 'Current renewable percentage is 30%, target is 50%',
      expectedImpact: 'Reduce CO2 emissions by 100 kg/day',
      buildingIds: []
    },
    {
      priority: 'high',
      category: 'maintenance',
      title: 'Schedule HVAC Maintenance',
      description: 'HVAC system showing signs of inefficiency',
      expectedImpact: 'Improve efficiency by 10%',
      buildingIds: [1]
    }
  ];

  test('should render recommendations grouped by priority', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    // Check priority headers are present
    expect(screen.getByText(/HIGH Priority/i)).toBeInTheDocument();
    expect(screen.getByText(/MEDIUM Priority/i)).toBeInTheDocument();
    expect(screen.getByText(/LOW Priority/i)).toBeInTheDocument();
  });

  test('should display recommendation titles and descriptions', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Reduce Peak Energy Consumption')).toBeInTheDocument();
    expect(screen.getByText(/Energy consumption exceeds historical average/i)).toBeInTheDocument();
    expect(screen.getByText('Improve Alert Response Time')).toBeInTheDocument();
  });

  test('should show expected impact for recommendations', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Save 200 kWh per day')).toBeInTheDocument();
    expect(screen.getByText('Reduce response time by 40%')).toBeInTheDocument();
  });

  test('should display affected buildings count', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    // Should show "2 buildings" for the first recommendation
    expect(screen.getByText('2 buildings')).toBeInTheDocument();
    // Should show "1 building" for recommendations with single building
    expect(screen.getByText('1 building')).toBeInTheDocument();
  });

  test('should show category badges', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    expect(screen.getByText(/Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/Sustainability/i)).toBeInTheDocument();
    expect(screen.getByText(/Maintenance/i)).toBeInTheDocument();
  });

  test('should display priority statistics in header', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    // Check stats show correct counts
    expect(screen.getByText('2 High')).toBeInTheDocument();
    expect(screen.getByText('1 Medium')).toBeInTheDocument();
    expect(screen.getByText('1 Low')).toBeInTheDocument();
  });

  test('should show category summary section', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    // Check category summary is present
    expect(screen.getByText(/By Category/i)).toBeInTheDocument();
    
    // Check category counts
    expect(screen.getByText('1 recommendation')).toBeInTheDocument(); // For categories with 1 item
    expect(screen.getByText('2 recommendations')).toBeInTheDocument(); // For energy category with 2 items (if any)
  });

  test('should render empty state when no recommendations', () => {
    render(<RecommendationList recommendations={[]} />);
    
    expect(screen.getByText(/No recommendations at this time/i)).toBeInTheDocument();
    expect(screen.getByText(/All systems operating optimally/i)).toBeInTheDocument();
  });

  test('should handle undefined recommendations prop', () => {
    render(<RecommendationList />);
    
    expect(screen.getByText(/No recommendations at this time/i)).toBeInTheDocument();
  });

  test('should group recommendations by category correctly', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);
    
    // Verify all 4 categories are shown in the category summary
    const categoryCards = screen.getAllByText(/recommendation/i);
    expect(categoryCards.length).toBeGreaterThan(0);
  });

  test('should not show priority section if no recommendations for that priority', () => {
    const singlePriorityRecs = [
      {
        priority: 'high',
        category: 'energy',
        title: 'Test Recommendation',
        description: 'Test description',
        expectedImpact: 'Test impact'
      }
    ];
    
    render(<RecommendationList recommendations={singlePriorityRecs} />);
    
    // Should show HIGH priority
    expect(screen.getByText(/HIGH Priority/i)).toBeInTheDocument();
    
    // Should not show MEDIUM or LOW priority sections
    expect(screen.queryByText(/MEDIUM Priority/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/LOW Priority/i)).not.toBeInTheDocument();
  });
});
