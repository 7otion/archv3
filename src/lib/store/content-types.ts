import { getRepository } from '@7otion/orm';

import { ContentType } from '@/lib/models/content-type';
import { Content } from '@/lib/models/content';

import { createResourceStore, type ResourceState } from './resource';

export const extractContentTypeFromPath = (): ContentType | undefined => {
	const pathName = window.location.pathname;
	if (pathName.startsWith('/content-types/')) {
		const params = pathName.split('/');
		const contentTypeSlug = params[2];
		const contentTypes = useContentTypesStore.getState().items;
		const currentContentType = contentTypeSlug
			? contentTypes.find(ct => ct.slug === contentTypeSlug)
			: undefined;
		return currentContentType;
	}
};

interface ContentTypesState extends ResourceState<ContentType> {
	contentTypeCounts: Record<number, number>;
	isDraggable: boolean;

	fetchContentTypeCounts: () => Promise<Record<number, number>>;
	updateOrder: (contentTypes: ContentType[]) => Promise<void>;
	setDraggable: (draggable: boolean) => void;
}

export const useContentTypesStore = createResourceStore<
	ContentType,
	ContentTypesState
>(
	{
		model: ContentType,
	},
	(set, get) => ({
		contentTypeCounts: {},
		isDraggable: false,

		async fetch() {
			const { items } = get();
			if (items.length > 0) return;

			set({ isLoading: true } as Partial<ContentTypesState>);
			try {
				const contentTypeRepo = getRepository(ContentType);
				const data = await contentTypeRepo
					.query()
					.orderBy('order', 'asc')
					.get();
				set({
					items: data,
					isLoading: false,
				} as Partial<ContentTypesState>);
			} catch (error) {
				set({ isLoading: false } as Partial<ContentTypesState>);
				throw error;
			}
		},

		async fetchContentTypeCounts() {
			const { items } = get();
			const contentRepo = getRepository(Content);
			const countsMap = await Promise.all(
				items.map(async contentType => {
					const count = await contentRepo
						.query()
						.selectRaw('COUNT(*) as count')
						.where('content_type_id', contentType.id)
						.first()
						.then(res => (res ? Number((res as any).count) : 0));
					return { id: contentType.id, count };
				}),
			);

			const newCounts = countsMap.reduce(
				(acc, { id, count }) => {
					acc[id] = count;
					return acc;
				},
				{} as Record<number, number>,
			);

			set({ contentTypeCounts: newCounts } as Partial<ContentTypesState>);
			return newCounts;
		},

		async updateOrder(contentTypesToUpdate) {
			await Promise.all(
				contentTypesToUpdate.map(ct => {
					ct.order = contentTypesToUpdate.indexOf(ct) + 1;
					return ct.save();
				}),
			);
			set({ items: contentTypesToUpdate } as Partial<ContentTypesState>);
		},

		setDraggable(draggable) {
			set({ isDraggable: draggable } as Partial<ContentTypesState>);
		},
	}),
);
