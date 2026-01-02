import type { ContentType } from '../models/content-type';
import { ContentTypesStore } from '../store/content-types';
import { useObservable, useStore } from '../store';

export function useCurrentContentType(): ContentType | undefined {
	const store = useStore(ContentTypesStore);
	const contentTypes = useObservable(store.items);

	const pathName =
		typeof window !== 'undefined' ? window.location.pathname : '';
	if (!pathName.startsWith('/content-types/')) return undefined;

	const [, , slug] = pathName.split('/');
	if (!slug) return undefined;

	return contentTypes.find(ct => ct.slug === slug);
}
