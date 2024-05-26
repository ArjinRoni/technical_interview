import React from 'react';

export default function Page({ params }) {
  const { id } = params;

  return (
    <div>
      <p>Chat Page</p>
      <p>Chat ID: {id}</p>
    </div>
  );
}
