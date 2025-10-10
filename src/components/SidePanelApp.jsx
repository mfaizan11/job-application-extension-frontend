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
      const mockValue = MOCK_RESUME.basics.phone; // Hardcode a value for the mock

      // 3. FR 2.3: Send final autofill command to Content Script
      await chrome.tabs.sendMessage(tab.id, {
        action: "PERFORM_AUTOFILL",
        path: path,
        value: mockValue,
      });

      setResult(
        `✅ Mapped to: ${path}. MOCK Autofill (value: ${mockValue}) executed! Check the webpage alert.`
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
        gap: 2,
        width: 300,
      }}
    >
      <Typography variant="h5" color="primary">
        AI Strategist
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Test Core Features (Backend: http://localhost:3000)
      </Typography>
      <UserDataOverview />
      <Button
        variant="contained"
        fullWidth
        onClick={handleSemanticAnalysis}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          "1. Test Semantic Autofill (FR 2.2)"
        )}
      </Button>

      <Button
        variant="outlined"
        fullWidth
        onClick={handleGenerateCoverLetter}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          "2. Test Cover Letter Gen (FR 3.3)"
        )}
      </Button>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          mt: 2,
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
    </Box>
  );
}
