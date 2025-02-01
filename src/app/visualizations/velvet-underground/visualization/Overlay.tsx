import React from 'react';

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
      <span style={{ fontSize: '2.5em', lineHeight: '2.5em' }}>⏴</span>
      <span>Click slowly and see</span>
    </div>
  )
}
