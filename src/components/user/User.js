'use client';
import './user.css';

import { getInitials } from '@/utils/StringUtils';

import { useFont } from '@/contexts/FontContext';

const User = ({ user }) => {
  const { primaryFont } = useFont();

  if (!user) return null; // Return null if the user is not instantiated yet

  const { userId, name, email } = user;
  const initials = getInitials(name);

  return (
    <div className="user">
      <div className="initials-box" style={{ width: 64, height: 64 }}>
        <p
          className="initials-text"
          style={{ fontFamily: primaryFont.style.fontFamily, fontSize: 24 }}
        >
          {initials}
        </p>
      </div>
      <div className="user-details">
        <div>
          <p className="label">Name: </p>
          <p>{name}</p>
        </div>
        <div>
          <p className="label">Email: </p>
          <p>{email}</p>
        </div>
        <div>
          <p className="label">User ID: </p>
          <p>{userId}</p>
        </div>
      </div>
    </div>
  );
};

export default User;
