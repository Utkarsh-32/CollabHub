import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import api from "../api/api";
import { Container, Typography, CircularProgress, Box, Button, Chip, Avatar } from '@mui/material';
import Navbar from "../components/Navbar";

function UserProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${userId}/`);
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
            <Navbar />
            <Container maxWidth="md" sx={{mt:4}}>
                <Button onClick={() => navigate(-1)}>&larr; Back </Button>
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
                            {user.skills.split(',').filter(skill => skill.trim() !== '').map((skill, index) => (
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