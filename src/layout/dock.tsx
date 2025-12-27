import { useMemo } from 'react';
import { DownloadIcon, HomeIcon } from 'lucide-react';

import { FloatingDock } from '@/components/floating-dock';

export function Dock() {
	const links = useMemo(() => {
		const homeLink = {
			title: 'Home',
			icon: <HomeIcon className="text-neutral-300" />,
			href: '/',
		};

		const downloaderLink = {
			title: 'Downloader',
			icon: <DownloadIcon className="text-neutral-300" />,
			href: '/video-downloader',
		};

		return [homeLink, downloaderLink];
	}, []);

	return (
		<div className="fixed inset-x-0 bottom-6 z-10 flex items-center justify-center">
			<div className="app-drag-region h-[3.3rem] max-w-100 gap-2 bg-transparent px-4 py-1">
				<FloatingDock scaleFactor={0.8} dockScale={0.8} items={links} />
			</div>
		</div>
	);
}
