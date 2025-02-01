import React, { Suspense } from "react";
import { Bananas } from "./Bananas";
import { Overlay } from "./Overlay";

export const VelvetUnderground = () => {
  return (
    <div style={{ background: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Suspense fallback={null}>
        <Bananas />
      </Suspense>
      <Overlay />
    </div>
  );
}
