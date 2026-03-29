'use client';

import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

interface UserRoleSelectorProps {
  userId: string;
  currentRole: string;
}

export default function UserRoleSelector({ userId, currentRole }: UserRoleSelectorProps) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: string) => {
    if (newRole === role) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setRole(newRole);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Nepodařilo se změnit roli.');
      }
    } catch (err) {
      alert('Došlo k chybě při komunikaci se serverem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form.Select
      size="sm"
      value={role}
      onChange={(e) => handleRoleChange(e.target.value)}
      disabled={loading}
      className="d-inline-block w-auto"
      style={{ minWidth: '120px' }}
    >
      <option value="USER">USER</option>
      <option value="EDITOR">EDITOR</option>
      <option value="ADMIN">ADMIN</option>
    </Form.Select>
  );
}
