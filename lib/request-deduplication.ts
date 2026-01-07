/**
 * Request Deduplication Utility
 * Prevents duplicate API calls for the same resource
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_TIMEOUT = 5000; // 5 seconds

/**
 * Deduplicate requests - if a request for the same key is already pending,
 * return the existing promise instead of making a new request
 */
export function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  
  // Check if there's a pending request
  const pending = pendingRequests.get(key);
  
  if (pending) {
    // Check if request is still valid (not expired)
    if (now - pending.timestamp < REQUEST_TIMEOUT) {
      return pending.promise;
    } else {
      // Request expired, remove it
      pendingRequests.delete(key);
    }
  }
  
  // Create new request
  const promise = requestFn()
    .then((result) => {
      // Remove from pending after completion
      pendingRequests.delete(key);
      return result;
    })
    .catch((error) => {
      // Remove from pending on error
      pendingRequests.delete(key);
      throw error;
    });
  
  // Store pending request
  pendingRequests.set(key, {
    promise,
    timestamp: now,
  });
  
  return promise;
}

/**
 * Clear all pending requests (useful for cleanup)
 */
export function clearPendingRequests() {
  pendingRequests.clear();
}

