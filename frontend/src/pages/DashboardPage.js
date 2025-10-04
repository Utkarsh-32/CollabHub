import { useEffect, useState } from "react";
import { Box, Container, Typography, AppBar, 
        Toolbar, Tabs, Tab, Button, 
        Avatar, Badge,
        CircularProgress} from '@mui/material';
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MyProjectsList from "../components/MyProjectsList";
import MyApplicationsList from "../components/MyApplicationList";
import MyInvitationsList from "../components/MyInvitationsList";
import api from "../api/api";
import Navbar from "../components/Navbar";

function DashboardPage() {
    const { user, logout} = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [dashboardData, setDashboardData] = useState({invitations: []});
    const [loading, setLoading] = useState(true);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const fetchDashboardData = async () => {
        if (loading) {
            try {
                const inviteRes = await api.get('/projects/my_invitations/');
                setDashboardData({invitations: inviteRes.data});
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [])

    if (loading && !user) {
        return (
            <Box>
                <Navbar />
                <CircularProgress sx={{display:'block', margin:'auto', mt:4}} />
            </Box>
        )
    }

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
                {user && (
                    <Box sx={{display:'flex', 
                            alignItems:'center', 
                            mb:4, justifyContent: 'space-between',
                            p: 2, bgcolor: 'background.paper',
                            borderRadius: 2}}>
                        <Box sx={{display: 'flex', alignItems:'center'}}>
                        <Avatar src={user.image} alt={user.display_name} sx={{width: 56, height: 56, mr: 3}} />
                        <Box>
                            <Typography variant="h5">
                                Welcome, {user.display_name || user.username}!
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Manage your projects and applications below.
                            </Typography>
                        </Box>
                        </Box>
                        <Button component={RouterLink} to="/profile/edit" variant="outlined" sx={{ml: 3}}>
                            Edit Profile
                        </Button>
                    </Box>
                )}
                <Box sx={{borderBottom: 1, borderColor:"divider"}}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                        <Tab label="My projects" />
                        <Tab label="My applications" />
                        <Tab label={
                            <Badge badgeContent={dashboardData.invitations.length} color="error">
                                My Invitations
                            </Badge>
                        } />
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
                        <MyInvitationsList initialInvitations={dashboardData.invitations} onActionSuccess={fetchDashboardData} loading={loading}/>
                    </Box>
                )}
            </Container>
        </Box>
    )
};

export default DashboardPage;