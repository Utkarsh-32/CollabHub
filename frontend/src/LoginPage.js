import { useState } from "react";
import { useNavigate, Link as RouterLink, Link } from "react-router-dom";
import { Container, Box, Typography, TextField,
         Button, AppBar, Toolbar, Grid, InputAdornment, IconButton } from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import { useAuth } from "./context/AuthContext";

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Unable to login with provided credentials.');
            console.error('Login error:', err);
        }
    };

    return (
        <Box>
            <AppBar position="static"><Toolbar><Typography variant="h6">CollabHub</Typography></Toolbar></AppBar>
            <Container maxWidth="xs">
                <Box sx={{mt:8, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <Typography variant="h5" component="h5">
                        Log In
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{mt: 1}}>
                        <TextField 
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="password"
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps = {{
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
                            }} />
                        {error && (
                            <Typography color="error" align="center">
                                {error}
                            </Typography>
                        )}
                        <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>
                            Login
                        </Button>
                        <Grid container justifyContent='flex-end'>
                            <Grid item>
                                <Link component={RouterLink} to="/register" variant="body2">
                                    Don't have an account? Sign Up
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
};

export default LoginPage;