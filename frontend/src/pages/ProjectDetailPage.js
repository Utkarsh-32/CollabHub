import { useState, useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../api/api";
import UserSearch from "../components/UserSearch";
import { useAuth } from "../context/AuthContext";
import {
    Container, Typography, CircularProgress, Box,
    Button, Divider, List, ListItem, ListItemText, 
    ListItemAvatar, Avatar, Chip, Paper, Stack,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import Navbar from "../components/Navbar";
import MessageBoard from "../components/MessageBoard";

function ProjectDetailPage() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const handleOpenConfirmDialog = (requestId, newStatus) => {
        setSelectedRequest({id: requestId, status: newStatus});
        setConfirmOpen(true);
    };
    const handleCloseConfirmDialog = () => {
        setConfirmOpen(false);
        setSelectedRequest(null);
    };
    const handleDelete = async () => {
        try {
            await api.delete(`/projects/${projectId}/`);
            alert('Project deleted successfully.');
            navigate('/');
        } catch (err) {
            alert('Failed to delete project.');
        }
    };

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${projectId}/`);
            setProject(response.data);
        } catch (err) {
            setError('Failed to load project details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const handleApply = async () => {
        try {
            await api.post(`/projects/${projectId}/apply/`);
            alert('Application sent successfully!');
            fetchProject();
        } catch (err) {
            alert(`Error: ${err.response?.data?.detail || 'An unknown error occurred.'}`);
        }
    };
    
    const handleRequestResponse = async (requestId, newStatus) => {
        try {
            await api.patch(`/team-members/${requestId}/`, {status: newStatus});
            alert(`Application has been ${newStatus}.`);
            fetchProject();
        } catch (err) {
            alert(`Error: ${err.response?.data?.detail || 'An error occured'}`);
        }
    };

    const handleWithdrawInvitation = async (invitationId) => {
        if (window.confirm("Are you sure you want to withdraw this invitation?")) {
            try {
                await api.delete(`/team-members/${invitationId}/`);
                alert('Invitation withdrawn.');
                fetchProject();
            } catch (err) {
                alert(`Error: ${err.response?.data?.detail || 'An error occured'}`);
            }
        }
    };

    return (
        <Box>
            <Navbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Button component={RouterLink} to="/">
                    &larr; Back to Projects
                </Button>
                
                {loading && <CircularProgress sx={{ mt: 2 }} />}
                {error && <Typography color="error">{error}</Typography>}
                
                {project && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h4" component="h1">
                                {project.title}
                            </Typography>
                            {project.is_owner && (
                                <Stack direction="row" spacing={1}>
                                    <Button variant="outlined" component={RouterLink} to={`/projects/${projectId}/edit/`}>
                                        Edit Project
                                    </Button>
                                    <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
                                        Delete Project
                                    </Button>
                                </Stack>
                            )}
                            {user && !project.is_owner && !project.my_status && (
                                <Button variant="contained" color="primary" onClick={handleApply}>
                                    Apply to Join
                                </Button>
                            )}
                            {user && project.my_status && (
                                <Chip label={`Your Status: ${project.my_status.toUpperCase()}`} color="info" />
                            )}
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {project.description}
                        </Typography>
                        
                        <Divider />

                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Roles Required:
                        </Typography>
                        <List dense>
                            {project.roles_required.map((role, index) =>
                                <ListItem key={index} disableGutters>
                                    <ListItemText primary={role.role} secondary={`Count: ${role.count}`} />
                                </ListItem>
                            )}
                        </List>

                        <Divider />

                        <Typography variant="h6" sx={{ mt: 2 }}>Approved Members</Typography>
                        {project.approved_members && project.approved_members.length > 0 ? (
                            <List dense>
                                {project.approved_members.map((member) => (
                                    <RouterLink to={`/users/${member.id}`} key={member.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <ListItem button={true}>
                                            <ListItemAvatar>
                                                <Avatar src={member.image_url} alt={member.display_name}>{member.display_name.charAt(0).toUpperCase()}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={member.display_name} />
                                        </ListItem>
                                    </RouterLink>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                No members have been approved yet.
                            </Typography>
                        )}
                        
                        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                            <Avatar src={project.owner_image_url} alt={project.owner} sx={{ mr: 2 }} />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Owner</Typography>
                                <Typography variant="body1">{project.owner}</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{my: 2}} />
                        <Typography variant="h5" component="h2" gutterBottom>
                            Project Messsage Board
                        </Typography>
                        {(project.is_owner || project.my_status === 'approved') ? (
                            <MessageBoard projectId={projectId} />
                        ) : (
                            <Typography color="text.secondary">
                                You must be an approved member to view and post messages.
                            </Typography>
                        )}

                        {project.is_owner && (
                            <Paper elevation={2} sx={{ p: 2, mt: 4 }}>
                                <Typography variant="h6" gutterBottom>Invite New Members</Typography>
                                <UserSearch projectId={projectId}
                                            pendingReqs={project.pending_requests}
                                            sentInvitations={project.sent_invitations}
                                            onInviteSuccess={fetchProject}
                                            approvedMembers={project.approved_members}
                                            rejectedMembers={project.rejected_members} />
                            </Paper>
                        )}

                        {project.is_owner && (
                            <Stack sx={{mt: 4}} spacing={3}>
                                <Paper elevation={2} sx={{p: 2}}>
                                    <Typography variant="h6" gutterBottom>Pending Requests</Typography>
                                    {project.pending_requests && project.pending_requests.length > 0 ? (
                                        <List dense>
                                            {project.pending_requests.map(req => (
                                                <ListItem key={req.id}
                                                    secondaryAction={
                                                        <Stack direction="row" spacing={1}>
                                                            <Button size="small" variant="contained" color="success" onClick={()=>handleOpenConfirmDialog(req.id, 'approved')}>Approve</Button>
                                                            <Button size="small" variant="contained" color="error" onClick={()=>handleOpenConfirmDialog(req.id, 'rejected')}>Reject</Button>
                                                        </Stack>
                                                    }
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar src={req.image_url} alt={req.display_name} />
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={
                                                            <RouterLink to={`/users/${req.member_id}/`} style={{textDecoration:'none', color:'inherit', fontWeight: 500}}>
                                                                {req.display_name}
                                                            </RouterLink>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ): (
                                        <Typography variant="body2" color="textSecondary">No Pending requests</Typography>
                                    )}
                                </Paper>

                                <Paper elevation={2} sx={{p: 2}}>
                                    <Typography variant="h6" gutterBottom>Sent Invitations</Typography>
                                    {project.sent_invitations && project.sent_invitations.length > 0 ? (
                                        <List dense>
                                            {project.sent_invitations.map(inv => (
                                                <ListItem key={inv.id}
                                                    secondaryAction={
                                                    <Button variant="outlined" color="warning" onClick={()=>handleWithdrawInvitation(inv.id)}>
                                                        Withdraw Invitation
                                                    </Button>}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar src={inv.image_url} alt={inv.display_name} />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <RouterLink to={`/users/${inv.member_id}/`} style={{textDecoration:'none', color:'inherit', fontWeight: 500}}>
                                                                {inv.display_name}
                                                            </RouterLink>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ):(
                                        <Typography variant="body2" color="textSecondary">No Invitations Sent</Typography>
                                    )}
                                </Paper>
                            </Stack>
                        )}
                    </Box>
                )}
            </Container>
            <Dialog open={open} onClose={()=>setOpen(false)}>
                <DialogTitle>Delete Project?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete this project? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={confirmOpen} onClose={handleCloseConfirmDialog}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to <strong>{selectedRequest?.status === 'approved' ? 'Approve' : 'Reject'}</strong> this applicant ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
                    <Button onClick={
                        () => {handleRequestResponse(selectedRequest.id, selectedRequest.status);
                                handleCloseConfirmDialog();}
                    } 
                        color={selectedRequest?.status === 'approved' ? 'success' : 'error'} variant="contained">
                            Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProjectDetailPage;