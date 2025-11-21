import React from 'react';

const EditorLoader: React.FC = () => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 h-full animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-8 w-32 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    );
};

export default EditorLoader;
