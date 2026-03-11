import React from 'react';
import { Edit, Power, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from './UserAvatar';
import RoleBadge from './RoleBadge';
import StatusIndicator from './StatusIndicator';
import { formatRelativeDate } from '@/lib/format-utils';
import { useAuth } from '@/contexts/AuthContext';
import type { UserWithRole } from '@/types/user';

interface UsersTableProps {
  users: UserWithRole[];
  onEdit: (user: UserWithRole) => void;
  onToggleStatus: (user: UserWithRole) => void;
  onDelete: (user: UserWithRole) => void;
  loading?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEdit,
  onToggleStatus,
  onDelete,
  loading,
}) => {
  const { user: currentUser } = useAuth();

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          Carregando usuários...
        </div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Permissão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Acesso</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isCurrentUser = user.id === currentUser?.id;
            
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <UserAvatar
                    fullName={user.full_name}
                    avatarUrl={user.avatar_url}
                    size="md"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {user.full_name || 'Sem nome'}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <StatusIndicator isActive={user.is_active} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.last_login ? formatRelativeDate(user.last_login) : 'Nunca'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {!isCurrentUser && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(user)}
                            className={user.is_active ? 'text-destructive' : 'text-green-600'}
                          >
                            <Power className="w-4 h-4 mr-2" />
                            {user.is_active ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
