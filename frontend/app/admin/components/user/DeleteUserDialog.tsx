'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User } from '@/client/adminuser';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => void;
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus User</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus user <strong>{user.fullName}</strong> ({user.email})?
            {user.isDoctor && (
              <p className="mt-2 text-amber-600">
                ⚠️ User ini adalah dokter. Menghapusnya juga akan mempengaruhi data dokter terkait.
              </p>
            )}
            {user.stats.consultations > 0 && (
              <p className="mt-2 text-amber-600">
                ⚠️ User ini memiliki {user.stats.consultations} konsultasi. 
                Data akan di-soft delete untuk menjaga integritas data.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}