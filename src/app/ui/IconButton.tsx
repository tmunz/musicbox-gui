import './IconButton.css';
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

type IconButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const IconButton = (props: IconButtonProps) => {
  return <button {...props} className={`icon-button ${props.className ?? ''}`} />;
};
