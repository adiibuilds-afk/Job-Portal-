import { Search, Users } from 'lucide-react';

interface UserHeaderProps {
    search: string;
    setSearch: (val: string) => void;
    setPage: (val: number) => void;
}

export default function UserHeader({ search, setSearch, setPage }: UserHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800">
            <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Users className="w-6 h-6 text-green-500" /> User Index
                </h2>
                <p className="text-zinc-500 text-sm font-medium mt-1">Manage platform participants and rewards.</p>
            </div>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-green-500/50 transition-all font-medium"
                />
            </div>
        </div>
    );
}
