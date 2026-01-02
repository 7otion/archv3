import { useMemo } from 'react';
import { DownloadIcon, HomeIcon } from 'lucide-react';

import { FloatingDock } from '@/components/floating-dock';

import { useStore, useObservable } from '@/lib/store';
import { ContentTypesStore } from '@/lib/store/content-types';

export function Dock() {
	const contentTypesStore = useStore(ContentTypesStore);
	const contentTypes = useObservable(contentTypesStore.items);
	const dockedContentTypes = contentTypes.filter(ct => ct.docked === 1);

	const links = useMemo(() => {
		const homeLink = {
			title: 'Home',
			icon: <HomeIcon className="text-neutral-300" />,
			href: '/',
		};

		const dockedLinks = dockedContentTypes.map(ct => ({
			title: ct.name,
			icon: ct.icon ? (
				<div
					className="size-4 text-neutral-300"
					dangerouslySetInnerHTML={{ __html: ct.icon }}
				/>
			) : (
				<HomeIcon className="text-neutral-300" />
			),
			href: '/content-types/' + ct.slug,
		}));

		const downloaderLink = {
			title: 'Downloader',
			icon: <DownloadIcon className="text-neutral-300" />,
			href: '/video-downloader',
		};

		return [homeLink, ...dockedLinks, downloaderLink];
	}, [dockedContentTypes]);

	return (
		<div className="fixed inset-x-0 bottom-6 z-10 flex items-center justify-center">
			<div className="app-drag-region h-[3.3rem] max-w-100 gap-2 bg-transparent px-4 py-1">
				<FloatingDock scaleFactor={0.8} dockScale={0.8} items={links} />
			</div>
		</div>
	);
}
