// src/app/inventory/layout.tsx
import React from 'react';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '20px' }}>
      {children}
    </div>
  );
}
