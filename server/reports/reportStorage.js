/**
 * Report Storage Service
 * Handles file-based storage of daily evaluation reports
 * 
 * Requirements: 2.5, 4.1
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage directory for reports
const REPORTS_DIR = path.join(__dirname, '../../.kiro/reports');

/**
 * Ensure the reports directory exists
 * @returns {Promise<void>}
 */
async function ensureReportsDirectory() {
  try {
    await fs.access(REPORTS_DIR);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  }
}

/**
 * Generate filename for a report
 * @param {string} reportId - Report ID
 * @returns {string} Filename
 */
function getReportFilename(reportId) {
  return `report-${reportId}.json`;
}

/**
 * Get full path for a report file
 * @param {string} reportId - Report ID
 * @returns {string} Full file path
 */
function getReportPath(reportId) {
  return path.join(REPORTS_DIR, getReportFilename(reportId));
}

/**
 * Save a report to file storage
 * @param {import('./types.js').Report} report - Report to save
 * @returns {Promise<void>}
 */
export async function saveReport(report) {
  await ensureReportsDirectory();
  
  const filePath = getReportPath(report.id);
  const reportData = JSON.stringify(report, null, 2);
  
  await fs.writeFile(filePath, reportData, 'utf8');
}

/**
 * Retrieve a report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise<import('./types.js').Report|null>} Report or null if not found
 */
export async function getReport(reportId) {
  try {
    const filePath = getReportPath(reportId);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const report = JSON.parse(fileContent);
    
    // Convert date strings back to Date objects
    report.generatedAt = new Date(report.generatedAt);
    report.period.start = new Date(report.period.start);
    report.period.end = new Date(report.period.end);
    
    return report;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found
      return null;
    }
    throw error;
  }
}

/**
 * List all reports with optional filtering and sorting
 * @param {import('./types.js').ReportFilters} [filters] - Optional filters
 * @returns {Promise<import('./types.js').ReportMetadata[]>} Array of report metadata
 */
export async function listReports(filters = {}) {
  try {
    await ensureReportsDirectory();
    
    // Read all files in the reports directory
    const files = await fs.readdir(REPORTS_DIR);
    
    // Filter for report JSON files
    const reportFiles = files.filter(file => 
      file.startsWith('report-') && file.endsWith('.json')
    );
    
    // Read and parse all reports
    const reports = [];
    for (const file of reportFiles) {
      try {
        const filePath = path.join(REPORTS_DIR, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const report = JSON.parse(fileContent);
        
        // Convert date strings to Date objects
        const generatedAt = new Date(report.generatedAt);
        const periodStart = new Date(report.period.start);
        const periodEnd = new Date(report.period.end);
        
        // Apply filters
        if (filters.startDate && generatedAt < filters.startDate) {
          continue;
        }
        if (filters.endDate && generatedAt > filters.endDate) {
          continue;
        }
        if (filters.buildingIds && filters.buildingIds.length > 0) {
          // Check if report includes any of the specified buildings
          const reportBuildingIds = report.buildingDetails.map(b => b.buildingId);
          const hasMatchingBuilding = filters.buildingIds.some(id => 
            reportBuildingIds.includes(id)
          );
          if (!hasMatchingBuilding) {
            continue;
          }
        }
        
        // Create metadata object
        reports.push({
          id: report.id,
          generatedAt,
          period: {
            start: periodStart,
            end: periodEnd
          },
          summary: report.summary
        });
      } catch (error) {
        // Skip invalid files
        console.error(`Error reading report file ${file}:`, error.message);
      }
    }
    
    // Sort by generatedAt descending (most recent first)
    reports.sort((a, b) => b.generatedAt - a.generatedAt);
    
    // Apply limit if specified
    if (filters.limit && filters.limit > 0) {
      return reports.slice(0, filters.limit);
    }
    
    return reports;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Directory doesn't exist yet
      return [];
    }
    throw error;
  }
}

/**
 * Delete a report by ID
 * @param {string} reportId - Report ID to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteReport(reportId) {
  try {
    const filePath = getReportPath(reportId);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found
      return false;
    }
    throw error;
  }
}

/**
 * Delete old reports based on a date threshold
 * @param {Date} olderThan - Delete reports older than this date
 * @returns {Promise<number>} Number of reports deleted
 */
export async function cleanupOldReports(olderThan) {
  try {
    await ensureReportsDirectory();
    
    const files = await fs.readdir(REPORTS_DIR);
    const reportFiles = files.filter(file => 
      file.startsWith('report-') && file.endsWith('.json')
    );
    
    let deletedCount = 0;
    
    for (const file of reportFiles) {
      try {
        const filePath = path.join(REPORTS_DIR, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const report = JSON.parse(fileContent);
        const generatedAt = new Date(report.generatedAt);
        
        if (generatedAt < olderThan) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      } catch (error) {
        // Skip files that can't be read or parsed
        console.error(`Error processing file ${file} for cleanup:`, error.message);
      }
    }
    
    return deletedCount;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Directory doesn't exist
      return 0;
    }
    throw error;
  }
}
