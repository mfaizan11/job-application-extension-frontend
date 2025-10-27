import { authenticatedFetch } from "../api";

// Listener for messages from the Content Script or Side Panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Return true to indicate that the response will be sent asynchronously
  let handled = false;

  // --- Core Feature 1: Semantic Analysis (FR 2.2) ---
  if (request.action === "SEMANTIC_ANALYSIS") {
    const { formFieldData } = request.data;

    authenticatedFetch("/api/llm/semantic-analysis", { formFieldData })
      .then((response) => {
        console.log("Semantic Analysis Result:", response.mapping);
        sendResponse({ status: "success", mapping: response.mapping });
      })
      .catch((error) => {
        console.error("Semantic Analysis Failed:", error);
        sendResponse({ status: "error", message: error.message });
      });
    handled = true;
  }

  // --- Core Feature 2: Generate Cover Letter (FR 3.3) ---
  else if (request.action === "GENERATE_COVER_LETTER") {
    const { jobDescription, jsonResume, relevanceScores } = request.data;

    authenticatedFetch("/api/llm/generate-cover-letter", {
      jobDescription,
      jsonResume,
      relevanceScores,
    })
      .then((response) => {
        console.log("Cover Letter Generated:", response.coverLetter);
        sendResponse({ status: "success", coverLetter: response.coverLetter });
      })
      .catch((error) => {
        console.error("Cover Letter Generation Failed:", error);
        sendResponse({ status: "error", message: error.message });
      });
    handled = true;
  }

  return handled;
});

// Set the side panel to be open when the extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  // NEW: Check for common restricted Chrome URLs
  const url = tab.url;
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    console.warn(
      "Side panel cannot be opened on this page (Restricted Chrome URL)."
    );
    // The most common cause of "No active side panel for tabid" is clicking
    // the icon on a page like chrome://extensions. We block the API call here.
    return;
  }

  // UPDATED: Added try...catch block to handle the promise rejection
  // that occurs when opening the side panel on a restricted page
  // that wasn't caught by the initial URL check.
  try {
    // 1. Enable side panel for the active tab
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      enabled: true,
    });

    // 2. Open the side panel
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    // Catch and log the error to prevent the "Uncaught (in promise)" error
    // when clicking the icon on an inaccessible page (e.g., chrome-untrusted:// or browser settings pages)
    console.warn(
      `Failed to open side panel for tabId: ${tab.id} on URL: ${url}. Error: ${error.message}`
    );
  }
});

console.log("Service Worker Initialized");
