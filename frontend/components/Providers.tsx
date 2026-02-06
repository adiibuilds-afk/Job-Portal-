"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from 'react-hot-toast';
import MaintenanceGuard from "./MaintenanceGuard";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <MaintenanceGuard>
                {children}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        style: {
                            background: '#18181b', // zinc-900
                            color: '#fff',
                            border: '1px solid #27272a', // zinc-800
                        },
                    }}
                />
            </MaintenanceGuard>
        </SessionProvider>
    );
}
