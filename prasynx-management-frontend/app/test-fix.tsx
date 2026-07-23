'use client';
import { useState } from 'react';

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick}>{label}</button>;
}

function ModulePage({ title, desc, actions, children }: { title: string; desc?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return <div><h1>{title}</h1>{actions}{children}</div>;
}

export default function TestPage() {
  const headers = [{ key: 'id', label: 'ID' }];
  return (
    <ModulePage title="Staff Management" desc="test" actions={<div><button>Test</button></div>}>
      <div>Content</div>
    </ModulePage>
  );
}
