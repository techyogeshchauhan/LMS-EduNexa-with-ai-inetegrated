import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string) => {
    // Replace headers
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold text-gray-800 mt-3 mb-2">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-gray-900 mt-4 mb-2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-gray-900 mt-4 mb-3">$1</h1>');
    
    // Replace bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // Replace italic text
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Replace bullet points
    text = text.replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>');
    
    // Replace numbered lists
    text = text.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 mb-1">$1. $2</li>');
    
    // Replace line breaks
    text = text.replace(/\n/g, '<br />');
    
    // Wrap consecutive list items in ul tags
    text = text.replace(/(<li.*?<\/li>(?:<br \/>)*)+/g, '<ul class="mb-2">$&</ul>');
    
    // Clean up extra br tags
    text = text.replace(/<br \/><br \/>/g, '<br />');
    
    return text;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};