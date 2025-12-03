import { RefreshCw } from 'lucide-react';

const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
    <div className="flex items-center justify-center p-8">
        <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{message}</p>
        </div>
    </div>
);

export default LoadingFallback;
