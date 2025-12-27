import { Model } from '7otion-orm';
import { convertFileSrc } from '@tauri-apps/api/core';

import { ContentType } from '@/lib/models/content-type';
import { Content } from '@/lib/models/content';

export class Category extends Model<Category> {
	id!: number;
	content_type_id!: number;
	name!: string;
	slug!: string;
	description!: string | null;
	cover!: string | null;
	cover_gif!: string | null;
	created_at!: string;
	updated_at!: string;

	// Relationships
	contentType!: ContentType;
	contents!: Content[];

	protected static defineRelationships() {
		return {
			contentType: this.belongsTo(ContentType),
			contents: this.hasMany(Content),
		};
	}

	get coverSrc(): string | null {
		const coverPath = this.cover;
		if (coverPath && coverPath !== '') {
			return convertFileSrc(coverPath);
		}
		return coverPath;
	}

	get coverGifSrc(): string | null {
		const coverGifPath = this.cover_gif;
		if (coverGifPath && coverGifPath !== '') {
			return convertFileSrc(coverGifPath);
		}
		return coverGifPath;
	}
}
