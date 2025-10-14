import { useState } from "react";
import api from "../api/api";
import { List, ListItem, ListItemText, Typography, CircularProgress, Button, Box,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
 } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function MyInvitationsList({initialInvitations, onActionSuccess, loading}) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);

    const handleOpenDialog = (invitationId, newStatus) => {
        setSelectedAction({id: invitationId, status: newStatus});
        setOpen(true);
    };
    const handleCloseDialog = () => {
        setOpen(false);
        setSelectedAction(null);
    };

    const handleConfirmAction = async () => {
        if (!selectedAction) return;
        const {id, status} = selectedAction;
        
        try {
            await api.patch(`/team-members/${id}/respond/`, {status: status});
            alert(`You have ${status} this invitation`);
            onActionSuccess();
        } catch (error) {
            alert(`Error: ${error.response?.data?.detail || 'Could not respond'}`);
        } finally {
            handleCloseDialog();
        }
    };
    if (loading) return <CircularProgress />

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Pending Invitations</Typography>
            {initialInvitations.length > 0 ? (
                <List>
                    {initialInvitations.map(project => (
                        <ListItem
                            key={project.my_application_id}
                            secondaryAction={
                                <>
                                    <Button sx={{mr:1}} variant="contained" color="success"
                                        onClick={() => handleOpenDialog(project.my_application_id, 'approved')}>
                                            Accept
                                        </Button>
                                    <Button variant="outlined" color="error" onClick={() => handleOpenDialog(project.my_application_id, 'rejected')}>
                                        Decline
                                    </Button>
                                </>
                            }>
                                <ListItemText
                                    primary={project.title}
                                    secondary={`Invited by: ${project.owner}`}
                                    onClick={() => navigate(`/projects/${project.url.split('/').filter(Boolean).pop()}`)}
                                    sx={{cursor: 'pointer'}}
                                />
                            </ListItem>
                    ))}
                </List>
            ): (
                <Typography color="text.secondary">You have no pending invitations</Typography>
            )}
            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to 
                        <strong>{selectedAction?.status === 'approved' ? ' Accept ' : ' Decline '}</strong>
                        this invitation ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleConfirmAction} autoFocus color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyInvitationsList;