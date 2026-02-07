import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface AdminLoginProps {
    apiUrl: string;
    onLoginSuccess: () => void;
}

export default function AdminLogin({ apiUrl, onLoginSuccess }: AdminLoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/api/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                sessionStorage.setItem('adminAuth', 'true');
                toast.success(data.message);
                onLoginSuccess();
            } else {
                toast.error(data.message || 'Invalid Credentials');
            }
        } catch (err) {
            toast.error('Login failed. Server error.');
            console.error(err);
        }
    };

    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                        <span className="text-3xl">👑</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">Admin Access</h1>
                    <p className="text-zinc-500">Enter secure credentials to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-medium"
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-medium"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                    >
                        Access Dashboard
                    </button>
                </form>
            </div>
        </main>
    );
}
