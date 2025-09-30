import { useState } from "react";
import axios from 'axios';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Container, Box, Typography, TextField, 
        Button, AppBar, Toolbar, Grid, Link, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from "@mui/icons-material";

function RegistrationPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show)
    const handleClickShowPassword1 = () => setShowPassword1((show1) => !show1)
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (password1 !== password2) {
            setError("Passwords do not match");
            return;
        }
        try {
            await axios.post('http://127.0.0.1:8000/api/auth/registration/', {
                username, email, password1, password2,
            });
            navigate('/login');
        } catch (err) {
            const errorData = err.response.data;
            const errorMsg = Object.values(errorData).join(' ');
            setError(errorMsg || 'Failed to register');
            console.error("Registration error:", err);
        }
    };
    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">CollabHub</Typography>
                </Toolbar></AppBar>
            <Container maxWidth="xs">
                <Box sx={{mt: 8, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <Typography variant="h5" component="h1">
                        Sign Up
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{mt:3}}>
                        <TextField
                            margin="normal" required fullWidth id="username"
                            label="Username" name="username" autoComplete="username"
                            autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField 
                            margin="normal" required fullWidth id="email"
                            label="Email Address" name="email" autoComplete="email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth id="password1"
                            label="Password" name="password1" type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password" value={password1}
                            onChange={(e) => setPassword1(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            margin="normal" required fullWidth name="password2"
                            label="Confirm Password" type={showPassword1 ? 'text' : 'password'} id="password2"
                            autoComplete="new-password"
                            value={password2} onChange={(e) => setPassword2(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword1}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        {error && <Typography color="error" align="center">{error}</Typography>}
                        <Button type="submit" fullWidth variant="contained" sx={{mt:3, mb:2}}>
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link component={RouterLink} to="/login" variant="body2">
                                    Already have an account? Log In
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default RegistrationPage;