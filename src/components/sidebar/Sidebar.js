'use client';
import './sidebar.css';

import Button from '../button/Button';

import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const SidebarButton = ({ src, text, onClick }) => {
    return (
      <div className="sidebar-button" onClick={onClick}>
        <img className="sidebar-button-img" src={src} />
        <p className="sidebar-button-text">{text}</p>
      </div>
    );
  };

  return (
    <div className="sidebar">
      <Button
        borderRadius={8}
        fontSize={16}
        width="80%"
        alignSelf="center"
        type="button"
        text="New ad"
        emoji="rocket"
      />
      <div className="sidebar-chats"></div>
      <div className="sidebar-buttons">
        <SidebarButton src="./settings.png" text="Settings" />
        <SidebarButton src="./user.png" text="My account" />
        <SidebarButton src="./email-plus.png" text="Send feedback" />
        <SidebarButton src="./log-out.png" text="Log out" onClick={async () => await logout()} />
      </div>
    </div>
  );
};

export default Sidebar;