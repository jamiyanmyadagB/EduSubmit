import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
  glow?: boolean;
  interactive?: boolean;
}

export default function PremiumCard({
  children,
  className = '',
  variant = 'default',
  hover = true,
  glow = false,
  interactive = false,
}: PremiumCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200/50 dark:border-blue-800/50';
      case 'elevated':
        return 'bg-white dark:bg-gray-900 border-0 shadow-2xl';
      case 'default':
      default:
        return 'bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50';
    }
  };

  const getHoverClasses = () => {
    if (!hover) return '';
    return 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300';
  };

  const getGlowClasses = () => {
    if (!glow) return '';
    return 'shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25';
  };

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${getVariantClasses()} ${getHoverClasses()} ${getGlowClasses()} ${className}`}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent dark:via-white/10 pointer-events-none" />
      
      {/* Glow effect */}
      {glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-lg pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent via-white/10 to-transparent dark:via-white/20 rounded-bl-2xl" />
    </motion.div>
  );
}

// Premium stat card component
interface PremiumStatCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function PremiumStatCard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  variant = 'default',
}: PremiumStatCardProps) {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'default':
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case 'neutral':
      default:
        return null;
    }
  };

  return (
    <PremiumCard variant="glass" hover glow className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getVariantColors()}`}>
            {icon || <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          </div>
        </div>
        
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
      
      {/* Mini sparkline */}
      <div className="h-12 flex items-end space-x-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm opacity-60"
            style={{ height: `${Math.random() * 100}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          />
        ))}
      </div>
    </PremiumCard>
  );
}

// Premium feature card component
interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  status?: 'available' | 'coming-soon' | 'beta';
}

export function PremiumFeatureCard({
  title,
  description,
  icon,
  badge,
  action,
  status = 'available',
}: PremiumFeatureCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'coming-soon':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            Coming Soon
          </span>
        );
      case 'beta':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Beta</span>
          </span>
        );
      case 'available':
      default:
        return badge ? (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
            {badge}
          </span>
        ) : null;
    }
  };

  return (
    <PremiumCard variant="gradient" hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          </div>
        </div>
        
        {getStatusBadge()}
      </div>
      
      {action && status === 'available' && (
        <motion.button
          onClick={action.onClick}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{action.label}</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
      
      {status !== 'available' && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed">
          <Shield className="w-4 h-4" />
          <span>Unavailable</span>
        </div>
      )}
    </PremiumCard>
  );
}

// Premium dashboard panel component
interface PremiumDashboardPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PremiumDashboardPanel({
  title,
  subtitle,
  children,
  actions,
  className = '',
}: PremiumDashboardPanelProps) {
  return (
    <PremiumCard variant="elevated" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {children}
    </PremiumCard>
  );
}
