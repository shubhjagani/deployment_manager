import "./App.css";
import React, { useState, useEffect } from "react";
import GitHubFileExplorer from "./components/GitHubFileExplorer/GitHubFileExplorer";
import FormComponent from "./components/FormComponent/FormComponent";
import YamlEditor from "./components/FormComponent/YamlEditor";
import UserContext from "./utils/UserContext";
import UserRoleSelector from "./components/GitHubFileExplorer/UserRoleSelector";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
// import Login from './components/Authentication/Login';
// import Callback from './utils/Callback';
import {
  handleFormSubmit,
  getFileNameFromPath,
  jsonStringToYamlString,
} from "./utils/helpers";
import yaml from "js-yaml";
import FileExplorer from "./components/GitHubFileExplorer/FileExplorer";

function MainApp() {
  const [yamlData, setYamlData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [role, setRole] = useState("Viewer");
  const [user, setUser] = useState(null);
  const [accessibleEntities, setAccessibleEntities] = useState(null);

  const fetchGitHubFileContent = async (owner, repo, path, token) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Error fetching file from GitHub: ${response.statusText}`
      );
    }
    const content = await response.json();
    const decodedContent = atob(content.content);
    return { content: decodedContent, sha: content.sha };
  };

  const handleYamlFileSelect = async (file, setYamlData, setSelectedFile) => {
    try {
      const { content, sha } = await fetchGitHubFileContent(
        selectedRepo.owner.login,
        selectedRepo.name,
        file.path,
        jwtToken
      );
      const isJson = content.trim().startsWith("{");
      const yamlContent = isJson ? jsonStringToYamlString(content) : content;

      const parsedYamlData = yaml.load(yamlContent);
      setYamlData(parsedYamlData);
      setSelectedFile({
        path: file.path,
        sha,
      });
    } catch (error) {
      console.error("Error fetching or parsing the YAML file:", error);
    }
  };

  const fetchProjectList = async (token) => {
    const owner = "shubhjagani";
    const repo = "baps-apps";
    const path = "sso-api-config/chart/values";

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching projects from GitHub: ${response.statusText}`
      );
    }

    const directories = await response.json();
    return directories
      .filter((dir) => dir.type === "dir")
      .map((dir) => dir.name);
  };

  useEffect(() => {
    const fetchJwt = async () => {
      const response = await fetch('/api/generate-jwt');
      if (!response.ok) {
        throw new Error('Error fetching JWT');
      }
      const { token } = await response.json();
      setJwtToken(token);
    };
    fetchJwt();
  }, []);

  const resetStates = () => {
    setYamlData(null);
    setSelectedFile(null);
    setSelectedRepo(null);
    setRole("Viewer");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
      }}
    >
      <div className="App">
        <div className="container my-5">
          <div className="row mb-4">
            <div className="col-12">
              <h1>BAPS Apps Deployment Manager</h1>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <UserRoleSelector
                user={user}
                onUserChange={setUser}
                role={role}
                resetStates={resetStates}
                setAccessibleEntities={setAccessibleEntities}
              />
            </div>
          </div>
          <div className="main-content">
            <div className="col-md-4">
              <FileExplorer
                installationId={37226542}
                jwtToken={jwtToken}
                onYamlFileSelect={(file) =>
                  handleYamlFileSelect(file, setYamlData, setSelectedFile)
                }
                onSelectedRepoChange={setSelectedRepo}
                selectedUser={user}
                accessibleEntities={accessibleEntities}
              />
            </div>

            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h2>{getFileNameFromPath(selectedFile?.path)}</h2>
                  <p className="mb-0">
                    File path: {selectedFile?.path || "Select a file"}
                  </p>
                </div>
                <div className="card-body form-left-aligned">
                  {yamlData ? (
                    <pre>{JSON.stringify(yamlData, null, 2)}</pre>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>

              {role === "Viewer" || selectedFile?.path.includes("argocd") ? (
                <> </>
              ) : (
                <div className="card">
                  <div className="card-header">
                    <h2>Edit {getFileNameFromPath(selectedFile?.path)}</h2>
                  </div>
                  <div className="card-body">
                    {selectedFile && (
                      <>
                        {["super_admin", "admin"].includes(role) ? (
                          <YamlEditor
                            yamlData={yamlData}
                            onSubmit={(updatedYamlData) =>
                              handleFormSubmit(
                                updatedYamlData,
                                yamlData,
                                selectedFile,
                                setYamlData,
                                jwtToken,
                                selectedRepo.owner.login,
                                selectedRepo.name,
                                role
                              )
                            }
                          />
                        ) : (
                          <FormComponent
                            yamlData={yamlData}
                            token={jwtToken}
                            onSubmit={(updatedFormData) =>
                              handleFormSubmit(
                                updatedFormData,
                                yamlData,
                                selectedFile,
                                setYamlData,
                                jwtToken,
                                selectedRepo.owner.login,
                                selectedRepo.name
                              )
                            }
                            role={role}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
}

function App() {
  return (
    <Router>
      {/* <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/app" element={<MainApp />} />
      </Routes> */}
      <MainApp />
    </Router>
  );
}

export default App;
