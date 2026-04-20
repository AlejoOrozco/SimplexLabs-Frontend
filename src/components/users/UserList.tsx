'use client';

import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import type { User } from '@/lib/types';
import { formatDate, fullName, roleLabel } from '@/lib/utils/format';

interface UserListProps {
  users: readonly User[];
  onRowClick?: (user: User) => void;
}

export function UserList({ users, onRowClick }: UserListProps): JSX.Element {
  const columns: readonly DataTableColumn<User>[] = [
    { id: 'name', header: 'Name', cell: (row) => <span className="font-medium">{fullName(row)}</span> },
    { id: 'email', header: 'Email', cell: (row) => row.email },
    { id: 'role', header: 'Role', cell: (row) => roleLabel(row.role) },
    {
      id: 'isActive',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { id: 'createdAt', header: 'Created', cell: (row) => formatDate(row.createdAt) },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No users"
    />
  );
}
