// components/ui/ErrorMessage.tsx
import React from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorMessageProps {
  title?: string;
  message: string;
}

export default function ErrorMessage({ title = "Error", message }: ErrorMessageProps) {
  return (
    <Alert className="w-full max-w-lg border-destructive/80 bg-destructive/5 text-destructive">
      <IconAlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}