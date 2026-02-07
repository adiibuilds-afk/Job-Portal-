import { FileText, Clock } from 'lucide-react';
import SettingCard from './SettingCard';

interface FeatureTogglesProps {
    settings: any;
    toggleSetting: (key: string) => void;
}

export default function FeatureToggles({ settings, toggleSetting }: FeatureTogglesProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingCard
                title="AI Resume Scorer"
                description="Allow users to submit resumes for analysis."
                icon={FileText}
                isActive={settings.resume_scorer_enabled}
                onToggle={() => toggleSetting('resume_scorer_enabled')}
                activeColor="green"
            />

            <SettingCard
                title="Resume Queue"
                description="Pause or resume AI resume processing."
                icon={Clock}
                isActive={!settings.queue_paused}
                onToggle={() => toggleSetting('queue_paused')}
                activeColor="blue"
                activeLabel="RUNNING"
                inactiveLabel="PAUSED"
            />
        </div>
    );
}
