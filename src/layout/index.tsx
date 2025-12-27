import { useEffect, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useRoute } from 'wouter';

import { useContentTypesStore } from '@/lib/store/content-types';

import { Header } from './header';
import { Dock } from './dock';

const Layout = ({ children }: { children: ReactNode }) => {
	const [, params] = useRoute('/content-types/:contentType');

	const [
		fetchContentTypes,
		contentTypes,
		selectedContentType,
		setSelectedContentType,
	] = useContentTypesStore(
		useShallow(state => [
			state.fetch,
			state.items,
			state.selectedItem,
			state.setSelected,
		]),
	);
	const currentContentType = params?.contentType
		? contentTypes.find(ct => ct.slug === params.contentType)
		: undefined;

	useEffect(() => {
		fetchContentTypes();
	}, [fetchContentTypes]);

	useEffect(() => {
		if (currentContentType && currentContentType !== selectedContentType) {
			setSelectedContentType(currentContentType);
		}
	}, [currentContentType, selectedContentType]);

	return (
		<div className="h-screen w-screen overflow-hidden flex flex-col">
			<Header />
			<main className="clickable-content relative flex-1 flex flex-col rounded-lg bg-transparent overflow-auto">
				{children}
				<Dock />
			</main>
		</div>
	);
};

export default Layout;
