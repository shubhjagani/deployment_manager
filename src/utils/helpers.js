import yaml from 'js-yaml';

const updateGitHubFileContent = async (owner, repo, path, content, sha, token) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Update YAML file',
      content: btoa(content),
      sha,
    }),
  });
  if (!response.ok) {
    throw new Error(`Error updating file on GitHub: ${response.statusText}`);
  }
  const updatedContent = await response.json();
  return updatedContent;
};

const jsonStringToYamlString = (jsonString) => {
  const jsonObject = JSON.parse(jsonString);
  return yaml.dump(jsonObject);
};

const handleFormSubmit = async (formData, yamlData, selectedFile, setYamlData, token, owner, repo, role) => {
  let updatedYamlData;
  let newFileContent;

  if (['super_admin', 'Admin'].includes(role)) {
    // Update the whole YAML file content
    updatedYamlData = formData;
    newFileContent = yaml.dump(updatedYamlData);
    setYamlData(updatedYamlData);
  } else {
    const {
      deployment: { tag, resources },
      HPA: { maxReplicas, targetCPUUtilization },
    } = formData;

    updatedYamlData = {
      ...yamlData,
      deployment: {
        ...yamlData.deployment,
        tag,
        resources: {
          ...yamlData.deployment.resources,
          limits: {
            ...yamlData.deployment.resources.limits,
            cpu: resources.limits.cpu,
            memory: resources.limits.memory,
          },
          requests: {
            ...yamlData.deployment.resources.requests,
            cpu: resources.requests.cpu,
            memory: resources.requests.memory,
          },
        },
      },
      HPA: {
        ...yamlData.HPA,
        maxReplicas,
        targetCPUUtilization,
      },
    };

    setYamlData(updatedYamlData);
    newFileContent = yaml.dump(updatedYamlData);
  }

  try {
    await updateGitHubFileContent(
      owner,
      repo,
      selectedFile.path,
      newFileContent,
      selectedFile.sha,
      token
    );
    console.log('File updated successfully');
  } catch (error) {
    console.error('Error updating the YAML file:', error);
  }
};




const getFileNameFromPath = (path) => {
  if (!path) return "Select a .yaml file"
  const pathParts = path.split('/');
  const fileName = pathParts[pathParts.length - 1];
  return fileName;
};

const createArgoCdAppFileContent = (appName, env) => {
  return `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${appName}-${env}
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/baps-apps/sso-api-config
    path: chart
    targetRevision: mvc-apps
    helm:
      valueFiles:
      - values/${appName}/values-${env}.yaml
      parameters:
      - name: clusterDomain
        value: dev.na.bapsapps.org
      - name: environment
        value: ${env}
  destination:
    server: https://kubernetes.default.svc
    namespace: dev
  project: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true`;
};

const createSsoApiConfigFileContent = (appName) => {
  return `application:
  name: ${appName}
deployment:
  vaultIntegrationEnabled: false
  tag: dev-73
  resources:
    limits:
      cpu: 1
      memory: 1G
    requests:
      cpu: 500m
      memory: 128Mi
  envFrom:
  - secretRef:
      name: ${appName}-secrets
service:
  port: 80
HPA:
  maxReplicas: 4
  targetCPUUtilization: 80
ingress:
  enabled: true
  path: `;
};

export {
  handleFormSubmit,
  getFileNameFromPath,
  createArgoCdAppFileContent,
  createSsoApiConfigFileContent,
  jsonStringToYamlString,
};

