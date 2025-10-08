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
    role: 'admin' as UserRole,  // Sempre admin (conta mãe)
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
      
      // Contas mães não precisam de permissões customizadas
      // O backend criará com permissões padrão (que serão ignoradas para admins)
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (user) {
        payload.active = formData.active;
        if (formData.password) {
          payload.password = formData.password;
        }
      } else {
        // App de gestão: sempre criar contas mães (admin independente)
        // Não enviar organizationId - será forçado como null no backend
        payload.password = formData.password || 'Senha@123';
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user ? 'Editar Conta Mãe' : 'Nova Conta Mãe'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {user ? 'Atualize as informações da conta' : 'Crie uma nova conta que poderá acessar o app principal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center transition-all hover:scale-110 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Dados Básicos */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!user}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder-gray-400"
                  placeholder="joao@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha {user && <span className="text-gray-500 font-normal">(deixe em branco para não alterar)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!user}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
                  placeholder={user ? '••••••••' : 'Mínimo 6 caracteres'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <div className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-indigo-900">Conta Mãe (Admin)</div>
                    <div className="text-xs text-indigo-600">Esta conta poderá criar sub-usuários no app principal</div>
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500 transition-all"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    Usuário ativo
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Nota sobre Permissões */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  🎯 Acesso Total Automático
                </h3>
                <p className="text-sm text-green-800 leading-relaxed mb-3">
                  Contas mães têm <strong>acesso completo e ilimitado</strong> a todos os módulos e funcionalidades do app principal automaticamente.
                </p>
                <ul className="text-sm text-green-700 space-y-1.5 ml-1">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Gerenciamento completo de sub-usuários
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Acesso a todos os módulos (Tarefas, Documentos, Financeiro, Vendas, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Permissões completas sem restrições
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all hover:scale-105"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              user ? 'Atualizar Conta' : 'Criar Conta Mãe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
