'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserModal from '@/components/UserModal';
import { formatDate, getRoleName, getRoleBadgeColor } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  organizationId: string | null;
  createdAt: string;
  tasks_count?: number;
  [key: string]: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (!response.ok) {
        // Limpa o cookie inválido fazendo logout
        await fetch('/api/auth/logout', { method: 'POST' });
        // Força reload completo para limpar qualquer estado
        window.location.href = '/login';
        return;
      }

      setCurrentUser(data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      // Limpa o cookie e força reload
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
  };


  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!confirm(`Tem certeza que deseja ${user.active ? 'desativar' : 'ativar'} ${user.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });

      if (response.ok) {
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('Error toggling user:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Tem certeza que deseja DESATIVAR ${user.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao desativar usuário');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao desativar usuário');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedUser(undefined);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleModalSuccess = () => {
    loadUsers();
  };

  // Filtros
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.active) ||
                         (statusFilter === 'inactive' && !user.active);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    // Contar sub-usuários totais (members de todas as contas)
    totalMembers: users.reduce((acc, u) => acc + (u._count?.members || 0), 0),
    // Contar tarefas totais
    totalTasks: users.reduce((acc, u) => acc + (u._count?.tasks || 0), 0),
    // Contar espaços totais
    totalSpaces: users.reduce((acc, u) => acc + (u._count?.spaces || 0), 0),
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Gestão de Contas Mães
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  <span className="font-semibold text-gray-900">{currentUser.name}</span>
                  <span className="mx-1.5 text-gray-400">•</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                    Super Admin
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-5 hover:shadow-xl transition-all hover:scale-105">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Contas Mães</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200/50 p-5 hover:shadow-xl transition-all hover:scale-105">
            <div className="text-xs font-semibold text-green-700 uppercase mb-2">Ativas</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg border border-red-200/50 p-5 hover:shadow-xl transition-all hover:scale-105">
            <div className="text-xs font-semibold text-red-700 uppercase mb-2">Inativas</div>
            <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200/50 p-5 hover:shadow-xl transition-all hover:scale-105">
            <div className="text-xs font-semibold text-blue-700 uppercase mb-2">Sub-usuários</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalMembers}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-lg border border-purple-200/50 p-5 hover:shadow-xl transition-all hover:scale-105">
            <div className="text-xs font-semibold text-purple-700 uppercase mb-2">Espaços</div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalSpaces}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg border border-amber-200/50 p-5 hover:shadow-xl transition-all hover:scale-105">
            <div className="text-xs font-semibold text-amber-700 uppercase mb-2">Tarefas</div>
            <div className="text-3xl font-bold text-amber-600">{stats.totalTasks}</div>
          </div>
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium cursor-pointer"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Conta Mãe
            </button>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-indigo-600">
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg font-semibold">Carregando...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700">
                  {users.length === 0 ? 'Nenhum usuário encontrado' : 'Nenhum usuário corresponde aos filtros'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub-usuários
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user._count?.members || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {user.id !== currentUser.id && (
                            <>
                              <button
                                onClick={() => handleToggleActive(user)}
                                className={user.active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                                title={user.active ? 'Pausar' : 'Ativar'}
                              >
                                {user.active ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-900"
                                title="Desativar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
        user={selectedUser}
        // organizationId removido - este app só cria contas mães (admins independentes)
      />
    </div>
  );
}

