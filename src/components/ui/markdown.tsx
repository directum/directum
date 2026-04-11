import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown = ({ content, className }: MarkdownProps) => {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-headings:text-foreground prose-p:text-muted-foreground",
        "prose-strong:text-foreground prose-em:text-muted-foreground",
        "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        "prose-li:text-muted-foreground",
        "[&_p]:whitespace-pre-wrap [&_p]:mb-0 [&_p]:leading-normal [&_br]:content-[''] [&_br]:block [&_br]:h-[1em]",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>{content}</ReactMarkdown>
    </div>
  );
};