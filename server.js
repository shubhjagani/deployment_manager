const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const json = express.json;
const axios = require('axios');
const post = axios.post;
const get = axios.get;
const cors = require('cors');
const getInstallationAccessToken = require('./src/utils/getInstallationAccessToken.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(json());

//Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({});

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get user access with tool information
app.get("/api/users/:userId/access", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Check if the user is a super admin
    const userRole = await prisma.role.findFirst({
      where: {
        userEntityRoles: {
          some: {
            user_id: userId,
          },
        },
      },
    });

    if (userRole && userRole.role_type === "super admin") {
      // Super admins have access to everything, return all entities and tools
      const allEntities = await prisma.entity.findMany({
        include: {
          entity_tool: {
            include: {
              tool: true,
            },
          },
        },
      });

      const projects = [];
      const units = [];
      const envs = [];

      for (const entity of allEntities) {
        const entityWithTools = {
          ...entity,
          tools: entity.entity_tool.map((et) => et.tool),
        };

        if (entity.entity_type === "project") {
          projects.push({ entity: entityWithTools, role: userRole });
        } else if (entity.entity_type === "unit") {
          units.push({ entity: entityWithTools, role: userRole });
        } else if (entity.entity_type === "env") {
          envs.push({ entity: entityWithTools, role: userRole });
        }
      }

      res.status(200).json({
        projects,
        units,
        envs,
      });
    } else {
      // Handle non-super admin users
      const userEntityRoles = await prisma.userEntityRole.findMany({
        where: { user_id: userId },
        include: {
          entity: true,
          role: true,
        },
      });

      const projects = new Map();
      const units = new Map();
      const envs = new Map();

      const allEntities = await prisma.entity.findMany({});

      for (const userEntityRole of userEntityRoles) {
        const entity = userEntityRole.entity;
        const role = userEntityRole.role;

        const accessibleEntities = allEntities.filter((e) => {
          return (
            e.hierarchy_ids.length >= entity.hierarchy_ids.length &&
            entity.hierarchy_ids.every(
              (hierarchyId, index) => hierarchyId === e.hierarchy_ids[index]
            )
          );
        });

        for (const accessibleEntity of accessibleEntities) {
          if (accessibleEntity.entity_type === "project") {
            projects.set(accessibleEntity, role);
          } else if (accessibleEntity.entity_type === "unit") {
            units.set(accessibleEntity, role);
          } else if (accessibleEntity.entity_type === "env") {
            envs.set(accessibleEntity, role);
          }
        }
      }

      const formatEntityRoleMap = (map) => {
        const result = [];
        map.forEach((role, entity) => {
          result.push({ entity, role });
        });
        return result;
      };

      res.status(200).json({
        projects: formatEntityRoleMap(projects),
        units: formatEntityRoleMap(units),
        envs: formatEntityRoleMap(envs),
      });
    }
  } catch (error) {
    console.error("Error fetching user access:", error);
    res.status(500).json({ message: "Error fetching user access" });
  }
});

app.get('/api/generate-jwt', async (req, res) => {
  try {
    const appId = 322673;
    const privateKeyPath = './cs-deployment-manager.2023-05-06.private-key.pem';

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + (10 * 60), // 10 minutes from now
      iss: appId,
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });



    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    res.status(500).json({ message: 'Error generating JWT' });
  }
});


app.post("/api/token", async (req, res) => {
  const { client_id, client_secret, code } = req.body;

  try {
    const response = await post(
      "https://github.com/login/oauth/access_token",
      {
        client_id,
        client_secret,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).json({ message: "Error exchanging code for token" });
  }
});

app.get("/api/installation/:installationId/token", async (req, res) => {
  try {
    const installationId = req.params.installationId;
    const installationAccessToken = await getInstallationAccessToken(
      installationId
    );
    res.status(200).json({ token: installationAccessToken });
  } catch (error) {
    console.error("Error fetching installation access token:", error);
    res
      .status(500)
      .json({ message: "Error fetching installation access token" });
  }
});

//get repos for user
app.get("/api/users/:userId/repositories", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({ where: { user_id: userId } });

    if (!user || !user.github_username) {
      res
        .status(404)
        .json({ message: "User not found or GitHub username not set" });
    } else {
      const installationId = 12345; // Replace this with the actual installation ID
      const installationAccessToken = await getInstallationAccessToken(
        installationId
      );

      const repositoriesResponse = await get(
        `https://api.github.com/users/${user.github_username}/repos`,
        { headers: { Authorization: `Bearer ${installationAccessToken}` } }
      );

      // Map over the response to only include the necessary data
      const simplifiedRepos = repositoriesResponse.data.repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        size: repo.size,
        default_branch: repo.default_branch,
        owner: {
          login: repo.owner.login,
          html_url: repo.owner.html_url,
        }
      }));

      res.status(200).json(simplifiedRepos);
    }
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({ message: "Error fetching repositories" });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
