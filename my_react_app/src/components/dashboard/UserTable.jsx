import React from 'react';
import './UserTable.css';

const users = [];

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