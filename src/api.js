// WARNING: This URL must match your running backend environment.
const API_BASE_URL = 'http://localhost:3000'; 

// Use the mock UID from the backend's dummy authMiddleware
// In a real app, this would come from a secure storage (e.g., chrome.storage.local)
const MOCK_TOKEN = 'local-mock-token';

/**
 * Perform an authenticated fetch to the backend.
 * @param {string} endpoint - The API endpoint (e.g., '/api/llm/semantic-analysis')
 * @param {object} body - The request body data
 * @returns {Promise<object>} The JSON response
 */
export async function authenticatedFetch(endpoint, body = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MOCK_TOKEN}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed (${endpoint}): ${response.status} - ${errorText}`);
    }

    return response.json();
}