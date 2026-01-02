import { Store, Observable } from '@/lib/store';

export type DialogType =
	// Tool dialogs
	| 'import-dataset'
	// content type dialogs
	| 'content-type-delete'
	| 'content-type-lock-toggle'
	| 'content-type-upsert'
	// category dialogs
	| 'category-delete'
	| 'category-upsert'
	// metadata attribute dialogs
	| 'metadata-attribute-delete'
	// tag dialogs
	| 'tag-delete'
	// content dialogs
	| 'content-upsert'
	| null;

export class DialogStore extends Store {
	activeDialog = new Observable<DialogType>(null);

	openDialog(type: DialogType) {
		this.activeDialog.set(type);
	}

	closeDialog() {
		this.activeDialog.set(null);
	}
}
