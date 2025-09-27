import React, {useState, useEffect} from "react";
import axios from 'axios';
import { 
  Container, ListItem, ListItemText,  List, AppBar, Box, CircularProgress,
  Toolbar, Typography,
  TextField
} from '@mui/material';
import { Link } from "react-router-dom";

function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchProjects = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/projects/', {params: {search:searchTerm}});
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
          <Typography variant="h6">
            CollabHub
          </Typography>
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
              <ListItem button>
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