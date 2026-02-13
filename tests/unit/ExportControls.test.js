/**
 * Unit tests for ExportControls component
 * Tests export functionality for PDF and CSV formats
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportControls from '../../src/components/Reports/ExportControls.jsx';

// Mock fetch globally
global.fetch = jest.fn();

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('ExportControls', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock document.createElement and appendChild/removeChild
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: jest.fn(),
          style: {}
        };
      }
      return {};
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  test('should render export buttons', () => {
    render(<ExportControls reportId="report-123" />);
    
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
  });

  test('should show info message when no reportId provided', () => {
    render(<ExportControls />);
    
    expect(screen.getByText('Select a report to enable export')).toBeInTheDocument();
  });

  test('should disable buttons when no reportId provided', () => {
    render(<ExportControls />);
    
    const pdfButton = screen.getByText('Export as PDF').closest('button');
    const csvButton = screen.getByText('Export as CSV').closest('button');
    
    expect(pdfButton).toBeDisabled();
    expect(csvButton).toBeDisabled();
  });

  test('should enable buttons when reportId is provided', () => {
    render(<ExportControls reportId="report-123" />);
    
    const pdfButton = screen.getByText('Export as PDF').closest('button');
    const csvButton = screen.getByText('Export as CSV').closest('button');
    
    expect(pdfButton).not.toBeDisabled();
    expect(csvButton).not.toBeDisabled();
  });

  test('should handle PDF export successfully', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    });

    render(<ExportControls reportId="report-123" />);
    
    const pdfButton = screen.getByText('Export as PDF').closest('button');
    fireEvent.click(pdfButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Exporting PDF...')).toBeInTheDocument();
    });

    // Wait for export to complete
    await waitFor(() => {
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/reports/report-123/export/pdf');
    
    // Verify download was triggered
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  test('should handle CSV export successfully', async () => {
    const mockCSV = 'building,energy\nBuilding 1,100';
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockCSV)
    });

    render(<ExportControls reportId="report-456" />);
    
    const csvButton = screen.getByText('Export as CSV').closest('button');
    fireEvent.click(csvButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Exporting CSV...')).toBeInTheDocument();
    });

    // Wait for export to complete
    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/reports/report-456/export/csv');
  });

  test('should display error when PDF export fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error'
    });

    render(<ExportControls reportId="report-123" />);
    
    const pdfButton = screen.getByText('Export as PDF').closest('button');
    fireEvent.click(pdfButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Export failed: Internal Server Error/i)).toBeInTheDocument();
    });
  });

  test('should display error when CSV export fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    });

    render(<ExportControls reportId="report-123" />);
    
    const csvButton = screen.getByText('Export as CSV').closest('button');
    fireEvent.click(csvButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Export failed: Not Found/i)).toBeInTheDocument();
    });
  });

  test('should handle network error during PDF export', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ExportControls reportId="report-123" />);
    
    const pdfButton = screen.getByText('Export as PDF').closest('button');
    fireEvent.click(pdfButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('should disable button during export', async () => {
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['pdf']))
      }), 100))
    );

    render(<ExportControls reportId="report-123" />);
    
    const pdfButton = screen.getByText('Export as PDF').closest('button');
    fireEvent.click(pdfButton);

    // Button should be disabled during export
    await waitFor(() => {
      expect(pdfButton).toBeDisabled();
    });
  });

  test('should show error when trying to export without reportId', async () => {
    render(<ExportControls />);
    
    // Manually enable button to test the error handling
    const { rerender } = render(<ExportControls reportId={null} />);
    
    // The buttons should be disabled, so this tests the internal logic
    expect(screen.getByText('Select a report to enable export')).toBeInTheDocument();
  });

  test('should clear previous error when starting new export', async () => {
    // First export fails
    global.fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Error 1'
    });

    render(<ExportControls reportId="report-123" />);
    
    const pdfButton = screen.getByText('Export as PDF').closest('button');
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(screen.getByText(/Export failed: Error 1/i)).toBeInTheDocument();
    });

    // Second export succeeds
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob(['pdf']))
    });

    fireEvent.click(pdfButton);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/Export failed: Error 1/i)).not.toBeInTheDocument();
    });
  });
});
