import { Model } from '@7otion/orm';

import type { MediaQuality } from '@/lib/models/file';

export class Image extends Model<Image> {
	id!: number;
	width!: number;
	height!: number;
	resolution!: string;
	quality!: MediaQuality;
	format!: string;
	color_space!: string | null;
	has_exif!: number;
	created_at!: string;
	updated_at!: string;

	get hasExif(): boolean {
		return this.has_exif === 1;
	}

	get dimensions(): { width: number; height: number } | null {
		const match = this.resolution.match(/(\d+)x(\d+)/);
		if (match) {
			return {
				width: parseInt(match[1]),
				height: parseInt(match[2]),
			};
		}
		return null;
	}

	get aspectRatio(): number | null {
		const dims = this.dimensions;
		return dims ? dims.width / dims.height : null;
	}
}
