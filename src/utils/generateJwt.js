const fs = require('fs');
const jwt = require('jsonwebtoken');

const generateJwt = () => {
  const appId = '322673';
  const privateKeyPath = './cs-deployment-manager.2023-05-06.private-key.pem';

  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + (10 * 60), // 10 minutes from now
    iss: appId,
  };

  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  return token;
};

module.exports = generateJwt;
