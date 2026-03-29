import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserRoleSelector from '@/components/ui/UserRoleSelector';

export default async function UsersManagementPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!currentUser || currentUser.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">Správa uživatelů</h1>
      </div>

      <div className="card-custom overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover table-custom mb-0">
            <thead>
              <tr>
                <th>Uživatel</th>
                <th>E-mail</th>
                <th>Role</th>
                <th className="text-end">Akce</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || ''}
                          width={32}
                          height={32}
                          className="rounded-circle"
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                          style={{ width: 32, height: 32, fontSize: '12px' }}
                        >
                          {user.name?.[0] || user.email?.[0] || '?'}
                        </div>
                      )}
                    </div>
                      <div>
                      <div className="fw-bold fs-5">
                        {user.name || 'Uživatel bez jména'} 
                        {user.id === session?.user?.id && (
                          <span className="badge bg-primary ms-2 animate-pulse">TO JSTE VY</span>
                        )}
                      </div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                        ID: {user.id}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark">{user.email || 'Email nenalezen'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.role === 'ADMIN' ? 'bg-danger' : 
                      user.role === 'EDITOR' ? 'bg-primary' : 'bg-secondary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-end">
                    <UserRoleSelector userId={user.id} currentRole={user.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
