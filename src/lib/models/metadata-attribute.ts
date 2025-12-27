import { Model } from '7otion-orm';

export type AttributeType = 'text' | 'number' | 'date' | 'boolean' | 'json';

export class MetadataAttribute extends Model<MetadataAttribute> {
	id!: number;
	content_type_id!: number;
	name!: string;
	slug!: string;
	attribute_type!: AttributeType;
	order!: number | null;
	icon!: string | null;
	is_array!: number;
	filterable!: number;
	sortable!: number;
	description!: string | null;
	created_at!: string;
	updated_at!: string;

	get isArray(): boolean {
		return this.is_array === 1;
	}

	get isFilterable(): boolean {
		return this.filterable === 1;
	}

	get isSortable(): boolean {
		return this.sortable === 1;
	}
}
