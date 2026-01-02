import { getRepository } from '@7otion/orm';

import { ContentType } from '@/lib/models/content-type';
import { Content } from '@/lib/models/content';

import { Observable } from '@/lib/store';
import { ResourceStore } from '@/lib/store/resource';

export async function extractContentTypeFromPath(): Promise<ContentType> {
	const pathName = window.location.pathname;
	const [, , slug] = pathName.split('/');

	const contentTypeRepo = getRepository(ContentType);
	const contentTypeBySlug = (await contentTypeRepo
		.query()
		.where('slug', slug)
		.first()) as ContentType;
	return contentTypeBySlug;
}

export class ContentTypesStore extends ResourceStore<ContentType> {
	contentTypeCounts = new Observable<Record<number, number>>({});
	isDraggable = new Observable(false);

	constructor() {
		super({
			model: ContentType,
		});
	}

	override async fetch() {
		if (this.items.get().length > 0) return;

		this.isLoading.set(true);
		try {
			const repo = getRepository(ContentType);
			const data = await repo.query().orderBy('order', 'asc').get();

			this.items.set(data);
			this.isLoading.set(false);
		} catch (e) {
			this.isLoading.set(false);
			throw e;
		}
	}

	async fetchContentTypeCounts(): Promise<Record<number, number>> {
		const items = this.items.get();
		const contentRepo = getRepository(Content);

		const counts = await Promise.all(
			items.map(async ct => {
				const res = await contentRepo
					.query()
					.selectRaw('COUNT(*) as count')
					.where('content_type_id', ct.id)
					.first();

				return {
					id: ct.id,
					count: res ? Number((res as any).count) : 0,
				};
			}),
		);

		const map = counts.reduce(
			(acc, { id, count }) => {
				acc[id] = count;
				return acc;
			},
			{} as Record<number, number>,
		);

		this.contentTypeCounts.set(map);

		return map;
	}

	async updateOrder(contentTypes: ContentType[]) {
		await Promise.all(
			contentTypes.map((ct, index) => {
				ct.order = index + 1;
				return ct.save();
			}),
		);

		this.items.set(contentTypes);
	}

	setDraggable(draggable: boolean) {
		this.isDraggable.set(draggable);
	}
}
