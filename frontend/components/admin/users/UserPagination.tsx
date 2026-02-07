import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserPaginationProps {
    page: number;
    totalPages: number;
    setPage: (val: number) => void;
}

export default function UserPagination({ page, totalPages, setPage }: UserPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="p-6 bg-zinc-900/50 flex items-center justify-between border-t border-zinc-800 rounded-b-[2.5rem]">
            <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
                <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                Page {page} of {totalPages}
            </span>
            <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
                Next <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
