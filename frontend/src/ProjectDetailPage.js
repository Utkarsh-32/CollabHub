import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import api from "./api/api";
import UserSearch from "./UserSearch";
import { useAuth } from "./context/AuthContext";

// Import all necessary MUI components
import {
    Container, Typography, CircularProgress, AppBar, Box,
    Toolbar, Button, Divider, List, ListItem, ListItemText, 
    ListItemAvatar, Avatar, Chip, Paper
} from "@mui/material";

function ProjectDetailPage() {
    const { projectId } = useParams();
    const { authToken } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This function fetches the project data from the backend.
    // We define it here so we can call it again to refresh the data after an action.
    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${projectId}/`);
            setProject(response.data);
        } catch (err) {
            setError('Failed to load project details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // This useEffect hook runs once when the page loads to get the initial data.
    useEffect(() => {
        fetchProject();
    }, [projectId]);

    // This function handles the API call when a user clicks "Apply".
    const handleApply = async () => {
        try {
            await api.post(`/projects/${projectId}/apply/`);
            alert('Application sent successfully!');
            fetchProject(); // Refresh the data to show the new "pending" status
        } catch (err) {
            alert(`Error: ${err.response?.data?.detail || 'An unknown error occurred.'}`);
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">CollabHub</Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Button component={RouterLink} to="/">
                    &larr; Back to Projects
                </Button>
                
                {loading && <CircularProgress sx={{ mt: 2 }} />}
                {error && <Typography color="error">{error}</Typography>}
                
                {project && (
                    <Box sx={{ mt: 2 }}>
                        {/* --- Title and Apply Button Section --- */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h4" component="h1">
                                {project.title}
                            </Typography>
                            
                            {authToken && !project.is_owner && !project.my_status && (
                                <Button variant="contained" color="primary" onClick={handleApply}>
                                    Apply to Join
                                </Button>
                            )}
                            {authToken && project.my_status && (
                                <Chip label={`Your Status: ${project.my_status}`} color="info" />
                            )}
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {project.description}
                        </Typography>
                        
                        <Divider />

                        {/* --- Roles Required Section --- */}
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Roles Required:
                        </Typography>
                        <List dense>
                            {project.roles_required.map((role, index) =>
                                <ListItem key={index} disableGutters>
                                    <ListItemText primary={role.role} secondary={`Count: ${role.count}`} />
                                </ListItem>
                            )}
                        </List>

                        <Divider />

                        {/* --- Approved Members Section --- */}
                        <Typography variant="h6" sx={{ mt: 2 }}>Approved Members</Typography>
                        {project.approved_members && project.approved_members.length > 0 ? (
                            <List dense>
                                {project.approved_members.map((member) => (
                                    <RouterLink to={`/users/${member.id}`} key={member.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <ListItem button={true}>
                                            <ListItemAvatar>
                                                <Avatar src={member.image_url} alt={member.display_name}>{member.display_name.charAt(0).toUpperCase()}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={member.display_name} />
                                        </ListItem>
                                    </RouterLink>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                No members have been approved yet.
                            </Typography>
                        )}
                        
                        {/* --- Owner Info Block --- */}
                        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                            <Avatar src={project.owner_image_url} alt={project.owner} sx={{ mr: 2 }} />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Owner</Typography>
                                <Typography variant="body1">{project.owner}</Typography>
                            </Box>
                        </Box>

                        {/* --- Invite Members Block (for Owner) --- */}
                        {project.is_owner && (
                            <Paper elevation={2} sx={{ p: 2, mt: 4 }}>
                                <Typography variant="h6" gutterBottom>Invite New Members</Typography>
                                <UserSearch projectId={projectId} />
                            </Paper>
                        )}
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default ProjectDetailPage;