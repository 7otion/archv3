import { Model } from '@7otion/orm';

import { Video } from '@/lib/models/video';
import { Image } from '@/lib/models/image';
import { Document } from '@/lib/models/document';

export type MediaQuality = 320 | 480 | 720 | 1080 | 2160 | 4320;
export type FileType = 'video' | 'image' | 'document' | 'other';

export class File extends Model<File> {
	id!: number;
	path!: string;
	name!: string;
	size!: number;
	mime!: string;
	extension!: string;
	ctime!: number;
	mtime!: number;
	file_type!: FileType;
	file_metadata_id!: number | null;
	scrape_url!: string | null;
	download_url!: string | null;
	is_directory!: number;
	created_at!: string;
	updated_at!: string;

	metadata!: Video | Image | Document | null;

	protected static defineRelationships() {
		return {
			metadata: this.morphTo({
				discriminatorField: 'file_type',
				foreignKeyField: 'file_metadata_id',
				morphMap: {
					video: Video,
					image: Image,
					document: Document,
				},
			}),
		};
	}

	get sizeFormatted(): string {
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let size = this.size;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}

	get fileCreatedDate(): Date {
		return new Date(this.ctime * 1000);
	}

	get fileModifiedDate(): Date {
		return new Date(this.mtime * 1000);
	}

	get isDirectory(): boolean {
		return this.is_directory === 1;
	}
}
