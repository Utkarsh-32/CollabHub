import { useState, useEffect, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
    TextField, List, ListItem, ListItemText, Button, 
    CircularProgress, ListItemAvatar, Avatar, Chip, Box, Typography 
} from '@mui/material';

function UserSearch({ projectId, pendingReqs, sentInvitations,  onInviteSuccess, approvedMembers, rejectedMembers}) {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            api.get('/users/', { params: { search: searchTerm } })
                .then(response => setResults(response.data.results))
                .catch(error => console.error('Error searching users:', error))
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleInvite = (username) => {
        api.post(`/projects/${projectId}/invite/`, { username })
            .then(response => {
                alert(`Invitation sent to ${username}!`);
                onInviteSuccess();
            })
            .catch(error => {
                alert(`Failed to send invitation: ${error.response.data.detail}`);
            });
    };

    
    const getUserStatus = (user) => {
        if (approvedMembers.some(mem => mem.display_name === user.display_name)) return 'Member';
        if (pendingReqs.some(req => req.display_name === user.display_name)) return 'Pending';
        if (sentInvitations.some(inv => inv.display_name === user.display_name)) return 'Invited';
        if (rejectedMembers.some(rej => rej.display_name === user.display_name)) return 'Rejected';
        return null;
    };

    return (
        <div>
            <TextField
                fullWidth
                label="Search for users to invite by username or skill"
                variant="outlined"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {loading && <CircularProgress size={20} sx={{ mt: 2 }} />}
            <List>
                {results.map(user => {
                    const status = getUserStatus(user);
                    return (
                        <ListItem 
                            key={user.id}
                            secondaryAction={
                                currentUser && currentUser.username !== user.username && (
                                    status ? (
                                        <Button variant="outlined" disabled>{status}</Button>
                                    ) : (
                                        <Button variant="contained" onClick={() => handleInvite(user.username)}>
                                            Invite
                                        </Button>
                                    )
                                )
                            }
                        >
                            <RouterLink to={`/users/${user.id}/`} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
                                <ListItemAvatar>
                                    <Avatar src={user.image_url} alt={user.display_name} />
                        
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.display_name}
                                    secondary={
                                        <Fragment>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                @{user.username}
                                            </Typography>
                                            <Box component="div" sx={{ mt: 1 }}>
                                                {user.skills && user.skills.split(',').filter(skill => skill.trim() !== '').map((skill, index) => (
                                                    <Chip key={index} label={skill.trim()} size='small' sx={{ mr: 0.5, mb: 0.5 }} />
                                                ))}
                                            </Box>
                                        </Fragment>
                                    }
                                />
                            </RouterLink>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}

export default UserSearch;