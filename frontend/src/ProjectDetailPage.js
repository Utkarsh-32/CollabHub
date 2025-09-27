import React, {useState, useEffect} from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {Container, Typography, CircularProgress, AppBar, Box, 
    Toolbar, Button, Divider, ListItemText, ListItemAvatar, List, ListItem, Avatar} from "@mui/material";

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
                            {project.owner.display_name}
                        </Typography>
                        <Divider />

                        <Typography variant="h6" sx={{mt:2}}>
                            Roles Required:
                        </Typography>
                        <List>
                            {project.roles_required.map((role, index) => 
                                <ListItem key={index}>
                                    <ListItemText primary={`role: ${role.role}`} secondary={`count: ${role.count}`}></ListItemText>
                                </ListItem>
                            )}
                        </List>
                        <Divider />

                        <Typography variant="h6" sx={{mt:2}}>Approved Members</Typography>
                        {project.approved_members && project.approved_members.length > 0 ? (
                            <List>
                                {project.approved_members.map((member) => (
                                    <RouterLink to={`/users/${member.id}`} key={member.id} style={{textDecoration:'none', color:'inherit'}}>
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar src={member.image_url} alt={member.display_name}>{member.display_name.charAt(0).toUpperCase()}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={member.display_name} />
                                        </ListItem>
                                    </RouterLink>
                                ))}
                            </List>
                        ): (
                            <Typography variant="body2" color="text.secondary" sx={{mt:1}}>
                                No members have been approved yet.
                            </Typography>
                        )}
                        <Box sx={{mt:2, display:'flex', alignItems:'center'}}>
                            <Avatar src={project.owner_image_url} alt={project.owner} sx={{mr:2}}>
                                {project.owner.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Owner
                                </Typography>
                                <Typography variant="body1">
                                    {project.owner}
                                </Typography>
                            </Box>
                        </Box>
                        
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default ProjectDetailPage;