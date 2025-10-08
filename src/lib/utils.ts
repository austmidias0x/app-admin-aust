import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRoleName(role: string): string {
  const roles: Record<string, string> = {
    admin: 'Admin',
    manager: 'Gerente',
    member: 'Membro',
  };
  return roles[role] || role;
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-blue-100 text-blue-800',
    manager: 'bg-green-100 text-green-800',
    member: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

