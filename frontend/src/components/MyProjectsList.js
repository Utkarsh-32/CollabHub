import { useState, useEffect } from "react";
import api from "../api/api";
import { List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material';
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MyProjectsList() {
    const { user, loading: authLoading} = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        const fetchProjects = async () => {
            try {
                const response = await api.get("projects/my_projects/");
                const projectsData = Array.isArray(response.data) ? response.data : response.data.results;
                setProjects(projectsData || []);
            } catch (err) {
                setError("Failed to load your projects");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchProjects();
        } else {
            setLoading(false);
        }
        
    }, [authLoading, user]);

    if (authLoading || loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <>
            <Typography variant="h5" gutterBottom>Projects you own</Typography>
            {projects.length > 0 ? (
                <List>
                    {projects.map((project) => (
                        <ListItem
                            key={project.url}
                            button={true}
                            component={RouterLink}
                            to={`/projects/${project.url.split('/').filter(Boolean).pop()}`}
                        >
                            <ListItemText primary={project.title} secondary={project.description} />
                        </ListItem>
                    ))}
                </List>
            ): (
                <Typography>You have not created any projects yet.</Typography>
            )}
        </>
    )
}

export default MyProjectsList;