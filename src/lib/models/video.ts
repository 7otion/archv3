import { Model } from '7otion-orm';

import type { MediaQuality } from '@/lib/models/file';

export class Video extends Model<Video> {
	id!: number;
	fps!: number;
	duration!: number;
	duration_display!: string;
	resolution!: string;
	quality!: MediaQuality;
	format!: string;
	codec!: string;
	created_at!: string;
	updated_at!: string;

	get qualityLabel(): string {
		switch (this.quality) {
			case 320:
				return 'SD';
			case 480:
				return 'SD';
			case 720:
				return 'HD';
			case 1080:
				return 'Full HD';
			case 2160:
				return '4K';
			case 4320:
				return '8K';
			default:
				return 'Unknown';
		}
	}

	get audio_streams(): any[] {
		const streams = (this as any).audio_streams;
		if (!streams) return [];
		try {
			return JSON.parse(streams);
		} catch {
			return [];
		}
	}

	get subtitles(): any[] {
		const subs = (this as any).subtitles;
		if (!subs) return [];
		try {
			return JSON.parse(subs);
		} catch {
			return [];
		}
	}

	get chapters(): any[] {
		const chaps = (this as any).chapters;
		if (!chaps) return [];
		try {
			return JSON.parse(chaps);
		} catch {
			return [];
		}
	}

	get isHD(): boolean {
		return this.quality >= 720;
	}

	get is4K(): boolean {
		return this.quality >= 2160;
	}
}
