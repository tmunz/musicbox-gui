import './SidebarControlButton.css';
import React, { ButtonHTMLAttributes } from "react";

interface SideBarControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const SidebarControlButton = ({ active, ...props }: SideBarControlButtonProps) => {
  return (
    <button {...props} className={`sidebar-control-button ${active ? 'active' : ''} ${props.className ? props.className : ''}`}>
      {props.children}
    </button>
  );
}