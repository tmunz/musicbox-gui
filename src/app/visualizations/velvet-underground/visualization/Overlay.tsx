import React from 'react';
import { PiCaretLeftFill } from 'react-icons/pi';

export function Overlay() {
  return (
    <div style={{
      fontFamily: '"Berthold Akzidenz Grotesk BE", sans-serif',
      fontWeight: 500,
      textTransform: 'uppercase',
      color: 'black',
      fontSize: 10,
      verticalAlign: 'middle',
      textAlign: 'left',
      transform: 'translate(40px, -50%)',
      position: 'absolute',
      top: '25%',
      left: '54%',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center'
    }}>
      <PiCaretLeftFill size={14}/>
      <span>Click slowly and see</span>
    </div>
  )
}
