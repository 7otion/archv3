import { Model, getRepository, ORM } from '@7otion/orm';
import { convertFileSrc } from '@tauri-apps/api/core';

import { ContentType } from '@/lib/models//content-type';
import { Category } from '@/lib/models/category';
import { File } from '@/lib/models/file';
import { Tag } from '@/lib/models/tag';
import { MetadataAttribute } from '@/lib/models/metadata-attribute';
import { MetadataValue } from '@/lib/models/metadata-value';

export class Content extends Model<Content> {
	id!: number;
	content_type_id!: number;
	category_id!: number;
	file_id!: number | null;
	name!: string;
	slug!: string;
	description!: string | null;
	cover!: string | null;
	cover_gif!: string | null;
	rating!: number;
	favorite!: number;
	view_count!: number;
	last_viewed_at!: string | null;
	source_url!: string | null;
	scrape_url!: string | null;
	created_at!: string;
	updated_at!: string;

	// Relationships
	contentType!: ContentType;
	tags!: Tag[];
	category!: Category | null;
	file!: File | null;

	protected static defineRelationships() {
		return {
			contentType: this.belongsTo(ContentType),
			tags: this.belongsToMany(Tag, 'content_tags'),
			category: this.belongsTo(Category),
			file: this.belongsTo(File),
		};
	}

	protected static async afterEagerLoad(instances: Content[]): Promise<void> {
		await this.loadMetadata(instances);
	}

	private static async loadMetadata(instances: Content[]): Promise<void> {
		if (instances.length === 0) return;

		const contentIds = instances.map(i => i.id);
		const contentTypeIds = [
			...new Set(instances.map(i => i.content_type_id)),
		];

		// Load attributes for all content types involved
		const attributesByType = new Map<number, MetadataAttribute[]>();
		const attrRepo = getRepository(MetadataAttribute);

		for (const contentTypeId of contentTypeIds) {
			const attrs = await attrRepo
				.query()
				.where('content_type_id', contentTypeId)
				.orderBy('order', 'ASC')
				.orderBy('name', 'ASC')
				.get();
			attributesByType.set(contentTypeId, attrs);
		}

		// Batch load all metadata values in one query
		const adapter = ORM.getInstance().getAdapter();
		const placeholders = contentIds.map(() => '?').join(',');
		const metadataValues = await adapter.query(
			`SELECT * FROM metadata_values WHERE content_id IN (${placeholders})`,
			contentIds,
		);

		// Group values by content_id
		const valuesByContentId = new Map<number, any[]>();
		for (const value of metadataValues) {
			if (!valuesByContentId.has(value.content_id)) {
				valuesByContentId.set(value.content_id, []);
			}
			valuesByContentId.get(value.content_id)!.push(value);
		}

		// Attach parsed metadata to each instance
		for (const instance of instances) {
			const attributes =
				attributesByType.get(instance.content_type_id) || [];
			const values = valuesByContentId.get(instance.id) || [];

			const metadata: Record<string, any> = {};
			for (const value of values) {
				const attribute = attributes.find(
					attr => attr.id === value.metadata_attribute_id,
				);
				if (attribute) {
					const metadataValue = Object.assign(
						new MetadataValue(),
						value,
					);
					metadata[attribute.slug] = metadataValue.parsed_value;
				}
			}

			(instance as any)._metadata = metadata;
		}
	}

	static async associateTag(content: Content, tag: Tag): Promise<void> {
		// Check if already associated
		const adapter = ORM.getInstance().getAdapter();
		const existing = await adapter.query(
			'SELECT 1 FROM content_tags WHERE content_id = ? AND tag_id = ?',
			[content.id, tag.id],
		);

		if (existing && existing.length > 0) {
			return;
		}

		// Insert association
		await adapter.execute(
			'INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)',
			[content.id, tag.id],
		);

		// Update cached tags if loaded
		const privateKey = '_tags';
		if ((content as any)[privateKey]) {
			(content as any)[privateKey] = [
				...(content as any)[privateKey],
				tag,
			];
		}
	}

	static async dissociateTag(content: Content, tag: Tag): Promise<void> {
		const adapter = ORM.getInstance().getAdapter();
		await adapter.execute(
			'DELETE FROM content_tags WHERE content_id = ? AND tag_id = ?',
			[content.id, tag.id],
		);

		// Update cached tags if loaded
		const privateKey = '_tags';
		if ((content as any)[privateKey]) {
			(content as any)[privateKey] = (content as any)[privateKey].filter(
				(t: Tag) => t.id !== tag.id,
			);
		}
	}

	get metadata(): Record<string, any> {
		if ((this as any)._metadata !== undefined) {
			return (this as any)._metadata || {};
		}

		const loadingKey = '_loading_metadata';
		if ((this as any)[loadingKey]) {
			throw (this as any)[loadingKey];
		}

		const promise = Content.loadMetadata([this]).then(() => {
			delete (this as any)[loadingKey];
		});

		(this as any)[loadingKey] = promise;
		throw promise;
	}

	get coverSrc(): string | null {
		const coverPath = this.cover;
		return coverPath?.startsWith('/')
			? convertFileSrc(coverPath)
			: coverPath;
	}

	get coverGifSrc(): string | null {
		const coverGifPath = this.cover_gif;
		return coverGifPath?.startsWith('/')
			? convertFileSrc(coverGifPath)
			: coverGifPath;
	}

	get isFavorite(): boolean {
		return this.favorite === 1;
	}

	get lastViewedAtDate(): Date | null {
		return this.last_viewed_at ? new Date(this.last_viewed_at) : null;
	}
}
