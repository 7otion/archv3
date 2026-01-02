import { ResourceStore } from '@/lib/store/resource';
import { extractContentTypeFromPath } from '@/lib/store/content-types';
import { MetadataAttribute } from '@/lib/models/metadata-attribute';

export class MetadataAttributesStore extends ResourceStore<MetadataAttribute> {
	constructor() {
		super({
			model: MetadataAttribute,
			baseFilter: async () => {
				const ct = await extractContentTypeFromPath();
				if (ct) return { content_type_id: ct.id };
			},
		});
	}
}
