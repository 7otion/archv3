import { Category } from '@/lib/models/category';

import { ResourceStore } from '@/lib/store/resource';
import { extractContentTypeFromPath } from '@/lib/store/content-types';

export class CategoriesStore extends ResourceStore<Category> {
	constructor() {
		super({
			model: Category,
			baseFilter: async () => {
				const ct = await extractContentTypeFromPath();
				if (ct) return { content_type_id: ct.id };
			},
		});
	}
}
