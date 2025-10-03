import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { authToken, logout } = useAuth();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={RouterLink} to="/" sx={{flexGrow:1, color:'inherit', textDecoration:'none'}}>
                    CollabHub
                </Typography>
                {authToken ? (
                    <>
                    <Button color="inherit" component={RouterLink} to="/dashboard" sx={{mr: 3}}>
                        Dashboard
                    </Button>
                    <Button color="inherit" onClick={logout}>Logout</Button>
                    </>
                ): (
                    <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;