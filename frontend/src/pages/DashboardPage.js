import { useState } from "react";
import { Box, Container, Typography, AppBar, 
        Toolbar, Tabs, Tab, Button } from '@mui/material';
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MyProjectsList from "../components/MyProjectsList";
import MyApplicationsList from "../components/MyApplicationList";
import MyInvitationsList from "../components/MyInvitationsList";

function DashboardPage() {
    const { user, logout} = useAuth();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        CollabHub
                    </Typography>
                    <Button color="inherit" component={RouterLink} to="/" sx={{mr: 3}}>Projects</Button>
                    <Button color="inherit" onClick={logout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{mt: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Your Dashboard
                </Typography>
                {user && (
                    <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <Typography variant="h6" sx={{mb: 2}}>
                            Welcome, {user.display_name || user.username}!
                        </Typography>
                        <Button component={RouterLink} to="/profile/edit" variant="outlined">
                            Edit Profile
                        </Button>
                    </Box>
                )}
                <Box sx={{borderBottom: 1, borderColor:"divider"}}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                        <Tab label="My projects" />
                        <Tab label="My applications" />
                        <Tab label="My invitations" />
                    </Tabs>
                </Box>
                {tabValue === 0 && (
                    <Box sx={{p: 3}}>
                        <Button component={RouterLink} to="/projects/new" variant="contained" sx={{mb:2}}>
                            Create New Project
                        </Button>
                        <MyProjectsList />
                    </Box>
                )}
                {tabValue === 1 && (
                    <Box sx={{p: 3}}>
                        <MyApplicationsList />
                    </Box>
                )}
                {tabValue === 2 && (
                    <Box sx={{p: 3}}>
                        <MyInvitationsList />
                    </Box>
                )}
            </Container>
        </Box>
    )
};

export default DashboardPage;