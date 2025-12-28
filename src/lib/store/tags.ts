import { Tag } from '@/lib/models/tag';

import { createResourceStore, type ResourceState } from './resource';
import { extractContentTypeFromPath } from './content-types';

type TagsState = ResourceState<Tag>;

export const useTagsStore = createResourceStore<Tag, TagsState>(
	{
		model: Tag,
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
