import React from 'react';
import { useParams } from 'react-router-dom';

const ManageJobPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;

  console.log("New ManageJobPage - useParams() object:", params);
  console.log("New ManageJobPage - Extracted ID:", id);

  return (
    <div>
      <h1>New Manage Job Page</h1>
      <p>Parameters from URL: {JSON.stringify(params)}</p>
      <p>Extracted Job ID: {id || "N/A"}</p>
    </div>
  );
};

export default ManageJobPage;
