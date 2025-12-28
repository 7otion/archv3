import { MetadataAttribute } from '@/lib/models/metadata-attribute';

import { createResourceStore, type ResourceState } from './resource';
import { extractContentTypeFromPath } from './content-types';

type MetadataAttributesState = ResourceState<MetadataAttribute>;

export const useMetadataAttributesStore = createResourceStore<
	MetadataAttribute,
	MetadataAttributesState
>(
	{
		model: MetadataAttribute,
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
