/**
 * Web Worker for heavy calculations
 * This worker handles the mockHeavy function to prevent blocking the main UI thread
 */

/**
 * Mock heavy function to simulate the heavy calculation
 * Moved from main thread to Web Worker to prevent UI blocking
 */
const mockHeavy = (n) => {
  if (n <= 1) return n;
  return mockHeavy(n - 1) + mockHeavy(n - 2);
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { id, n } = event.data;
  
  // Perform the heavy calculation
  const result = mockHeavy(n);
  
  // Send the result back to the main thread
  self.postMessage({ id, result });
});