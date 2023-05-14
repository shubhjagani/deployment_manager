import React, { useCallback, useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import yaml from 'js-yaml';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/webpack-resolver';

const YamlEditor = ({ yamlData, onSubmit }) => {
  const [yamlContent, setYamlContent] = useState('');

  useEffect(() => {
    // Convert the yamlData object back to a string
    const yamlString = yaml.dump(yamlData);
    setYamlContent(yamlString);
  }, [yamlData]);

  const handleYamlChange = useCallback((newValue) => {
    setYamlContent(newValue);
  }, []);

  const handleSubmit = () => {
    try {
      // Convert the YAML string back to an object before submitting
      const updatedYamlData = yaml.load(yamlContent);
      onSubmit(updatedYamlData);
    } catch (error) {
      console.error('Error submitting YAML:', error);
    }
  };

  return (
    <div>
      <AceEditor
        mode="yaml"
        theme="monokai"
        onChange={handleYamlChange}
        value={yamlContent}
        name="YamlEditor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
        }}
        fontSize={14}
        width="100%"
        height="600px"
      />
      <div className="mt-3">
        <button className="btn btn-primary" onClick={handleSubmit}>
          {/* TODO right now the SHA does not get updated once the new file is submitted  */}
          Update YAML
        </button>
      </div>
    </div>
  );
};

export default YamlEditor;
