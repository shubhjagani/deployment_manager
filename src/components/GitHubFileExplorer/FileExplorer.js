import React, { useEffect, useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';

const FileExplorer = ({ jwtToken, installationId, onYamlFileSelect }) => {
  const [pathStack, setPathStack] = useState([]);
  const [directoryContent, setDirectoryContent] = useState([]);
  const [installationAccessToken, setInstallationAccessToken] = useState(null);
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    if (jwtToken) {
      getInstallationAccessToken(installationId, jwtToken).then((token) => {
        setInstallationAccessToken(token);
        fetchUserRepos(token).then(setRepos);
        fetchDirectoryContent(token, '').then(setDirectoryContent);
      });
    }
  }, [jwtToken, installationId]);

  const getInstallationAccessToken = async (installationId, jwtToken) => {
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error getting installation access token: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.token;
  };

  const fetchUserRepos = async (token) => {
    const response = await fetch(
      `https://api.github.com/user/repos`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching user repos: ${response.statusText}`);
    }

    return response.json();
  };

  const fetchDirectoryContent = async (token, path) => {
    const response = await fetch(
      `https://api.github.com/repos/${path}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching repo content: ${response.statusText}`);
    }

    return response.json();
  };

  const handleClick = async (item) => {
    if (item.type === 'dir') {
      setPathStack([...pathStack, item.path]);
      const newContent = await fetchDirectoryContent(installationAccessToken, item.path);
      setDirectoryContent(newContent);
    } else if (item.type === 'file' && item.name.endsWith('.yaml')) {
      onYamlFileSelect(item);
    }
  };

  const handleBackClick = async () => {
    const newPathStack = [...pathStack];
    newPathStack.pop();
    setPathStack(newPathStack);
    const newPath = newPathStack.join('/');
    const newContent = await fetchDirectoryContent(installationAccessToken, newPath);
    setDirectoryContent(newContent);
  };

  return (
    <div>
      <Button disabled={pathStack.length === 0} onClick={handleBackClick}>Go back</Button>
      <ListGroup>
        {directoryContent.map(item => (
          <ListGroup.Item key={item.sha} onClick={() => handleClick(item)}>
            {item.type === 'dir' ? '📁' : '📄'} {item.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </ div>
    );
};

export default FileExplorer;
