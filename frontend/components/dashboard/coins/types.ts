import { LucideIcon } from 'lucide-react';

export interface Transaction {
    _id: string;
    amount: number;
    reason: string;
    description: string;
    createdAt: string;
}

export interface LeaderboardUser {
    _id: string;
    name: string;
    email: string;
    referralCount: number;
    tier: string;
    badges: string[];
}

export interface CoinsData {
    balance: number;
    referralCode: string;
    referralCount: number;
    loginStreak: number;
    transactions: Transaction[];
    tier: string;
    badges: string[];
    profileRewardsClaimed: string[];
    skills: string[];
    portfolioUrl: string;
}

export interface StorePerk {
    id: string;
    name: string;
    cost: number;
    icon: LucideIcon;
    desc: string;
    inDevelopment?: boolean;
}

export interface EarnMethod {
    action: string;
    amount: string;
    icon: LucideIcon;
}
