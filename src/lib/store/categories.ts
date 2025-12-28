import { Category } from '@/lib/models/category';

import { createResourceStore, type ResourceState } from './resource';
import { extractContentTypeFromPath } from './content-types';

type CategoriesState = ResourceState<Category>;

export const useCategoriesStore = createResourceStore<
	Category,
	CategoriesState
>(
	{
		model: Category,
		baseFilter: () => {
			const currentContentType = extractContentTypeFromPath();
			if (currentContentType) {
				return {
					content_type_id: currentContentType.id,
				};
			}
		},
	},
	(_set, _get) => ({
		// custom methods can be added here if needed
	}),
);
