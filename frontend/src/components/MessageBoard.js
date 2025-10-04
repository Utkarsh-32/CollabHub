import { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { Box, TextField, Button, List, ListItem, ListItemAvatar, 
        Avatar, ListItemText, Typography, CircularProgress } from '@mui/material';

function MessageBoard({projectId}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef?.current.scrollIntoView({behavior: 'smooth'});
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${projectId}/messages/`);
            setMessages(response.data.results);
        } catch (err) {
            setError('Could not load messages.');
            console.error("Fetch messages error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [projectId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newMessage.trim() === '') return;

        try {
            const response = await api.post(`/projects/${projectId}/messages/`, {content: newMessage});
            setMessages(prevMsgs => [...prevMsgs, response.data])
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            alert('Failed to post message');
            console.error('Post message error: ', err);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <List sx={{maxHeight: '400px', overflow:'auto', mb: 2}}>
                {messages.length > 0 ? messages.map(msg => (
                    <ListItem key={msg.id} alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar src={msg.author_image_url} alt={msg.author_username} />
                        </ListItemAvatar>
                        <ListItemText 
                            primary={msg.author_username}
                            secondary={
                                <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                        {msg.content}
                                    </Typography>
                                    {" - " + new Date(msg.timestamp).toLocaleString()}
                                </>
                            }
                        />
                    </ListItem>
                )) : (
                    <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
                )}
                <div ref={messagesEndRef} />
            </List>
            <Box component="form" onSubmit={handleSubmit} sx={{display:'flex'}}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Write a message ..."
                    value={newMessage}
                    onChange={(e)=>setNewMessage(e.target.value)}
                />
                <Button type="submit" variant="contained" sx={{ml: 1}}>
                    Post
                </Button> 
            </Box>
        </Box>
    );
};

export default MessageBoard;
