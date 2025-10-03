import { useState } from "react";
import api from '../api/api';
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import { Container, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

function CreateProjectPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [roles, setRoles] = useState([{'role': '', 'count':1}]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRoleChange = (index, event) => {
        const newRoles = [...roles];
        newRoles[index][event.target.name] = event.target.value;
        setRoles(newRoles);
    };

    const addRoleField = () => {
        setRoles([...roles,{'role':'', 'count': 1}]);
    };
    
    const removeRoleField = (index) => {
        const newRoles = [...roles];
        newRoles.splice(index, 1);
        setRoles(newRoles)
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        const invalidRoles = roles.find(role => role.role.trim() === '');
        if (invalidRoles) {
            setError('All role names must be filled out');
            return;
        }
        try {
            const projectData = {
                title, description, roles_required:roles
            };
            const response = await api.post('/projects/', projectData);
            const newProjectId = response.data.url.split('/').filter(Boolean).pop();
            navigate(`/projects/${newProjectId}/`);
        } catch (err) {
            setError('Failed to create project.');
            console.error(err)
        }
        
    };

    return (
        <Box>
            <Navbar />
            <Container maxWidth="sm" sx={{mt: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Create a New Project
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="Project title" variant="outlined" required fullWidth margin="normal"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        label="Project description" variant="outlined" required fullWidth multiline rows={4}
                        margin="normal" value={description} onChange={(e) => setDescription(e.target.value)}
                    />
                    <Typography variant="h6" sx={{mt:2}}>Roles Required</Typography>
                    {roles.map((role, index) => (
                        <Box key={index} sx={{display:'flex', alignItems:'center', mb:1}}>
                            <TextField
                                name="role" label="Roles Name (e.g., Frontend Developer)" sx={{mr:1, flexGrow:1}}
                                value={role.role} onChange={(e) => handleRoleChange(index, e)}
                            />
                            <TextField
                                name="count" label="Count" type="number" sx={{width: '80px'}}
                                value={role.count} onChange={(e)=>handleRoleChange(index, e)}
                                inputProps={{min:1}}
                            />
                            <IconButton onClick={()=>removeRoleField(index)} disabled={roles.length===1}>
                                <RemoveIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={addRoleField}>Add Role</Button>
                    {error && <Typography color="error">{error}</Typography>}
                    <Button type="submit" variant="contained" fullWidth
                        sx={{mt:3}} disabled={!title.trim() || !description.trim()}>
                            Create Project
                        </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default CreateProjectPage;