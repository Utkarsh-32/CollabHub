import React, {useState, useEffect} from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {Container, Typography, CircularProgress, AppBar, Box, Toolbar, Button} from "@mui/material";

function ProjectDetailPage() {
    const { projectId } = useParams();
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/`);
                setProject(response.data)
            } catch (err) {
                setError('Failed to load project details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">CollabHub</Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ mt:4 }}>
                <Button component={RouterLink} to="/">
                    &larr; Back to Projects
                </Button>
                {loading && <CircularProgress sx={{mt: 2}}/>}
                {error && <Typography color="error">{error}</Typography>}
                {project && (
                    <Box sx={{mt: 2}}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {project.title}
                        </Typography>
                        <Typography variant="body1">
                            {project.description}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 2}}>
                            {project.owner}
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default ProjectDetailPage;