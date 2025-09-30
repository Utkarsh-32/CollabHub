import {useState, useEffect, Fragment} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import api from './api/api';
import { 
    TextField, List, ListItem, ListItemText, Button, 
    CircularProgress, ListItemAvatar, Avatar, Chip, Box, Typography 
} from '@mui/material';
import { useAuth } from './context/AuthContext';

function UserSearch({projectId}) {
    const {user: currentUser} = useAuth();
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
            api.get('/users/', {params: {search: searchTerm}})
                .then(response => setResults(response.data.results))
                .catch(error => console.error('Error searching users', error))
                .finally(setLoading(false));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleInvite = (username) => {
        api.post(`http://127.0.0.1:8000/api/projects/${projectId}/invite/`, {username})
            .then(response => {
                alert(`Invitation sent to ${username}`);
            })
            .catch(error => {
                alert(`Failed to sent an invitation: ${error.response.data.detail}`);
            });
    };

    return (
        <div>
            <TextField fullWidth
                label="Search for username to invite by Username or Skill"
                variant="outlined"
                onChange={(e) => setSearchTerm(e.target.value)} />
            
            {loading && <CircularProgress size={20} sx={{mt:2}}/>}
            <List>
                {results.map(user => (
                    <ListItem key={user.id}
                        secondaryAction={currentUser && currentUser.username !== user.username && (
                            <Button variant="contained" onClick={()=>handleInvite(user.username)}>
                                Invite
                            </Button>
                        )}>
                        <RouterLink to={`/users/${user.id}`} style={{textDecoration:"none", color:"inherit", display:"flex", alignItems:"center"}}>
                            <ListItemAvatar>
                                <Avatar src={user.image} alt={user.display_name}>
                                    {user.display_name ? user.display_name.charAt(0).toUpperCase() : '?'}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={user.display_name}
                                secondary={
                                    <Fragment>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            @{user.username}
                                        </Typography>
                                        <Box component="div" sx={{mt:1}}>
                                            {user.skills && user.skills.split(',').map((skill, index) => (
                                                <Chip key={index} label={skill.trim()} size='small' sx={{mr:0.5, mb:0.5}} />
                                            ))}
                                        </Box>
                                    </Fragment>
                                } />
                        </RouterLink>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default UserSearch;