// src/components/UserDataOverview.jsx
import React from 'react';
import { 
    Box, 
    Typography, 
    Avatar, 
    Grid, 
    Chip, 
    IconButton, 
    Paper, 
    Button 
} from '@mui/material';
import { 
    AddCircleOutline, 
    PictureAsPdf, 
    ContentCopy 
} from '@mui/icons-material';

// MOCK DATA (Should eventually come from secure chrome.storage.local)
const mockUserData = {
    avatar: 'https://i.imgur.com/8Qp208x.jpeg', // Cat image
    cvs: ['My_CV_1.pdf', 'Latest_Resume.pdf', 'Engineering_CV.pdf'],
    contact: [
        { label: 'Phone', value: '9438387447' },
        { label: 'Email', value: 'info@email.com' },
        { label: 'LinkedIn', value: 'linkedin/cato11' },
        { label: 'GitHub', value: 'github/111' },
    ]
};

// Component to represent the drag-and-drop file object (FR 4.1, FR 4.2)
const CvFileDisplay = ({ fileName }) => (
    <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: 1, 
        textAlign: 'center',
        // Minimal visual cues for drag-and-drop
        border: '1px solid transparent',
        '&:hover': { border: '1px solid #bb86fc', cursor: 'grab' } 
    }}>
        <PictureAsPdf sx={{ fontSize: 40, color: 'text.secondary' }} />
        <Typography variant="caption" noWrap>{fileName}</Typography>
    </Box>
);

export function UserDataOverview() {
    // NOTE: Drag-and-drop logic for FR 4.2 must be implemented later
    // using event listeners on the Content Script and a message back to the Side Panel.

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: 2, 
                borderRadius: 3, 
                mb: 3,
                // Implementing the light purple background gradient
                background: 'linear-gradient(145deg, rgba(187, 134, 252, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%)',
                border: '2px solid #bb86fc' 
            }}
        >
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 'bold' }}>Images:</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <Avatar src={mockUserData.avatar} sx={{ width: 60, height: 60, border: '2px solid #bb86fc' }} />
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'action.hover' }}>
                    <AddCircleOutline />
                </Avatar>
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'action.hover' }}>
                    <AddCircleOutline />
                </Avatar>
            </Box>

            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 'bold' }}>Resumes/CVs:</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {mockUserData.cvs.map((fileName, index) => (
                    <Grid item key={index}>
                        <CvFileDisplay fileName={fileName} />
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 'bold' }}>Contact Information:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {mockUserData.contact.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={item.value}
                            variant="outlined"
                            color="secondary"
                            size="medium"
                            sx={{ minWidth: 120, justifyContent: 'flex-start' }}
                        />
                        <IconButton 
                            size="small" 
                            aria-label={`Copy ${item.label}`}
                            onClick={() => navigator.clipboard.writeText(item.value)}
                        >
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}