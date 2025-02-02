import './IconButton.css';
import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

interface IconButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> { }

export const IconButton = (props: IconButtonProps) => {
  return (
    <button {...props} className={`icon-button ${props.className ?? ''}`} />
  );
}