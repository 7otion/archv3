import { Model } from '@7otion/orm';
import { convertFileSrc } from '@tauri-apps/api/core';

import { Category } from '@/lib/models/category';
import { MetadataAttribute } from '@/lib/models/metadata-attribute';
import { Tag } from '@/lib/models/tag';
import { Content } from '@/lib/models/content';

import { FileIPC } from '@/lib/services/file';

export class ContentType extends Model<ContentType> {
	id!: number;
	name!: string;
	slug!: string;
	file_type!: 'video' | 'image' | 'binary' | 'document' | 'other';
	description!: string | null;
	icon!: string | null;
	pinned!: number;
	docked!: number;
	locked!: number;
	cover!: string;
	order!: number | null;
	created_at!: string;
	updated_at!: string;

	// Relationships
	categories!: Category[];
	metadataAttributes!: MetadataAttribute[];
	tags!: Tag[];
	contents!: Content[];

	protected static defineRelationships() {
		return {
			categories: this.hasMany(Category),
			metadataAttributes: this.hasMany(MetadataAttribute),
			tags: this.hasMany(Tag),
			contents: this.hasMany(Content),
		};
	}

	public async delete(): Promise<boolean> {
		const coverPath = this.cover;
		if (coverPath && coverPath !== '') {
			await FileIPC.trash(coverPath);
		}

		return super.delete();
	}

	get coverSrc(): string | null {
		const coverPath = this.cover;
		if (coverPath && coverPath !== '') {
			return convertFileSrc(coverPath);
		}
		return coverPath;
	}

	get isPinned(): boolean {
		return this.pinned === 1;
	}

	get isDocked(): boolean {
		return this.docked === 1;
	}

	get isLocked(): boolean {
		return this.locked === 1;
	}
}
