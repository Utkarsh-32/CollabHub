import React, {useState, useEffect} from "react";
import {useParams, Link as RouterLink} from "react-router-dom";
import axios from "axios";
import { Container, Typography, CircularProgress, Box, AppBar, Toolbar, Button, Chip, Avatar } from '@mui/material';

function UserProfilePage() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}/`);
                setUser(response.data);
            } catch (err) {
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    return (
        <Box>
            <AppBar position="static"><Toolbar><Typography variant="h6">CollabHub</Typography></Toolbar></AppBar>
            <Container maxWidth="md" sx={{mt:4}}>
                <Button component={RouterLink} to="/">&larr; Back to Projects</Button>
                {loading && <CircularProgress sx={{mt:2}} />}
                {error && <Typography color="error">{error}</Typography>}
                {user && (
                    <Box sx={{mt:2, display:'flex', alignItems:'center'}}>
                        <Avatar src={user.image} alt={user.display_name} sx={{width:80, height:80, mr:2}} />
                        <Box>
                            <Typography variant="h4" component="h1">{user.display_name}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">@{user.username}</Typography>
                        </Box>
                    </Box>
                )}
                {user && user.skills && (
                    <Box sx={{mt:3}}>
                        <Typography variant="h6">Skills:</Typography>
                        <Box sx={{display:'flex', flexWrap:'wrap', gap:1, mt:1}}>
                            {user.skills.split(',').map((skill, index) => (
                                <Chip key={index} label={skill.trim()} />
                            ))}
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default UserProfilePage;