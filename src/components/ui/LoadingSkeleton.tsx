

interface LoadingSkeletonProps {
    variant?: 'page' | 'panel' | 'inline';
    className?: string;
}

export function LoadingSkeleton({ variant = 'page', className = '' }: LoadingSkeletonProps) {
    if (variant === 'inline') {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
        );
    }

    if (variant === 'panel') {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    // Full page skeleton
    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 ${className}`}>
            <div className="max-w-4xl w-full space-y-6">
                <div className="animate-pulse space-y-4">
                    {/* Header skeleton */}
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>

                    {/* Content skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingSkeleton;
