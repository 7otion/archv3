import { create } from 'zustand';

type DialogType =
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
	| null;

interface DialogState {
	activeDialog: DialogType;
	openDialog: (type: DialogType) => void;
	closeDialog: () => void;
}

export const useDialogStore = create<DialogState>(set => ({
	activeDialog: null,
	openDialog: type => set({ activeDialog: type }),
	closeDialog: () => set({ activeDialog: null }),
}));
