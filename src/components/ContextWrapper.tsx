// components/ContextWrapper.tsx
'use client';

import React from 'react';
import { FileStatusProvider } from './context/FileStatusContext';

type ContextWrapperProps = {
  fileId: string;
  children: React.ReactNode;
};

const ContextWrapper: React.FC<ContextWrapperProps> = ({ fileId, children }) => {
  return (
    <FileStatusProvider fileId={fileId}>
      {children}
    </FileStatusProvider>
  );
};

export default ContextWrapper;
