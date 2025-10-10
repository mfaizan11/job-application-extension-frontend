import { authenticatedFetch } from '../api'; 

// Listener for messages from the Content Script or Side Panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Return true to indicate that the response will be sent asynchronously
    let handled = false; 

    // --- Core Feature 1: Semantic Analysis (FR 2.2) ---
    if (request.action === 'SEMANTIC_ANALYSIS') {
        const { formFieldData } = request.data;
        
        authenticatedFetch('/api/llm/semantic-analysis', { formFieldData })
            .then(response => {
                console.log('Semantic Analysis Result:', response.mapping);
                sendResponse({ status: 'success', mapping: response.mapping });
            })
            .catch(error => {
                console.error('Semantic Analysis Failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        handled = true;
    } 
    
    // --- Core Feature 2: Generate Cover Letter (FR 3.3) ---
    else if (request.action === 'GENERATE_COVER_LETTER') {
        const { jobDescription, jsonResume, relevanceScores } = request.data;

        authenticatedFetch('/api/llm/generate-cover-letter', { jobDescription, jsonResume, relevanceScores })
            .then(response => {
                console.log('Cover Letter Generated:', response.coverLetter);
                sendResponse({ status: 'success', coverLetter: response.coverLetter });
            })
            .catch(error => {
                console.error('Cover Letter Generation Failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        handled = true;
    }
    
    // Set up Side Panel on action icon click (MV3 requirement)
    if (request.action === 'OPEN_SIDEPANEL') {
        chrome.sidePanel.open({ tabId: sender.tab.id });
    }


    return handled;
});

// Set the side panel to be open when the extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
    await chrome.sidePanel.setOptions({
        tabId: tab.id,
        enabled: true
    });
    // Message the current tab to open the side panel
    chrome.tabs.sendMessage(tab.id, { action: 'OPEN_SIDEPANEL' });
});

console.log("Service Worker Initialized");