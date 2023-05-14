import React, { useState, useEffect, useContext } from "react";
import styles from "./GitHubFileExplorer.module.css";
import { ListGroup, ListGroupItem, Button } from "react-bootstrap";
import UserContext from "../../utils/UserContext";
import CreateNewYamlFile from "./CreateNewYamlFile";
import yaml from "js-yaml";
import {
  createArgoCdAppFileContent,
  createSsoApiConfigFileContent,
} from "../../utils/helpers";

const GitHubFileExplorer = ({
  installationId,
  jwtToken,
  onYamlFileSelect,
  onSelectedRepoChange,
  selectedUser,
  accessibleEntities,
}) => {
  const [showRepoList, setShowRepoList] = useState(true);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [directoryStack, setDirectoryStack] = useState([]);
  const [currentRepoContent, setCurrentRepoContent] = useState(null);
  const [installationAccessToken, setInstallationAccessToken] = useState(null);
  const { role } = useContext(UserContext);

  useEffect(() => {
    if (selectedUser && accessibleEntities && jwtToken) {
      getInstallationAccessToken(installationId, jwtToken).then((token) => {
        setInstallationAccessToken(token);
        fetchRepositories(token).then((repos) => {
          setRepositories(repos);
        });
      });
    }
  }, [selectedUser, accessibleEntities, jwtToken, installationId]);

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

  const fetchRepositories = async (installationAccessToken) => {
    const response = await fetch(
      "https://api.github.com/installation/repositories",
      {
        headers: {
          Authorization: `token ${installationAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching repositories: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data.repositories.map(repo => ({
      name: repo.name,
      url: repo.html_url
    })));
    // Map over the repositories and pick only the important details
    return data.repositories.map(repo => ({
      name: repo.name,
      url: repo.html_url,
      // add other fields here as needed
    }));
  };


  const fetchRepoContent = async (
    owner,
    repo,
    path,
    installationAccessToken
  ) => {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${installationAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching repo content: ${response.statusText}`);
    }

    return response.json();
  };
  const handleItemClick = (repo) => {
    setSelectedRepo(repo);
    onSelectedRepoChange(repo);
    setShowRepoList(false);

    if (installationAccessToken) {
      fetchRepoContent(repo.owner.login, repo.name, "", installationAccessToken)
        .then((content) => {
          setCurrentRepoContent(content);
        })
        .catch((error) => {
          console.error("Error fetching repo content:", error);
        });
    } else {
      console.error("Installation access token is not available.");
    }
  };

  const handleDirectoryClick = (item, selectedRepo) => {
    setDirectoryStack([...directoryStack, item.path]);

    fetchRepoContent(
      selectedRepo.owner.login,
      selectedRepo.name,
      item.path,
      installationAccessToken
    )
      .then((content) => {
        setCurrentRepoContent(content);
      })
      .catch((error) => {
        console.error("Error fetching repo content:", error);
      });
  };

  const handleBackButtonClick = () => {
    if (directoryStack.length === 0) {
      setShowRepoList(true);
      setCurrentRepoContent(null);
    } else {
      const newDirectoryStack = [...directoryStack];
      newDirectoryStack.pop();
      setDirectoryStack(newDirectoryStack);

      const newPath =
        newDirectoryStack.length === 0
          ? ""
          : newDirectoryStack[newDirectoryStack.length - 1];
      fetchRepoContent(
        selectedRepo.owner.login,
        selectedRepo.name,
        newPath,
        installationAccessToken
      )
        .then((content) => {
          setCurrentRepoContent(content);
        })
        .catch((error) => {
          console.error("Error fetching repo content:", error);
        });
    }
  };

  const handleCreateNewYamlFile = async (newFileName) => {
    // Define the default content of the new .yaml file
    const content = JSON.stringify({
      application: { name: null },
      deployment: {
        vaultIntegrationEnabled: false,
        tag: null,
        resources: {
          limits: { cpu: 1, memory: "1G" },
          requests: { cpu: "500m", memory: "128Mi" },
        },
        envFrom: [{ secretRef: { name: null } }],
      },
      service: { port: 80 },
      HPA: { maxReplicas: 4, targetCPUUtilization: 80 },
      ingress: { enabled: true, path: null },
    });
    const currentPath =
      directoryStack.length > 0
        ? directoryStack[directoryStack.length - 1]
        : "";
    const filePath = currentPath
      ? `${currentPath}/${newFileName}`
      : newFileName;
    const yamlContent = yaml.dump(JSON.parse(content));
    const response = await fetch(
      `https://api.github.com/repos/${selectedRepo.full_name}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${installationAccessToken}`,
        },
        body: JSON.stringify({
          message: `Create ${newFileName}`,
          content: btoa(yamlContent),
        }),
      }
    );
    if (response.ok) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Refresh the current directory content after creating the new file
      const contents = await fetchRepoContent(
        role,
        selectedRepo,
        installationAccessToken,
        currentPath
      );
      const filteredContent = contents.filter(
        (item) => item.type === "dir" || item.name.endsWith(".yaml")
      );
      setCurrentRepoContent(filteredContent);
    } else {
      console.error("Failed to create a new file");
    }
  };
  const createNewFileInRepo = async (
    repoFullName,
    filePath,
    fileContent,
    installationAccessToken
  ) => {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${installationAccessToken}`,
        },
        body: JSON.stringify({
          message: `Create ${filePath}`,
          content: btoa(fileContent),
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to create ${filePath}`);
    }
  };
  const createNewAppStructure = async (newAppName) => {
    if (!selectedRepo || !installationAccessToken) {
      console.error("Selected repository or token is missing");
      return;
    }
    const argocdAppsMainPath = "argocd-apps";
    const ssoApiMainConfigPath = "sso-api-config";
    const masterAppsPath = `${argocdAppsMainPath}/master-apps`;
    const chartPath = `${ssoApiMainConfigPath}/chart/values`;
    const envs = ["dev", "qa", "uat", "staging", "prod"];
    const createdFiles = [];
    const directoriesToCheck = [
      `${argocdAppsMainPath}`,
      `${masterAppsPath}`,
      `${ssoApiMainConfigPath}`,
      `${ssoApiMainConfigPath}/chart`,
      `${ssoApiMainConfigPath}/chart/values`,
    ];
    for (const directory of directoriesToCheck) {
      await checkAndCreateDirectory(
        selectedRepo.full_name,
        directory,
        installationAccessToken
      );
    }
    for (const env of envs) {
      await checkAndCreateDirectory(
        selectedRepo.full_name,
        `${masterAppsPath}/${env}/templates`,
        installationAccessToken
      );
    }
    try {
      // Creating argocd-apps files
      for (const env of envs) {
        const fileContent = createArgoCdAppFileContent(newAppName, env);
        await createNewFileInRepo(
          selectedRepo.full_name,
          `${masterAppsPath}/${env}/templates/${newAppName}.yaml`,
          fileContent,
          installationAccessToken
        );
        createdFiles.push(
          `${masterAppsPath}/${env}/templates/${newAppName}.yaml`
        );
      }
      // Creating sso-api-config files
      for (const env of envs) {
        const fileContent = createSsoApiConfigFileContent(newAppName);
        await createNewFileInRepo(
          selectedRepo.full_name,
          `${chartPath}/${newAppName}/values-${env}.yaml`,
          fileContent,
          installationAccessToken
        );
        createdFiles.push(`${chartPath}/${newAppName}/values-${env}.yaml`);
      }
      console.log("App structure created successfully");
      alert(`Created files:\n\n${createdFiles.join("\n")}`);
    } catch (error) {
      console.error("Error creating app structure:", error);
    }
  };
  const checkAndCreateDirectory = async (
    repoFullName,
    directoryPath,
    installationAccessToken
  ) => {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/${directoryPath}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${installationAccessToken}`,
        },
      }
    );
    if (!response.ok && response.status === 404) {
      // Directory not found, create it
      await createNewFileInRepo(
        repoFullName,
        `${directoryPath}/.gitkeep`,
        "",
        installationAccessToken
      );
    } else if (!response.ok) {
      throw new Error(`Failed to check directory: ${directoryPath}`);
    }
  };

  return (
    <div className={styles.fileExplorer}>
      {showRepoList ? (
        <>
          <div className={styles.fileExplorerHeader}>
            <h3>Repositories</h3>
          </div>
          <ListGroup className="text-left">
            {repositories
              .filter((repo) => repo.name === "baps-apps")
              .map((repo) => (
                <ListGroupItem
                  key={repo.id}
                  onClick={() => handleItemClick(repo)}
                >
                  {repo.name}
                </ListGroupItem>
              ))}
          </ListGroup>
        </>
      ) : (
        <>
          <div className={styles.fileExplorerHeader}>
            <h3>{selectedRepo ? selectedRepo.name : "Repo Content"}</h3>
          </div>
          <div>
            <p className="text-left">
              {[...directoryStack].length > 0
                ? [...directoryStack][[...directoryStack].length - 1]
                : ""}
            </p>
          </div>
          <Button
            className={`${styles.goBackButton}`}
            variant="secondary"
            onClick={handleBackButtonClick}
          >
            ‹ back
          </Button>
          {role === "admin" || role === "super admin" ? (
            <>
              <Button
                className={`${styles.createNewYamlButton}`}
                variant="primary"
                onClick={() => {
                  const newAppName = prompt("Please enter the new app name:");
                  if (newAppName) {
                    createNewAppStructure(newAppName);
                  }
                }}
              >
                Create a new app
              </Button>
              <CreateNewYamlFile
                onSubmit={handleCreateNewYamlFile}
                existingFileNames={currentRepoContent.map((item) => item.name)}
              />
            </>
          ) : (
            <> </>
          )}

          <ListGroup className="text-left">
            {currentRepoContent &&
              currentRepoContent.map((item) => (
                <ListGroupItem
                  key={item.id}
                  onClick={() => {
                    if (item.type === "dir") {
                      handleDirectoryClick(item, selectedRepo);
                    } else if (item.name.endsWith(".yaml")) {
                      onYamlFileSelect(item);
                    }
                  }}
                >
                  {item.type === "dir" ? "📁" : "📄"} {item.name}
                </ListGroupItem>
              ))}
          </ListGroup>
        </>
      )}
    </div>
  );
};

export default GitHubFileExplorer;
