import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import styles from './GitHubFileExplorer.module.css';

const CreateNewYamlFile = ({ onSubmit, existingFileNames, setNewFileName }) => {
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Check if the input file name contains any extension other than .yaml
    const invalidExtension = /\.[0-9a-z]+$/i.test(fileName) && !fileName.endsWith('.yaml');
    if (invalidExtension) {
      setError('Only .yaml extension is allowed');
      return;
    }
  
    const newFileNameWithExtension = fileName.endsWith('.yaml') ? fileName : `${fileName}.yaml`;
    if (existingFileNames.includes(newFileNameWithExtension)) {
      setError('File name already exists');
      return;
    }
  
    onSubmit(newFileNameWithExtension);
    setFileName('');
    setError('');
    handleClose();
  };
  
  

  const handleInputChange = (e) => {
    setFileName(e.target.value);
    setError('');
  };

  
  return (
    <>
      <Button variant="primary" onClick={handleShow} className={`${styles.createNewYamlButton}`}>
        Create new .yaml file
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New .yaml File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="fileName">
              <Form.Label>File Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter file name"
                value={fileName}
                onChange={handleInputChange}
                required
              />
              {error && <p className="text-danger">{error}</p>}
            </Form.Group>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateNewYamlFile;
