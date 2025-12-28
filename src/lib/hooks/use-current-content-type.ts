import { useContentTypesStore } from '@/lib/store/content-types';
import { useRoute } from 'wouter';

export const useCurrentContentType = () => {
	const contentTypes = useContentTypesStore(state => state.items);
	const [, params] = useRoute('/content-types/:contentType');
	const currentContentType = params?.contentType
		? contentTypes.find(ct => ct.slug === params.contentType)
		: undefined;
	return currentContentType;
};
