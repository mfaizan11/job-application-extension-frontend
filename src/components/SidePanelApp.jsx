import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  CircularProgress,
} from "@mui/material";
import { UserDataOverview } from "./UserDataOverview";

// --- Utility function for safe object traversal (simulating Lodash.get) ---
const get = (object, path, defaultValue) => {
  // <-- ADDED
  const result = String(path)
    .split(".")
    .reduce((acc, part) => {
      // Check if acc is null, undefined, or a primitive (preventing property access)
      if (acc === null || typeof acc !== "object") {
        return undefined;
      }
      return acc[part];
    }, object);

  return result === undefined ? defaultValue : result;
};

// Mock data for Cover Letter generation (will be stored in chrome.storage.local in the real app)
const MOCK_RESUME = {
  basics: {
    name: "Alice Johnson",
    label: "Senior Software Engineer",
    phone: "555-123-4567",
    email: "alice@dev.com",
  },
  work: [
    {
      company: "Tech Corp",
      summary:
        "Led team of 5 to launch a successful e-commerce platform using React and Node.js.",
    },
  ],
};

const MOCK_JOB_DESCRIPTION = `
Senior Software Engineer needed for a high-traffic e-commerce platform. 
Must have 5+ years of experience with React, Node.js, and MySQL. 
Strong leadership skills and expertise in cloud deployment (GCP/Vercel) are a must.
`;

// Relevance scores are not calculated by the MVP, so we mock them to test the prompt
const MOCK_RELEVANCE_SCORES = {
  skills: { React: 95, "Node.js": 88, Leadership: 75 },
  experience: { "e-commerce platform": 92 },
};

export function SidePanelApp() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // --- FR 2.2: Semantic Analysis Workflow ---
  const handleSemanticAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      // 1. FR 2.1: Get contextual form data from Content Script
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const contentScriptResponse = await chrome.tabs.sendMessage(tab.id, {
        action: "GET_FORM_FIELD_DATA",
      });

      if (!contentScriptResponse || contentScriptResponse.status === "error") {
        throw new Error("Failed to get form data from current page.");
      }

      // 2. FR 2.2: Message Service Worker to perform LLM Semantic Analysis
      const serviceWorkerResponse = await chrome.runtime.sendMessage({
        action: "SEMANTIC_ANALYSIS",
        data: { formFieldData: contentScriptResponse.formData },
      });

      if (serviceWorkerResponse.status === "error") {
        throw new Error(serviceWorkerResponse.message);
      }

      const { path } = serviceWorkerResponse.mapping;

      // MOCK: Get value from mock resume using the returned path
      // In a real app, you would use a utility like Lodash.get(MOCK_RESUME, path)
      const valueToAutofill = get(MOCK_RESUME, path); // <-- UPDATED

      if (valueToAutofill === undefined) {
        throw new Error(
          `Mapping successful (${path}), but no value found in resume data.`
        );
      }

      // 3. FR 2.3: Send final autofill command to Content Script
      await chrome.tabs.sendMessage(tab.id, {
        action: "PERFORM_AUTOFILL",
        path: path,
        value: valueToAutofill, // <-- UPDATED
      });

      setResult(
        `✅ Mapped to: ${path}. MOCK Autofill (value: ${valueToAutofill}) executed! Check the webpage alert.` // <-- UPDATED
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FR 3.3: Cover Letter Generation Workflow ---
  const handleGenerateCoverLetter = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      // Message Service Worker to perform LLM Cover Letter Generation
      const serviceWorkerResponse = await chrome.runtime.sendMessage({
        action: "GENERATE_COVER_LETTER",
        data: {
          jobDescription: MOCK_JOB_DESCRIPTION,
          jsonResume: MOCK_RESUME,
          relevanceScores: MOCK_RELEVANCE_SCORES,
        },
      });

      if (serviceWorkerResponse.status === "error") {
        throw new Error(serviceWorkerResponse.message);
      }

      // FR 3.4: Display the draft cover letter
      setResult(serviceWorkerResponse.coverLetter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        width: 300,
      }}
    >
      <Typography variant="h5" color="primary">
        Job Application Extension
      </Typography>
      {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Test Core Features (Backend: http://localhost:3000)
      </Typography> */}
      <UserDataOverview
        onSemanticAnalysis={handleSemanticAnalysis}
        onGenerateCoverLetter={handleGenerateCoverLetter}
        isLoading={loading}
      />

      {/* REMOVED: The two buttons for Semantic Autofill and Cover Letter Gen
          is now inside UserDataOverview as per the new reference image. 
          The logic (handleSemanticAnalysis / handleGenerateCoverLetter) 
          is not being used by the UI at this point, which is expected 
          since we are only focusing on design now. */}

      <Paper
        elevation={3}
        sx={{
          p: 2,
          overflowY: "auto",
          flexGrow: 1,
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
          Output:
        </Typography>

        {error && (
          <Typography color="error" variant="body2">
            ERROR: {error}
          </Typography>
        )}

        {result && (
          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={12}
            value={result}
            variant="outlined"
            InputProps={{ readOnly: true }}
            sx={{ mt: 1 }}
          />
        )}
      </Paper>

      {/* NOTE: If you need to re-enable the functionality testing buttons 
          (1. Test Semantic Autofill and 2. Test Cover Letter Gen) 
          in the future, they should be placed here, below the UserDataOverview 
          and above the Output Panel, as they were originally. 
          For now, they are removed to match the reference image's layout 
          that puts "Autofill Form" and "Generate Cover Letter" inside 
          the UserDataOverview card. */}
    </Box>
  );
}
