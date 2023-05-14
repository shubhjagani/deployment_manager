import React from 'react';
const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
const redirectUri = process.env.REACT_APP_GITHUB_REDIRECT_URI;

const Login = () => {
  const handleClick = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
    window.location.href = githubAuthUrl;
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
  };

  const titleStyle = {
    fontSize: '2rem',
    marginBottom: '1.5rem',
  };

  const buttonStyle = {
    padding: '0.8rem 1.5rem',
    fontSize: '1.1rem',
    backgroundColor: '#24292e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: '0.3s',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>GitHub YAML Editor</h1>
      <button style={buttonStyle} onClick={handleClick}>
        Sign in with GitHub
      </button>
    </div>
  );
};

export default Login;
