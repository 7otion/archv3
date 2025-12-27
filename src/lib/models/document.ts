import { Model } from '7otion-orm';

export class Document extends Model<Document> {
	id!: number;
	content!: string | null;
	line_count!: number | null;
	word_count!: number | null;
	created_at!: string;
	updated_at!: string;

	get preview(): string {
		if (!this.content) return '';
		return (
			this.content.substring(0, 100) +
			(this.content.length > 100 ? '...' : '')
		);
	}
}
