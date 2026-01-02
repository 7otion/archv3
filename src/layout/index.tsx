import { useEffect, type ReactNode } from 'react';

import { useStore } from '@/lib/store';
import { ContentTypesStore } from '@/lib/store/content-types';

import { RouterTabs } from './router-tabs';
import { Header } from './header';
import { Dock } from './dock';

const Layout = ({ children }: { children: ReactNode }) => {
	const contentTypeStore = useStore(ContentTypesStore);

	useEffect(() => {
		contentTypeStore.fetch();
	}, [contentTypeStore]);
	return (
		<div className="h-screen w-screen overflow-hidden flex flex-col">
			<Header />
			<RouterTabs />
			<main className="clickable-content relative flex-1 flex flex-col rounded-lg bg-transparent overflow-auto">
				{children}
				<Dock />
			</main>
		</div>
	);
};

export default Layout;
