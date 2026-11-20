import React from 'react';
import { Zap, Clock } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext.tsx';

interface DeliveryEstimateBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export const DeliveryEstimateBadge: React.FC<DeliveryEstimateBadgeProps> = ({
  className = '',
  showDetails = false
}) => {
  const { currentArea } = useLocationContext();
  const minutes = currentArea?.estimatedMinutes || 30;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm ${className}`}>
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
      </span>
      <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
      <span>{minutes} MINS DELIVERY</span>
      {showDetails && (
        <span className="hidden sm:inline-block text-emerald-700 font-normal border-l border-emerald-300 pl-1.5 text-[11px] capitalize">
          to {currentArea?.areaName || 'Kothagudem'}
        </span>
      )}
    </div>
  );
};
