interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  subtitle?: string;
}

export function DashboardCard({ title, value, icon, variant = 'default', subtitle }: DashboardCardProps) {
  const variants = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
  };

  const textVariants = {
    default: 'text-gray-900',
    primary: 'text-blue-900',
    success: 'text-green-900',
    warning: 'text-yellow-900',
    danger: 'text-red-900',
  };

  return (
    <div className={`border rounded-lg p-6 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textVariants[variant]}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <span className="text-4xl opacity-50">{icon}</span>
        )}
      </div>
    </div>
  );
}
