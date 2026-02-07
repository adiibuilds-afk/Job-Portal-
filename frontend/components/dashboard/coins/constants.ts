import {
    Gift, Users, Flame, Share2, Award, Code, Globe, Medal, Crown, Star, Sparkles, Box, Mic
} from 'lucide-react';
import { StorePerk, EarnMethod, CoinsData } from './types';

export const STORE_PERKS: StorePerk[] = [
    { id: 'ai_scan', name: 'AI Resume Scan', cost: 10, icon: Sparkles, desc: 'Unlock 1 deep AI analysis of your resume.' },
    { id: 'mystery_box', name: 'Mystery Box', cost: 20, icon: Box, desc: 'Win between 5 to 50 coins instantly!' },
    { id: 'mock_interview', name: 'AI Mock Interview', cost: 50, icon: Mic, desc: 'Practice your skills with a realistic AI interviewer.', inDevelopment: true },
];

export const COIN_EARN_METHODS: EarnMethod[] = [
    { action: 'Signup with referral', amount: '+2.5', icon: Gift },
    { action: 'Refer a friend', amount: '+5.0', icon: Users },
    { action: '7-day login streak', amount: '+10', icon: Flame },
    { action: 'Share job (Social)', amount: '+2.0', icon: Share2 },
    { action: 'Complete Profile', amount: '+5.0', icon: Award },
];

export const PROFILE_REWARDS = [
    { id: 'skills', name: 'Add Skills', amount: 3, icon: Code, check: (data: CoinsData) => (data.skills || []).length > 0 },
    { id: 'portfolio', name: 'Add Portfolio', amount: 2, icon: Globe, check: (data: CoinsData) => !!data.portfolioUrl },
];

export const TIER_COLORS: Record<string, string> = {
    Bronze: 'text-orange-400',
    Silver: 'text-zinc-300',
    Gold: 'text-amber-400',
    Diamond: 'text-blue-400',
};

export const TIER_ICONS: Record<string, any> = {
    Bronze: Medal,
    Silver: Award,
    Gold: Crown,
    Diamond: Star,
};
