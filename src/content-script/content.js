console.log('Content Script Loaded on page.');

// FR 2.1: Mock function to extract form field data
function getMockFormFieldData() {
    // In a real implementation, you'd scan the DOM for the active input field
    // and extract its label, placeholder, name, and surrounding context.
    return { 
        label: "Primary Phone Number", 
        placeholder: "e.g. 555-123-4567", 
        dom_path: "/html/body/form/input[3]" 
    };
}

// Listener for messages from the Side Panel / Service Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // The Side Panel will message the Content Script to get form data
    if (request.action === 'GET_FORM_FIELD_DATA') {
        const formData = getMockFormFieldData();
        sendResponse({ status: 'success', formData });
        return true; // Keep the message channel open for async response
    }
    
    // The Side Panel will message the Content Script to perform autofill
    if (request.action === 'PERFORM_AUTOFILL') {
        // FR 2.3: In a real app, this would inject a value into a specific selector
        console.log(`Content Script: MOCK Autofill executed for path: ${request.path} with value: ${request.value}`);
        alert(`MOCK Autofill: Injected '${request.value}' into the field mapped to '${request.path}'.`);
        sendResponse({ status: 'success' });
        return true;
    }
});

// Optional: Open side panel when action is received from service worker (see background.js)
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'OPEN_SIDEPANEL') {
        // This is necessary because service workers cannot open the side panel directly, 
        // they must use an action that is handled by a visible part of the extension (like the content script).
        chrome.runtime.sendMessage({ action: 'OPEN_SIDEPANEL' });
    }
});