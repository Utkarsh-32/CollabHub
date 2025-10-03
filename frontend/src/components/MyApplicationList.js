import { useState, useEffect } from "react";
import api from "../api/api";
import { List, ListItem, ListItemText, Typography,
     CircularProgress, Box, Divider } from '@mui/material';
import { Link as RouterLink } from "react-router-dom";

function MyApplicationsList() {
    const [applications, setApplications] =  useState({pending:[], approved:[], rejected:[]});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const [pendingApp, approvedApp, rejectedApp] = await Promise.all([
                    api.get('/projects/my_pending_applications/'),
                    api.get('/projects/my_joined_projects/'),
                    api.get('/projects/my_rejected_applications/'),
                ]);
                setApplications({
                    pending: pendingApp.data,
                    approved: approvedApp.data,
                    rejected: rejectedApp.data,
                });
            } catch (err) {
                setError('Failed to load your applications');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return <CircularProgress />
    if (error) return <Typography color="error">{error}</Typography>

    const renderProjectList = (projects, title) => (
        <Box sx={{mb: 4}}>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            {projects.length > 0 ? (
                <List>
                    {projects.map(project => (
                        <ListItem 
                            key={project.url}
                            button={true}
                            component={RouterLink}
                            to={`/projects/${project.url.split('/').filter(Boolean).pop()}`}
                        >
                            <ListItemText primary={project.title} secondary={`Owner: ${project.owner}`} />
                        </ListItem>
                    ))}
                </List>
            ): (
                <Typography color="text.secondary">None</Typography>
            )}
        </Box>
    );

    return (
        <Box>
            {renderProjectList(applications.pending, "Pending Applications")}
            <Divider sx={{my: 2}} />
            {renderProjectList(applications.approved, "Approved Applications")}
            <Divider sx={{my: 2}} />
            {renderProjectList(applications.rejected, "Rejected Applications")}
        </Box>
    );
};

export default MyApplicationsList;