// utils/getInstallationAccessToken.js
const fetch = require('node-fetch');
const generateJwt = require('./generateJwt');

const getInstallationAccessToken = async (installationId) => {
  const jwt = generateJwt();
  const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching installation access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;
};

module.exports = getInstallationAccessToken;
