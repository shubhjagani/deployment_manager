import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const exchangeCodeForToken = async () => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            const code = urlSearchParams.get('code');
        
            const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
            const clientSecret = process.env.REACT_APP_GITHUB_CLIENT_SECRET;
        
            try {
                const response = await axios.post('http://localhost:3001/api/token', {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                }, {
                    headers: {
                        'Accept': 'application/json',
                    },
                },
                );
        
                const accessToken = response.data.access_token;
                localStorage.setItem('github_token', accessToken);
                navigate('/app');
            } catch (error) {
                console.error('Error exchanging code for token:', error);
                navigate('/');
            }
        };        

        exchangeCodeForToken();
    }, [navigate]);

    return (
        <div>
            Exchanging code for access token...
        </div>
    );
};

export default Callback;