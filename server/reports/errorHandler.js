/**
 * Error Handler Utility
 * Provides comprehensive error handling, retry logic, and logging for report services
 * 
 * Features:
 * - Graceful degradation for partial failures
 * - Exponential backoff retry logic
 * - Detailed error logging with context
 * - Error classification and recovery strategies
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

/**
 * Error types for classification
 */
export const ErrorType = {
  DATA_COLLECTION: 'DATA_COLLECTION',
  ML_SERVICE: 'ML_SERVICE',
  STORAGE: 'STORAGE',
  EXPORT: 'EXPORT',
  DISTRIBUTION: 'DISTRIBUTION',
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  CRITICAL: 'CRITICAL',  // Prevents operation completion
  HIGH: 'HIGH',          // Significant impact but operation can continue
  MEDIUM: 'MEDIUM',      // Moderate impact, degraded functionality
  LOW: 'LOW'             // Minor impact, operation continues normally
};

/**
 * Error log storage
 */
const errorLog = [];

/**
 * Maximum error log size
 */
const MAX_ERROR_LOG_SIZE = 1000;

/**
 * Log an error with context
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @param {Object} metadata - Additional metadata
 * @param {string} severity - Error severity level
 */
export function logError(error, context, metadata = {}, severity = ErrorSeverity.MEDIUM) {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
    metadata,
    severity,
    type: classifyError(error)
  };

  // Add to log
  errorLog.push(errorEntry);

  // Trim log if too large
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }

  // Console logging with appropriate level
  const logMessage = `[${severity}] ${context}: ${error.message}`;
  
  if (severity === ErrorSeverity.CRITICAL) {
    console.error(logMessage, metadata);
  } else if (severity === ErrorSeverity.HIGH) {
    console.error(logMessage, metadata);
  } else if (severity === ErrorSeverity.MEDIUM) {
    console.warn(logMessage, metadata);
  } else {
    console.log(logMessage, metadata);
  }

  return errorEntry;
}

/**
 * Classify error type based on error properties
 * @param {Error} error - The error to classify
 * @returns {string} Error type
 */
function classifyError(error) {
  const message = error.message.toLowerCase();

  if (message.includes('ml') || message.includes('model') || message.includes('prediction')) {
    return ErrorType.ML_SERVICE;
  }
  if (message.includes('storage') || message.includes('file') || message.includes('save')) {
    return ErrorType.STORAGE;
  }
  if (message.includes('export') || message.includes('pdf') || message.includes('csv')) {
    return ErrorType.EXPORT;
  }
  if (message.includes('email') || message.includes('sms') || message.includes('distribution')) {
    return ErrorType.DISTRIBUTION;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
    return ErrorType.NETWORK;
  }
  if (message.includes('data') || message.includes('collection')) {
    return ErrorType.DATA_COLLECTION;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Retry an async operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @param {Function} options.shouldRetry - Function to determine if error is retryable
 * @param {string} options.context - Context for logging
 * @returns {Promise<any>} Result of the operation
 */
export async function retryWithBackoff(operation, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
    context = 'operation'
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt >= maxAttempts || !shouldRetry(error)) {
        logError(
          error,
          `${context} (final attempt ${attempt}/${maxAttempts})`,
          { attempt, maxAttempts },
          ErrorSeverity.HIGH
        );
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

      logError(
        error,
        `${context} (attempt ${attempt}/${maxAttempts})`,
        { attempt, maxAttempts, retryDelay: delay },
        ErrorSeverity.MEDIUM
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Execute operation with graceful degradation
 * Returns partial result if operation fails
 * @param {Function} operation - Async function to execute
 * @param {any} fallbackValue - Value to return on failure
 * @param {string} context - Context for logging
 * @returns {Promise<{success: boolean, data: any, error?: Error}>}
 */
export async function withGracefulDegradation(operation, fallbackValue, context) {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    logError(
      error,
      `${context} - using fallback`,
      { fallbackValue },
      ErrorSeverity.MEDIUM
    );
    return { success: false, data: fallbackValue, error };
  }
}

/**
 * Execute multiple operations in parallel with partial failure handling
 * Returns successful results even if some operations fail
 * @param {Array<{name: string, operation: Function}>} operations - Array of named operations
 * @param {string} context - Context for logging
 * @returns {Promise<{results: Object, failures: Array}>}
 */
export async function executeWithPartialFailure(operations, context) {
  const results = {};
  const failures = [];

  const promises = operations.map(async ({ name, operation }) => {
    try {
      results[name] = await operation();
    } catch (error) {
      logError(
        error,
        `${context} - ${name} failed`,
        { operationName: name },
        ErrorSeverity.MEDIUM
      );
      failures.push({ name, error: error.message });
      results[name] = null;
    }
  });

  await Promise.all(promises);

  return { results, failures };
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for logging
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context, options = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const severity = options.severity || ErrorSeverity.MEDIUM;
      logError(error, context, { args }, severity);

      if (options.rethrow !== false) {
        throw error;
      }

      return options.fallback;
    }
  };
}

/**
 * Check if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is retryable
 */
export function isRetryableError(error) {
  const message = error.message.toLowerCase();

  // Network errors are retryable
  if (message.includes('timeout') || 
      message.includes('network') || 
      message.includes('econnrefused') ||
      message.includes('enotfound')) {
    return true;
  }

  // Temporary service unavailability is retryable
  if (message.includes('unavailable') || 
      message.includes('service') ||
      message.includes('temporarily')) {
    return true;
  }

  // Rate limiting is retryable
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return true;
  }

  // Validation errors are not retryable
  if (message.includes('invalid') || 
      message.includes('validation') ||
      message.includes('required')) {
    return false;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Get error log
 * @param {number} limit - Maximum number of entries to return
 * @returns {Array} Error log entries
 */
export function getErrorLog(limit = 100) {
  return errorLog.slice(-limit);
}

/**
 * Clear error log
 */
export function clearErrorLog() {
  errorLog.length = 0;
}

/**
 * Get error statistics
 * @returns {Object} Error statistics
 */
export function getErrorStats() {
  const stats = {
    total: errorLog.length,
    bySeverity: {},
    byType: {},
    byContext: {},
    recent: errorLog.slice(-10)
  };

  errorLog.forEach(entry => {
    // Count by severity
    stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;

    // Count by type
    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;

    // Count by context
    stats.byContext[entry.context] = (stats.byContext[entry.context] || 0) + 1;
  });

  return stats;
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create an error with additional context
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Object} context - Additional context
 * @returns {Error} Enhanced error object
 */
export function createError(message, type = ErrorType.UNKNOWN, context = {}) {
  const error = new Error(message);
  error.type = type;
  error.context = context;
  return error;
}

export default {
  ErrorType,
  ErrorSeverity,
  logError,
  retryWithBackoff,
  withGracefulDegradation,
  executeWithPartialFailure,
  withErrorHandling,
  isRetryableError,
  getErrorLog,
  clearErrorLog,
  getErrorStats,
  createError
};
