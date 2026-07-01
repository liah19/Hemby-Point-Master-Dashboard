'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Trash2, ArrowLeft, Upload } from 'lucide-react';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isAdmin = session?.user?.email?.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hembypointadvisory@gmail.com').toLowerCase();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong loading users.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`Delete ${name}'s account permanently? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message || 'Could not delete this user.');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sage border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-gold" />
            <h1 className="text-2xl font-serif text-navy">Sanctuary Members</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/import')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold-bg/15 hover:bg-gold-bg/25 border border-gold/30 text-navy rounded-full text-xs font-mono uppercase tracking-wider cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Intake
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 px-3 py-2 text-navy/70 hover:text-navy rounded-full text-xs font-mono uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-bg/15 border border-rose/30 rounded-xl text-rose text-sm">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-16 text-navy/50 font-serif italic">
            No members yet. Send out your intake form!
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white border border-border-soft rounded-2xl p-5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-navy">{u.name || 'Unnamed'}</span>
                    <span className="text-xs text-navy/40 font-mono">{u.email}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(u.selected_areas || []).map((area: string) => (
                      <span
                        key={area}
                        className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-sage-bg/15 text-sage rounded-full font-mono"
                      >
                        {area}
                      </span>
                    ))}
                    {(!u.selected_areas || u.selected_areas.length === 0) && (
                      <span className="text-[10px] text-navy/30 italic">No life areas selected yet</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-navy/40">
                    Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    {u.briefing_opt_in && ` · Morning texts at ${u.briefing_time || '07:00'}`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(u.id, u.name || u.email)}
                  disabled={deletingId === u.id}
                  className="p-2.5 hover:bg-rose-bg/15 text-navy/40 hover:text-rose rounded-full transition-colors cursor-pointer disabled:opacity-40"
                  title="Delete account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
