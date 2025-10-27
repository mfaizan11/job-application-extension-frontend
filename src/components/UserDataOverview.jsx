import React, { useState, useRef, useEffect, useCallback } from "react"; // <-- UPDATED: Added useEffect, useCallback
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Paper,
  Button,
  Divider,
  Snackbar,
  Alert,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  ContentCopy,
  DeleteOutline,
  CloudUpload,
  Check,
  DragIndicator,
  Description,
  Edit,
  Person,
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  Language,
  Work,
  EmojiEvents,
  Save,
} from "@mui/icons-material";

// Key for chrome.storage.local
const STORAGE_KEY = "ais_userData"; // <-- ADDED

// Initial empty user data
const initialUserData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    linkedinUrl: "",
    portfolioUrl: "",
    currentTitle: "",
    yearsExperience: "",
  },
  cvs: [],
};

// CV File Display Component
const CvFileDisplay = ({ fileName, onDelete }) => {
  // ... (CvFileDisplay component remains unchanged)
  const [isHovered, setIsHovered] = useState(false);
  const cvFileRef = useRef(null); // ADDED: Ref to the Box element for drag image

  return (
    <Box
      ref={cvFileRef} // ADDED: Attach ref
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";

        // 1. Plain Text data
        e.dataTransfer.setData("text/plain", fileName);

        // 2. Set DownloadURL: This is the critical, Chrome-specific method
        // Format: MIME-type:URL:filename
        // We use a mock data URL. If a real file was stored (e.g., as a Blob in IndexedDB/storage),
        // we would use chrome.runtime.getURL() to point to a temporary file accessible by the extension.
        // For MVP, the mock data URL must suffice as a signal.
        const mockDataUri = `data:application/pdf;base64,`;
        const downloadUrlValue = `application/pdf:${mockDataUri}:${fileName}`;
        e.dataTransfer.setData("DownloadURL", downloadUrlValue); // RE-CONFIRMED: This is the best approach.

        // 3. Set a custom drag image to improve UX (optional but good practice)
        if (cvFileRef.current) {
          // ADDED: Set custom drag image
          e.dataTransfer.setDragImage(cvFileRef.current, 50, 50);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 1.5,
        borderRadius: 2,
        bgcolor: "rgba(255, 255, 255, 0.95)",
        border: "2px solid rgba(187, 134, 252, 0.3)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "grab",
        minWidth: 85,
        maxWidth: 110,
        minHeight: 120,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(187, 134, 252, 0.3)",
          border: "2px solid #bb86fc",
          cursor: "grab",
        },
        "&:active": {
          cursor: "grabbing",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      >
        <DragIndicator sx={{ fontSize: 14, color: "#bb86fc" }} />
      </Box>

      {isHovered && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            position: "absolute",
            top: 4,
            left: 4,
            bgcolor: "rgba(244, 67, 54, 0.9)",
            color: "white",
            width: 18,
            height: 18,
            padding: 0,
            "&:hover": {
              bgcolor: "rgba(211, 47, 47, 1)",
            },
          }}
        >
          <DeleteOutline sx={{ fontSize: 12 }} />
        </IconButton>
      )}

      <Description
        sx={{
          fontSize: 40,
          color: "#bb86fc",
          mb: 0.5,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        }}
      />

      <Typography
        variant="caption"
        sx={{
          color: "rgba(0, 0, 0, 0.87)",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: "100%",
          display: "block",
          overflow: "visible",
          fontSize: "0.65rem",
          fontWeight: 500,
          wordBreak: "break-word",
        }}
      >
        {fileName}
      </Typography>
    </Box>
  );
};

// Upload Zone Component
const UploadZone = ({ onFilesAdded }) => {
  // ... (UploadZone component remains unchanged)
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  return (
    <Box
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1.5,
        borderRadius: 2,
        bgcolor: isDragging
          ? "rgba(187, 134, 252, 0.2)"
          : "rgba(255, 255, 255, 0.95)",
        border: isDragging
          ? "2px dashed #bb86fc"
          : "2px dashed rgba(187, 134, 252, 0.4)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        minWidth: 85,
        maxWidth: 110,
        minHeight: 120,
        "&:hover": {
          bgcolor: "rgba(187, 134, 252, 0.15)",
          border: "2px dashed #bb86fc",
          transform: "translateY(-2px)",
        },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <CloudUpload
        sx={{
          fontSize: 36,
          color: "#bb86fc",
          mb: 0.5,
          opacity: isDragging ? 1 : 0.7,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: "rgba(0, 0, 0, 0.6)",
          textAlign: "center",
          fontSize: "0.65rem",
          fontWeight: 500,
        }}
      >
        {isDragging ? "Drop" : "Add PDF"}
      </Typography>
    </Box>
  );
};

// Compact Editable Info Field Component
const CompactInfoField = ({
  icon: Icon,
  value,
  onChange,
  placeholder,
  multiline = false,
  onCopySuccess,
}) => {
  // ... (CompactInfoField component remains unchanged)
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (value) {
      navigator.clipboard.writeText(value);
      onCopySuccess(`${placeholder.replace(" *", "")} copied!`);
    }
  };

  return (
    <Box
      onClick={isEditing ? undefined : () => setIsEditing(true)} // CHANGED: Moved onClick here to make the entire box clickable when not editing
      sx={{
        display: "flex",
        alignItems: multiline ? "flex-start" : "center",
        gap: 0.75,
        bgcolor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 1.5,
        p: 1,
        transition: "all 0.2s",
        cursor: isEditing ? "default" : "pointer",
        minHeight: 36,
        "&:hover": {
          boxShadow: isEditing ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Icon
        sx={{
          color: "#bb86fc",
          fontSize: 18,
          mt: multiline ? 0.5 : 0,
          flexShrink: 0,
        }}
      />
      {isEditing ? (
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          placeholder={placeholder}
          multiline={multiline}
          rows={multiline ? 2 : 1}
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "0.75rem",
              padding: "4px 8px",
              "& fieldset": {
                borderColor: "#bb86fc",
              },
              "& input, & textarea": {
                padding: "4px 8px",
                lineHeight: 1.3,
                color: "rgba(0, 0, 0, 0.87)",
              },
            },
          }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            // CHANGED: Use a constrained layout with space-between to always keep the copy button visible
            justifyContent: "space-between",
            minHeight: 20,
            width: "100%", // Ensure the box takes full width
          }}
        >
          <Typography
            // REMOVED: onClick={() => setIsEditing(true)} - it is now on the parent Box
            sx={{
              // CHANGED: Explicitly set max-width for the text area
              maxWidth: value ? "calc(100% - 28px)" : "100%", // Space for icon (24px) + gap (4px)
              fontSize: "0.75rem",
              color: value ? "rgba(0, 0, 0, 0.87)" : "rgba(0, 0, 0, 0.4)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.3,
              cursor: "inherit", // CHANGED: Use inherit to allow the 'pointer' from the parent Box to take effect
              flexShrink: 1, // Allow text to shrink
              ...(multiline
                ? { whiteSpace: "normal", wordBreak: "break-word" }
                : { whiteSpace: "nowrap" }),
            }}
          >
            {value || placeholder}
          </Typography>
          {/* Copy Button */}
          {value && (
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                p: 0,
                color: "#bb86fc",
                "&:hover": { bgcolor: "rgba(187, 134, 252, 0.1)" },
                flexShrink: 0, // Prevent button from shrinking
                marginLeft: 0.5, // Add a small margin
              }}
              title={`Copy ${placeholder.replace(" *", "")}`}
            >
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

export function UserDataOverview({
  onSemanticAnalysis,
  onGenerateCoverLetter,
  isLoading,
}) {
  const [userData, setUserData] = useState(initialUserData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- PERSISTENCE LOGIC START ---

  // Effect to load initial user data from storage
  useEffect(() => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          setUserData(result[STORAGE_KEY]);
        }
      });
    }
  }, []);

  // Function to save data to storage
  const saveUserData = useCallback((data) => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
        // console.log("User data saved to local storage.");
      });
    }
  }, []);

  // Effect to save user data whenever it changes
  useEffect(() => {
    saveUserData(userData);
  }, [userData, saveUserData]);

  // --- PERSISTENCE LOGIC END ---

  const handleFilesAdded = (files) => {
    const newFiles = files.map((file) => file.name);
    setUserData((prev) => ({
      ...prev,
      cvs: [...prev.cvs, ...newFiles],
    }));
    setSnackbar({
      open: true,
      message: `${files.length} file(s) added!`,
      severity: "success",
    });
  };

  const handleDeleteCv = (fileName) => {
    setUserData((prev) => ({
      ...prev,
      cvs: prev.cvs.filter((cv) => cv !== fileName),
    }));
    setSnackbar({
      open: true,
      message: "File removed!",
      severity: "info",
    });
  };

  const updatePersonalInfo = (field, value) => {
    // When personal info is updated, we update the state AND the storage via the useEffect/saveUserData flow
    setUserData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleAutofill = () => {
    // LinkedIn URL is now in the required section, check it too.
    const { firstName, lastName, email, phone, linkedinUrl } =
      userData.personalInfo;
    if (!firstName || !lastName || !email || !phone || !linkedinUrl) {
      setSnackbar({
        open: true,
        // UPDATED message to include LinkedIn
        message:
          "Please fill required fields (Name, Email, Phone, LinkedIn URL)",
        severity: "warning",
      });
      return;
    }

    // NEW: Call the feature handler passed from SidePanelApp
    onSemanticAnalysis();

    setSnackbar({
      open: true,
      message:
        "Validation passed. Attempting semantic analysis and autofill...",
      severity: "info",
    });
  };

  const handleCopySuccess = (message) => {
    setSnackbar({
      open: true,
      message: message,
      severity: "success",
    });
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          background: "linear-gradient(145deg, #e9a6e3 0%, #bb86fc 100%)",
          border: "none",
          color: "rgba(0, 0, 0, 0.87)",
          width: 400,
          maxWidth: 480,
          mx: "auto",
        }}
      >
        {/* Personal Information Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Person sx={{ color: "rgba(0, 0, 0, 0.87)", fontSize: 20 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, fontSize: "0.95rem" }}
          >
            Personal Information
          </Typography>
        </Box>

        {/* Important & Required Fields Label */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            display: "block",
            mb: 0.5,
          }}
        >
          Important & Required Fields
        </Typography>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          {/* Row 1: First & Last Name (Required) */}
          <Grid item xs={6}>
            <CompactInfoField
              icon={Person}
              value={userData.personalInfo.firstName}
              onChange={(val) => updatePersonalInfo("firstName", val)}
              placeholder="First Name *"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CompactInfoField
              icon={Person}
              value={userData.personalInfo.lastName}
              onChange={(val) => updatePersonalInfo("lastName", val)}
              placeholder="Last Name *"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>

          {/* Row 2: Email & Phone (Required) */}
          <Grid item xs={12}>
            <CompactInfoField
              icon={Email}
              value={userData.personalInfo.email}
              onChange={(val) => updatePersonalInfo("email", val)}
              placeholder="Email *"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CompactInfoField
              icon={Phone}
              value={userData.personalInfo.phone}
              onChange={(val) => updatePersonalInfo("phone", val)}
              placeholder="Phone *"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>

          {/* Row 3: LinkedIn URL (REQUIRED) */}
          <Grid item xs={12}>
            <CompactInfoField
              icon={LinkedIn}
              value={userData.personalInfo.linkedinUrl}
              onChange={(val) => updatePersonalInfo("linkedinUrl", val)}
              placeholder="LinkedIn URL *"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>
        </Grid>

        {/* Optional Fields Label */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            display: "block",
            mb: 0.5,
          }}
        >
          Optional Fields (Enhance Autofill)
        </Typography>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          {/* Row 1: City & Country */}
          <Grid item xs={6}>
            <CompactInfoField
              icon={LocationOn}
              value={userData.personalInfo.city}
              onChange={(val) => updatePersonalInfo("city", val)}
              placeholder="City"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CompactInfoField
              icon={LocationOn}
              value={userData.personalInfo.country}
              onChange={(val) => updatePersonalInfo("country", val)}
              placeholder="Country"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>

          {/* Row 2: Portfolio */}
          <Grid item xs={6}>
            <CompactInfoField
              icon={Language}
              value={userData.personalInfo.portfolioUrl}
              onChange={(val) => updatePersonalInfo("portfolioUrl", val)}
              placeholder="Portfolio"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>
          <Grid item xs={6}>
            {/* Empty slot for balance */}
          </Grid>

          {/* Row 3: Job Title & Experience */}
          <Grid item xs={7}>
            {" "}
            {/* CHANGED: Reduced width to xs={7} */}
            <CompactInfoField
              icon={Work}
              value={userData.personalInfo.currentTitle}
              onChange={(val) => updatePersonalInfo("currentTitle", val)}
              placeholder="Current Job Title"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>
          <Grid item xs={5}>
            {" "}
            {/* CHANGED: Increased width to xs={5} */}
            <CompactInfoField
              icon={EmojiEvents}
              value={userData.personalInfo.yearsExperience}
              onChange={(val) => updatePersonalInfo("yearsExperience", val)}
              placeholder="Years"
              onCopySuccess={handleCopySuccess}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.3)" }} />

        {/* Resumes/CVs Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Description sx={{ color: "rgba(0, 0, 0, 0.87)", fontSize: 20 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, fontSize: "0.95rem" }}
          >
            Resumes/CVs
          </Typography>
          <Chip
            label={userData.cvs.length}
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              fontWeight: 700,
              fontSize: "0.65rem",
              height: 20,
              color: "rgba(0, 0, 0, 0.87)",
            }}
          />
        </Box>

        {/* {userData.cvs.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 1.5,
              mb: 1.5,
              bgcolor: "rgba(255, 255, 255, 0.5)",
              borderRadius: 2,
              border: "2px dashed rgba(187, 134, 252, 0.5)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(0, 0, 0, 0.6)", fontSize: "0.7rem" }}
            >
              No resumes uploaded yet. Click below to add!
            </Typography>
          </Box>
        )} */}

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
          {userData.cvs.map((fileName, index) => (
            <CvFileDisplay
              key={index}
              fileName={fileName}
              onDelete={() => handleDeleteCv(fileName)}
            />
          ))}
          <UploadZone onFilesAdded={handleFilesAdded} />
        </Box>

        {/* Action Buttons */}
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              startIcon={
                isLoading ? undefined : <Check sx={{ fontSize: 16 }} />
              }
              onClick={handleAutofill}
              disabled={isLoading}
              sx={{
                bgcolor: "#9c27b0",
                fontWeight: 600,
                py: 1,
                borderRadius: 2,
                color: "white",
                textTransform: "none",
                fontSize: "0.8rem",
                boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                "&:hover": {
                  bgcolor: "#7b1fa2",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(156, 39, 176, 0.4)",
                },
                transition: "all 0.3s",
                position: "relative",
              }}
            >
              {isLoading ? (
                <CircularProgress
                  color="inherit"
                  size={20}
                  sx={{ color: "white" }}
                />
              ) : (
                "Autofill Form"
              )}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={
                isLoading ? undefined : <Description sx={{ fontSize: 16 }} />
              }
              onClick={onGenerateCoverLetter}
              disabled={isLoading}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.95)",

                color: "#9c27b0",
                border: "2px solid rgba(156, 39, 176, 0.3)",
                fontWeight: 600,
                py: 1,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "0.8rem",
                "&:hover": {
                  bgcolor: "white",
                  border: "2px solid #9c27b0",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(156, 39, 176, 0.2)",
                },
                transition: "all 0.3s",
              }}
            >
              {isLoading ? (
                <CircularProgress
                  color="inherit"
                  size={20}
                  sx={{ color: "#9c27b0" }}
                />
              ) : (
                "Generate Cover Letter"
              )}
            </Button>
          </Grid>
        </Grid>

        {/* Quick Tip */}
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            bgcolor: "rgba(255, 255, 255, 0.3)",
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.5)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "rgba(0, 0, 0, 0.7)",
              fontSize: "0.7rem",
              display: "block",
              lineHeight: 1.4,
            }}
          >
            💡 <strong>Quick Tip:</strong> Fill in your info once, autofill any
            job application! Click any field to edit. Fields with * are
            required.
          </Typography>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
