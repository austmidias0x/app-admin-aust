'use client';

import { useState, useEffect } from 'react';

interface SubUser {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'member';
  active: boolean;
  organizationId: string;
  permissions?: {
    canAccessTasks: boolean;
    canAccessDocuments: boolean;
    canAccessFinancial: boolean;
    canAccessSales: boolean;
    canAccessGoals: boolean;
    canAccessClients: boolean;
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canEditOwnTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
    canChangeTaskDates: boolean;
    canChangeTaskStatus: boolean;
    canCreateDocuments: boolean;
    canEditDocuments: boolean;
    canDeleteDocuments: boolean;
    canCreateTransactions: boolean;
    canEditTransactions: boolean;
    canDeleteTransactions: boolean;
    canViewReports: boolean;
    canManageSales: boolean;
    canManageFunnel: boolean;
    canManageUsers: boolean;
    canManageSpaces: boolean;
    canManageClients: boolean;
  };
}

interface SubUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  subUser?: SubUser;
}

export default function SubUserModal({ isOpen, onClose, onSuccess, organizationId, subUser }: SubUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as 'manager' | 'member',
    active: true,
    permissions: {
      canAccessTasks: false,
      canAccessDocuments: false,
      canAccessFinancial: false,
      canAccessSales: false,
      canAccessGoals: false,
      canAccessClients: false,
      canCreateTasks: false,
      canEditAllTasks: false,
      canEditOwnTasks: true,
      canDeleteTasks: false,
      canAssignTasks: false,
      canChangeTaskDates: false,
      canChangeTaskStatus: true,
      canCreateDocuments: false,
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
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subUser) {
      setFormData({
        name: subUser.name,
        email: subUser.email,
        password: '', // Não preencher senha na edição
        role: subUser.role,
        active: subUser.active,
        permissions: subUser.permissions || formData.permissions
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'member',
        active: true,
        permissions: {
          canAccessTasks: false,
          canAccessDocuments: false,
          canAccessFinancial: false,
          canAccessSales: false,
          canAccessGoals: false,
          canAccessClients: false,
          canCreateTasks: false,
          canEditAllTasks: false,
          canEditOwnTasks: true,
          canDeleteTasks: false,
          canAssignTasks: false,
          canChangeTaskDates: false,
          canChangeTaskStatus: true,
          canCreateDocuments: false,
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
        }
      });
    }
    setError('');
  }, [subUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = subUser 
        ? `/api/organizations/${organizationId}/sub-users/${subUser.id}`
        : `/api/organizations/${organizationId}/sub-users`;

      const method = subUser ? 'PUT' : 'POST';
      
      const body = subUser 
        ? {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            active: formData.active,
            permissions: formData.permissions
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            permissions: formData.permissions
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Erro ao salvar sub-usuário');
      }
    } catch (error) {
      setError('Erro ao salvar sub-usuário');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleRoleChange = (role: 'manager' | 'member') => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: {
        ...prev.permissions,
        // Aplicar permissões padrão baseadas no role
        canAccessTasks: role === 'manager',
        canAccessDocuments: role === 'manager',
        canAccessFinancial: role === 'manager',
        canAccessSales: role === 'manager',
        canAccessGoals: role === 'manager',
        canAccessClients: role === 'manager',
        canCreateTasks: role === 'manager',
        canEditAllTasks: role === 'manager',
        canDeleteTasks: role === 'manager',
        canAssignTasks: role === 'manager',
        canChangeTaskDates: role === 'manager',
        canCreateDocuments: role === 'manager',
        canEditDocuments: role === 'manager',
        canDeleteDocuments: role === 'manager',
        canCreateTransactions: role === 'manager',
        canEditTransactions: role === 'manager',
        canDeleteTransactions: role === 'manager',
        canViewReports: role === 'manager',
        canManageSales: role === 'manager',
        canManageFunnel: role === 'manager',
        canManageSpaces: role === 'manager',
        canManageClients: role === 'manager',
        // Sempre manter estas permissões
        canEditOwnTasks: true,
        canChangeTaskStatus: true,
        canManageUsers: false // Sub-usuários nunca podem gerenciar outros usuários
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {subUser ? 'Editar Sub-usuário' : 'Novo Sub-usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              {!subUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as 'manager' | 'member')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="member">Membro</option>
                  <option value="manager">Gerente</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Usuário ativo
                </label>
              </div>
            </div>

            {/* Permissões */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Permissões</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Acesso a Módulos</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'canAccessTasks', label: 'Tarefas' },
                      { key: 'canAccessDocuments', label: 'Documentos' },
                      { key: 'canAccessFinancial', label: 'Financeiro' },
                      { key: 'canAccessSales', label: 'Vendas' },
                      { key: 'canAccessGoals', label: 'Metas' },
                      { key: 'canAccessClients', label: 'Clientes' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Permissões de Tarefas</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'canCreateTasks', label: 'Criar tarefas' },
                      { key: 'canEditAllTasks', label: 'Editar todas as tarefas' },
                      { key: 'canEditOwnTasks', label: 'Editar próprias tarefas' },
                      { key: 'canDeleteTasks', label: 'Excluir tarefas' },
                      { key: 'canAssignTasks', label: 'Atribuir tarefas' },
                      { key: 'canChangeTaskDates', label: 'Alterar datas' },
                      { key: 'canChangeTaskStatus', label: 'Alterar status' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Permissões de Documentos</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'canCreateDocuments', label: 'Criar documentos' },
                      { key: 'canEditDocuments', label: 'Editar documentos' },
                      { key: 'canDeleteDocuments', label: 'Excluir documentos' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Permissões Financeiras</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'canCreateTransactions', label: 'Criar transações' },
                      { key: 'canEditTransactions', label: 'Editar transações' },
                      { key: 'canDeleteTransactions', label: 'Excluir transações' },
                      { key: 'canViewReports', label: 'Ver relatórios' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Permissões de Vendas</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'canManageSales', label: 'Gerenciar vendas' },
                      { key: 'canManageFunnel', label: 'Gerenciar funil' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Permissões de Gerenciamento</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'canManageSpaces', label: 'Gerenciar espaços' },
                      { key: 'canManageClients', label: 'Gerenciar clientes' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : (subUser ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
