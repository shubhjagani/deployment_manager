import React, { useMemo, useContext } from 'react';
import Form from '@rjsf/bootstrap-4';
import validator from '@rjsf/validator-ajv8';
import UserContext from '../../utils/UserContext';

const generateSchemaFromYaml = (yamlData) => {
  if (!yamlData) {
    return {};
  }

  const traverseObject = (obj, parentKey = '') => {
    const keys = Object.keys(obj);
    const schema = {
      type: 'object',
      properties: {},
    };

    keys.forEach((key) => {
      const value = obj[key];
      const combinedKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === 'object' && !Array.isArray(value)) {
        schema.properties[key] = traverseObject(value, combinedKey);
      } else {
        schema.properties[key] = {
          type: typeof value,
          title: combinedKey,
          default: value,
        };
      }
    });

    return schema;
  };

  return traverseObject(yamlData);
};

const FormComponent = ({ yamlData, onSubmit, token }) => {
  const { role } = useContext(UserContext);

  const schema = useMemo(() => {
    const generatedSchema = generateSchemaFromYaml(yamlData);
    let modifiedSchema;

    if (role === 'Manager') {
      modifiedSchema = {
        type: 'object',
        properties: {
          deployment: {
            title: 'Deployment',
            type: 'object',
            properties: {
              tag: {
                ...generatedSchema.properties.deployment.properties.tag,
                title: 'Tag',
                description: 'The tag for the deployment',
              },
              resources: {
                title: 'Resources',
                type: 'object',
                properties: {
                  limits: {
                    title: 'Limits',
                    type: 'object',
                    properties: {
                      cpu: {
                        ...generatedSchema.properties.deployment.properties.resources.properties.limits.properties.cpu,
                        title: 'CPU',
                        description: 'The CPU limit for the deployment',
                      },
                      memory: {
                        ...generatedSchema.properties.deployment.properties.resources.properties.limits.properties.memory,
                        title: 'Memory',
                        description: 'The memory limit for the deployment',
                      },
                  },
                },
                  requests: {
                    ...generatedSchema.properties.deployment.properties.resources.properties.requests,
                    title: 'Requests',
                    type: 'object',
                    properties: {
                      cpu: {
                        ...generatedSchema.properties.deployment.properties.resources.properties.requests.properties.cpu,
                        title: 'CPU',
                        description: 'The CPU request for the deployment',
                      },
                      memory: {
                        ...generatedSchema.properties.deployment.properties.resources.properties.requests.properties.memory,
                        title: 'Memory',
                        description: 'The memory request for the deployment',
                      },
                    },
                  },
                },
              },
            },
          },
          HPA: {
            title: 'HPA',
            description: 'Configuration for horizontal pod autoscaler',
            type: 'object',
            properties: {
              maxReplicas: {
                ...generatedSchema.properties.HPA.properties.maxReplicas,
                title: 'Max Replicas',
                description: 'The maximum number of replicas for the deployment',
              },
              targetCPUUtilization: {
                ...generatedSchema.properties.HPA.properties.targetCPUUtilization,
                title: 'Target CPU Utilization',
                description: 'The target CPU utilization percentage for the deployment',
              },
            },
          },
        },
      };
    }
    
    else if (role === 'Developer') {
      modifiedSchema = {
        type: 'object',
        properties: {
          deployment: {
            title: 'Deployment',
            type: 'object',
            properties: {
              tag: {
                ...generatedSchema.properties.deployment.properties.tag,
                title: 'Tag',
                description: 'The tag for the deployment',
              },
            },
          },
        },
      };
    } else if (role === 'Viewer') {
      modifiedSchema = {
        ...generatedSchema,
        // Add your modifications here
      };
      // Modify schema to prevent editing
    }
    return modifiedSchema;
  }, [yamlData, role]);

  const handleFormSubmit = ({ formData }) => {
    console.log('Form data submitted:', formData);

    if (onSubmit) {
      onSubmit(formData, token);
    }
  };

  return (
    <div>
      {yamlData ? (
        <Form
          schema={schema}
          validator={validator}
          onChange={console.log.bind(console, 'changed')}
          onSubmit={handleFormSubmit}
          onError={console.log.bind(console, 'errors')}
        >
          <div className="mb-3">
            <button type="submit" className="btn btn-primary">
              Update YAML
            </button>
          </div>
        </Form>
      ) : (
        <p>Loading form...</p>
      )}
    </div>
  );
};

export default FormComponent;
