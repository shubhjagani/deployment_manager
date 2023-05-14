import React, { useContext, useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import UserContext from '../../utils/UserContext';
import axios from 'axios';

const UserRoleSelector = ({ resetStates, setAccessibleEntities }) => {
  const { user, setUser, role, setRole } = useContext(UserContext);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = async (user) => {
    resetStates();
    setUser(user);
    setRole(user.role_type);

    try {
      const response = await axios.get(`/api/users/${user.user_id}/access`);
      setAccessibleEntities(response.data);
    } catch (error) {
      console.error('Error fetching user access:', error);
    }
  };

  return (
    <div>
      <h3>Users</h3>
      <ListGroup>
        {users.map((user) => (
          <ListGroupItem key={user.user_id} action onClick={() => handleUserClick(user)}>
            {user.name} - {user.role_type}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
};

export default UserRoleSelector;
