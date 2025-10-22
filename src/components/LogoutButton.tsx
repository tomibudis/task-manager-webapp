'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/signin' });
  };

  return (
    <Button onClick={handleLogout} variant="destructive">
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
