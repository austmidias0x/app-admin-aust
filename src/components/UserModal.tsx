'use client';

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
  organizationId?: string;
}

export default function UserModal({ isOpen, onClose, onSuccess, user, organizationId }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as UserRole,
    active: true,
    permissions: {
      canAccessTasks: true,
      canAccessDocuments: true,
      canAccessFinancial: false,
      canAccessSales: false,
      canAccessGoals: false,
      canAccessClients: false,
      canCreateTasks: true,
      canEditAllTasks: false,
      canEditOwnTasks: true,
      canDeleteTasks: false,
      canAssignTasks: false,
      canChangeTaskDates: true,
      canChangeTaskStatus: true,
      canCreateDocuments: true,
      canEditDocuments: false,
      canDeleteDocuments: false,
      canCreateTransactions: false,
      canEditTransactions: false,
      canDeleteTransactions: false,
      canViewReports: false,
      canManageSales: false,
      canManageFunnel: false,
      canManageUsers: false,
      canManageSpaces: false,
      canManageClients: false,
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'member',
        active: user.active ?? true,
        permissions: {
          canAccessTasks: user.canAccessTasks ?? true,
          canAccessDocuments: user.canAccessDocuments ?? true,
          canAccessFinancial: user.canAccessFinancial ?? false,
          canAccessSales: user.canAccessSales ?? false,
          canAccessGoals: user.canAccessGoals ?? false,
          canAccessClients: user.canAccessClients ?? false,
          canCreateTasks: user.canCreateTasks ?? true,
          canEditAllTasks: user.canEditAllTasks ?? false,
          canEditOwnTasks: user.canEditOwnTasks ?? true,
          canDeleteTasks: user.canDeleteTasks ?? false,
          canAssignTasks: user.canAssignTasks ?? false,
          canChangeTaskDates: user.canChangeTaskDates ?? true,
          canChangeTaskStatus: user.canChangeTaskStatus ?? true,
          canCreateDocuments: user.canCreateDocuments ?? true,
          canEditDocuments: user.canEditDocuments ?? false,
          canDeleteDocuments: user.canDeleteDocuments ?? false,
          canCreateTransactions: user.canCreateTransactions ?? false,
          canEditTransactions: user.canEditTransactions ?? false,
          canDeleteTransactions: user.canDeleteTransactions ?? false,
          canViewReports: user.canViewReports ?? false,
          canManageSales: user.canManageSales ?? false,
          canManageFunnel: user.canManageFunnel ?? false,
          canManageUsers: user.canManageUsers ?? false,
          canManageSpaces: user.canManageSpaces ?? false,
          canManageClients: user.canManageClients ?? false,
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users';
      const method = user ? 'PUT' : 'POST';
      
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
      };

      if (user) {
        payload.active = formData.active;
        if (formData.password) {
          payload.password = formData.password;
        }
      } else {
        payload.password = formData.password || 'Senha@123';
        if (organizationId) {
          payload.organizationId = organizationId;
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar usuário');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!user}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="joao@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha {user && '(deixe em branco para não alterar)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={user ? '••••••••' : 'Mínimo 6 caracteres'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="member">Membro</option>
                <option value="manager">Gerente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {user && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                Usuário ativo
              </label>
            </div>
          )}

          {/* Permissões */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissões de Acesso</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Módulos</h4>
                {['Tasks', 'Documents', 'Financial', 'Sales', 'Goals', 'Clients'].map((module) => (
                  <label key={module} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions[`canAccess${module}` as keyof typeof formData.permissions] as boolean}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [`canAccess${module}`]: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{module}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Tarefas</h4>
                {[
                  { key: 'canCreateTasks', label: 'Criar' },
                  { key: 'canEditAllTasks', label: 'Editar Todas' },
                  { key: 'canEditOwnTasks', label: 'Editar Próprias' },
                  { key: 'canDeleteTasks', label: 'Deletar' },
                  { key: 'canAssignTasks', label: 'Atribuir' },
                ].map((perm) => (
                  <label key={perm.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions[perm.key as keyof typeof formData.permissions] as boolean}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [perm.key]: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 text-sm">Gerenciamento</h4>
                {[
                  { key: 'canManageUsers', label: 'Gerenciar Usuários' },
                  { key: 'canManageSpaces', label: 'Gerenciar Espaços' },
                  { key: 'canManageClients', label: 'Gerenciar Clientes' },
                  { key: 'canManageSales', label: 'Gerenciar Vendas' },
                  { key: 'canViewReports', label: 'Ver Relatórios' },
                ].map((perm) => (
                  <label key={perm.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions[perm.key as keyof typeof formData.permissions] as boolean}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [perm.key]: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (user ? 'Atualizar' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

