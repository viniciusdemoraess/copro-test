import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import UsersStats from '@/components/admin/usuarios/UsersStats';
import UsersFilters from '@/components/admin/usuarios/UsersFilters';
import UsersTable from '@/components/admin/usuarios/UsersTable';
import UserModal from '@/components/admin/usuarios/UserModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useUsersStats, useToggleUserStatus, useDeleteUser } from '@/hooks/useUsers';
import type { UserWithRole, UsersFilters as FiltersType } from '@/types/user';

const Usuarios: React.FC = () => {
  const { isAdmin, loading: authLoading, refreshRoles } = useAuth();
  const { data: users, isLoading } = useUsers();
  const stats = useUsersStats();
  const toggleStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();

  // Forçar refresh dos roles quando a página carregar
  React.useEffect(() => {
    refreshRoles();
  }, [refreshRoles]);

  // Debug: log users count and admin status
  React.useEffect(() => {
    console.log('=== Usuarios Page Debug ===');
    console.log('isAdmin from context:', isAdmin);
    console.log('authLoading:', authLoading);

    if (users) {
      console.log('Total users from query:', users.length);
      console.log('Users list:', users.map(u => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role })));
    }
  }, [users, isAdmin, authLoading]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserWithRole | null>(null);
  const [filters, setFilters] = useState<FiltersType>({
    search: '',
    role: 'all',
    status: 'all',
  });

  // Filter users based on filters
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = user.full_name?.toLowerCase().includes(searchLower);
        const emailMatch = user.email.toLowerCase().includes(searchLower);
        if (!nameMatch && !emailMatch) return false;
      }

      // Role filter
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status === 'active' && !user.is_active) return false;
      if (filters.status === 'inactive' && user.is_active) return false;

      return true;
    });
  }, [users, filters]);

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleToggleStatus = async (user: UserWithRole) => {
    await toggleStatus.mutateAsync({
      userId: user.id,
      isActive: !user.is_active,
    });
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    await deleteUser.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema administrativo
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddNew}>
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>
      </div>

      {/* Stats */}
      <UsersStats stats={stats} />

      {/* Filters */}
      <UsersFilters filters={filters} onChange={setFilters} />

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <UsersTable
        users={filteredUsers}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={(user) => setDeleteConfirm(user)}
        loading={isLoading}
      />

      {/* Modal */}
      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "{deleteConfirm?.full_name || deleteConfirm?.email}"?
              Esta ação não pode ser desfeita e todos os dados do usuário serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? 'Excluindo...' : 'Excluir Usuário'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Usuarios;
