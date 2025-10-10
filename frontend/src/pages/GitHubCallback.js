import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GitHubCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithSocial } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const access = params.get('access');
        const refresh = params.get('refresh');

        const handleLogin = async (access, refresh) => {
            await loginWithSocial(access, refresh);
            navigate('/dashboard')
        };
        
        if (access && refresh) {
            handleLogin(access, refresh);
        } else {
            navigate('/');
        }
    }, [location, navigate, loginWithSocial]);

    return <div>Logging you in ...</div>
};

export default GitHubCallback;