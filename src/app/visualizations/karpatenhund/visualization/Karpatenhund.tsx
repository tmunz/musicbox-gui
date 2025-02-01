import React from "react";

export const Karpatenhund = () => {
  return (
    <div style={{ background: '#fda600', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <img src={require('./karpatenhund.png')} alt="Karpatenhund" style={{ width: '80%', height: '80%', objectFit: 'scale-down' }} />
    </div>
  );
}
