import React, {useState, useEffect} from "react";
import api from "./api/api";
import { 
  Container, ListItem, ListItemText,  List, AppBar, Box, CircularProgress,
  Toolbar, Typography,
  TextField, Button
} from '@mui/material';
import { Link, Link as RouterLink} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { authToken, logout} = useAuth();

  useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/', {params: {search:searchTerm}});
        setProjects(response.data.results);
      } catch (err) {
        setError('Failed to load projects. Is the backend server running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            CollabHub
          </Typography>
          { authToken ? (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          ): (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{mt: 4}}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects
        </Typography>

        <TextField
          fullWidth label="Search by Title, Description or Role"
          variant="outlined" sx={{mt:2}}
          onChange={(e) => setSearchTerm(e.target.value)} />

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <List>
            {projects.map(project => (
              <Link to={`/projects/${project.id}`} key={project.id} style={{textDecoration:'none', color:'inherit'}}>
              <ListItem button={true}>
                <ListItemText
                  primary={project.title}
                  secondary={project.description} />
              </ListItem>
              </Link>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
}

export default ProjectListPage;