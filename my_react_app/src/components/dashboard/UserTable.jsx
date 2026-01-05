import React from 'react';
import './UserTable.css';

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'Moderator' },
];

const UserTable = () => {
  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map(({ id, name, email, role }) => (
          <tr key={id}>
            <td>{name}</td>
            <td>{email}</td>
            <td>{role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;