import { Model } from '7otion-orm';

export class MetadataValue extends Model<MetadataValue> {
	id!: number;
	content_id!: number;
	attribute_id!: number;
	value!: string | null;
	created_at!: string;
	updated_at!: string;

	get parsedValue(): any {
		if (!this.value) return null;

		try {
			return JSON.parse(this.value);
		} catch {
			const num = Number(this.value);
			if (!isNaN(num)) return num;

			if (this.value.toLowerCase() === 'true') return true;
			if (this.value.toLowerCase() === 'false') return false;

			return this.value;
		}
	}
}
