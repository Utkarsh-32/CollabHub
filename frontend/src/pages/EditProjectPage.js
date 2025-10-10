import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Container, Box, Typography, TextField, Button, IconButton, CircularProgress } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

function EditProjectPage() {
    const { projectId } = useParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [roles, setRoles] = useState([{role: '', count: 1}]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await api.get(`/projects/${projectId}/`);
                const projectData = response.data;
                setTitle(projectData.title);
                setDescription(projectData.description);
                setRoles(projectData.roles_required.length > 0 ? projectData.roles_required : [{role: '', count: 1}]);
            } catch (err) {
                setError("Failed to load project data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProject(); 
    }, [projectId]);

    const handleRoleChange = (index, event) => {
        const newRoles = [...roles];
        newRoles[index][event.target.name] = event.target.value;
        setRoles(newRoles);
    };

    const addRoleField = () => setRoles([...roles, {role: '', count: 1}]);

    const removeRoleField = (index) => {
        const newRoles = [...roles];
        newRoles.splice(index, 1);
        setRoles(newRoles);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        const invalidRole = roles.find(role => role.role.trim() === '')
        if (invalidRole) {
            setError('All role names must be filled out.');
            return;
        }

        try {
            const projectData = {
                title, description, roles_required: roles,
            };
            await api.patch(`/projects/${projectId}/`, projectData);
            navigate(`/projects/${projectId}/`);
        } catch (err) {
            setError("Failed to update project");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Box>
                <Navbar />
                <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />
            </Box>
        )
    };

    return (
        <Box>
            <Navbar />
            <Container maxWidth="sm" sx={{mt: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Edit Project
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField label="Project Title" variant="outlined" required fullWidth margin="normal"
                        value={title} onChange={(e)=> setTitle(e.target.value)} 
                    />
                    <TextField label="Project Description" variant="outlined" required fullWidth multiline rows={4}
                        margin='normal' value={description} onChange={(e)=> setDescription(e.target.value)}
                    />
                    <Typography variant="h6" sx={{mt: 2}}>Roles Required</Typography>
                    {roles.map((role, index) => (
                        <Box key={index} sx={{display:'flex', alignItems:"center", mb:1}}>
                            <TextField name="role" label="Role Name" sx={{mr:1, flexGrow: 1}}
                                value={role.role} onChange={(e) => handleRoleChange(index, e)}
                                required
                            />
                            <TextField
                                name="count" label="Count" type="number" sx={{width: '80px'}}
                                value={role.count} onChange={(e) => handleRoleChange(index, e)}
                                inputProps={{min: 1}}
                            />
                            <IconButton onClick={()=>removeRoleField(index)} disabled={roles.length === 1}>
                                <RemoveIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={addRoleField}>Add Role</Button>
                    {error && <Typography color="error">{error}</Typography>}
                    <Button type="submit" variant="contained" fullWidth sx={{mt: 3}}>Save Changes</Button>
                </Box>
            </Container>
        </Box>
    );
};

export default EditProjectPage;