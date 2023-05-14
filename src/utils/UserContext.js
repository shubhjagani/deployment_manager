// UserContext.js
import { createContext } from 'react';

const UserContext = createContext({
  role: 'Viewer',
  allocatedProjects: [],
  allocatedEnvironments: [],
  setUser: () => {},
  setRole: () => {},
  setAllocatedProjects: () => {},
  setAllocatedEnvironments: () => {},
});

export default UserContext;
