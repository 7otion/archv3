import { Model } from '@7otion/orm';

export class Tag extends Model<Tag> {
	id!: number;
	content_type_id!: number;
	name!: string;
	slug!: string;
	description!: string | null;
	created_at!: string;
	updated_at!: string;
}
