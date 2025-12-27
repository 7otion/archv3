import { useState, useEffect } from 'react';

import { getIconSVG } from '@/lib/services/iconify';
import { cn } from '@/lib/utils';

function IconPreview({
	iconSet,
	iconName,
	className,
}: {
	iconSet: string;
	iconName: string;
	className?: string;
}) {
	const [svg, setSvg] = useState<string>('');

	useEffect(() => {
		let mounted = true;
		getIconSVG(iconSet, iconName).then(svgString => {
			if (mounted && svgString) setSvg(svgString);
		});
		return () => {
			mounted = false;
		};
	}, [iconSet, iconName]);

	if (!svg) {
		return null;
	}

	return (
		<div
			className={cn('size-5', className)}
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
}

export { IconPreview };
