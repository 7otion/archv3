import { Tag } from '@/lib/models/tag';

import { ResourceStore } from '@/lib/store/resource';
import { extractContentTypeFromPath } from '@/lib/store/content-types';

export class TagsStore extends ResourceStore<Tag> {
	constructor() {
		super({
			model: Tag,
			baseFilter: async () => {
				const ct = await extractContentTypeFromPath();
				if (ct) return { content_type_id: ct.id };
			},
		});
	}
}
