import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Container, Box, Typography, TextField, Button, CircularProgress, Paper, Stack } from '@mui/material';

function EditProfilePage() {
    const {user, loading: authLoading, refreshUser} = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [skills, setSkills] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    console.log('authLoading:', authLoading, 'user:', user);

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || '');
            setSkills(user.skills || '');
        }
    }, [user]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        if (authLoading) {
            setError("User data is still loading. Please wait ...");
            return;
        }
        if (!user || !user.id) {
            setError("User data not available. Please wait a moment and try again.");
            return; 
        }
        await refreshUser();
        const formData = new FormData();
        formData.append('display_name', displayName);
        formData.append('skills', skills);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.patch(`/users/${user.id}/`, formData, {
                headers: {'Content-Type':'multipart/form-data'}
            });
            alert('Profile updated successfully!');
            refreshUser();
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err)
        }
    };

    const handleRemoveImage = async () => {
        if (!user || !user.id) {
            setError("Please wait fetching user data...");
            return;
        }
        if (window.confirm("Are you sure you want to remove your profile picture ?")) {
            try {
                api.patch(`/users/${user.id}/`, { image: null });
                await refreshUser();
                alert('Profile picture removed!');
                setImage(null);
            } catch (err) {
                setError("Failed to remove the profile picture:", err);
                console.error(err);
            }
        }
    }

    if (authLoading) return <CircularProgress />;

    if (!user) {
        return (
            <Box>
                <Navbar />
                <Container maxWidth="sm" sx={{ mt: 4 }}>
                    <Typography color="error" align="center">
                        Could not load user data. Please try logging in again.
                    </Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <Navbar />
            <Container maxWidth="md" sx={{mt: 4}}>
                <Paper elevation={3} sx={{p: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Edit Your Profile
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{mt: 3}}>
                    <Stack spacing={3}>
                    <TextField 
                        label="Display Name" variant="outlined" fullWidth required margin="normal"
                        value={displayName} onChange={(e)=> setDisplayName(e.target.value)}
                    />
                    <TextField
                        label="Skills (comma-seperated)" variant="outlined" fullWidth margin="normal"
                        value={skills} onChange={(e)=> setSkills(e.target.value)}
                    />
                    <Button variant="contained" component="label" sx={{mt: 2, mr: 3}}>
                        Upload Profile Picture
                        <input type="file" hidden onChange={handleImageChange} />
                    </Button>
                    {user && user.image_url && !user.image_url.includes('default.jpg') && (
                        <Button variant="text" color="error" onClick={handleRemoveImage}>
                            Remove Picture
                        </Button>
                    )}

                    {image && <Typography sx={{mt: 1}}>{image.name}</Typography> && (
                        <img src={URL.createObjectURL(image)} alt="preview"
                            style={{width: 100, height: 100, objectFit:'cover', marginTop: 8}}
                        />
                    )}
                    {error && <Typography color="error">{error}</Typography>}
                    <Button type="submit" variant="contained" sx={{mt: 2}} disabled={authLoading}>
                        Save Changes
                    </Button>
                    </Stack>
                </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditProfilePage;