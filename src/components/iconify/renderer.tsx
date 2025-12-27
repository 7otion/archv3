import { cn } from '@/lib/utils';

function IconRenderer({
	iconSvg,
	className,
}: {
	iconSvg?: string;
	className?: string;
}) {
	if (!iconSvg) {
		return null;
	}

	return (
		<div
			className={cn('size-4', className)}
			dangerouslySetInnerHTML={{ __html: iconSvg }}
		/>
	);
}

export { IconRenderer };
