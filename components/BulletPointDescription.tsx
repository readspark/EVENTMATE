import React from 'react';

interface BulletPointDescriptionProps {
  description: string;
  className?: string;
}

export const BulletPointDescription: React.FC<BulletPointDescriptionProps> = ({ description, className }) => {
    // Split description into lines and filter out empty ones.
    const lines = description.split('\n').filter(line => line.trim() !== '');

    const renderLine = (line: string) => {
        // Remove any leading list markers like '-' or '*'
        const cleanLine = line.replace(/^\s*[-*]\s*/, '');
        // Split the line by our bold markdown syntax (**text**), keeping the delimiters
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                // If the part is bold, render it as a strong tag
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            // Otherwise, render it as plain text
            return part;
        });
    };

    return (
        <ul className={`list-disc list-inside space-y-1 ${className ?? ''}`}>
            {lines.map((line, i) => (
                <li key={i}>{renderLine(line)}</li>
            ))}
        </ul>
    );
};
