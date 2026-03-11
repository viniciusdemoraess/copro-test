import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import RoleSelector from './RoleSelector';
import PasswordInput from './PasswordInput';
import { useCreateUser, useUpdateProfile, useUpdateUserRole } from '@/hooks/useUsers';
import type { UserWithRole, UserFormData, UserRole } from '@/types/user';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithRole | null;
}

const UserModal: React.FC<UserModalProps> = ({ open, onOpenChange, user }) => {
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();
  const updateRole = useUpdateUserRole();

  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    role: 'editor',
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email,
        password: '',
        phone: user.phone || '',
        bio: user.bio || '',
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        bio: '',
        role: 'editor',
        is_active: true,
      });
    }
    setErrors({});
  }, [user, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!isEdit && formData.password && formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      if (isEdit && user) {
        // Update profile
        await updateProfile.mutateAsync({
          userId: user.id,
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            bio: formData.bio,
            is_active: formData.is_active,
          },
        });

        // Update role if changed
        if (formData.role !== user.role) {
          await updateRole.mutateAsync({
            userId: user.id,
            newRole: formData.role,
          });
        }
      } else {
        // Create new user
        await createUser.mutateAsync(formData);
      }

      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = createUser.isPending || updateProfile.isPending || updateRole.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="João Silva"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@exemplo.com"
                disabled={isEdit}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              )}
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <PasswordInput
                  value={formData.password || ''}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  error={errors.password}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(65) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Uma breve descrição..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissão *</Label>
              <RoleSelector
                value={formData.role}
                onChange={(role) => setFormData({ ...formData, role })}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="is_active">Status</Label>
                <p className="text-sm text-muted-foreground">
                  Usuários inativos não podem acessar o sistema
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
