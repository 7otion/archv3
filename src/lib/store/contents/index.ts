import { Content } from '@/lib/models/content';
import type { Tag } from '@/lib/models/tag';

import { loadFromStorage, saveToStorage } from '@/lib/utils';

import { createResourceStore, type ResourceState } from '../resource';
import { extractContentTypeFromPath } from '../content-types';
import { contentColumns, type ColumnConfig } from './columns';

interface ContentsState extends ResourceState<Content> {
	associateTag: (content: Content, tag: Tag) => Promise<void>;
	setContentMetadata: (
		contentId: number,
		metadata: Record<string, any>,
	) => Promise<void>;
	viewType: 'cards' | 'table';
	toggleViewType: () => void;
	columns: ColumnConfig[];
	addColumn: (id: string) => void;
	removeColumn: (id: string) => void;
	reorderColumn: (id: string, newIndex: number) => void;
	resetColumns: () => void;
}

const defaultColumns = Object.values(contentColumns);

const STORAGE_KEYS = {
	VIEW_TYPE: 'contents_view_type',
	COLUMNS: 'contents_columns',
};

function syncColumnsWithDefaults(columns: any): ColumnConfig[] {
	const defaultColumns = Object.values(contentColumns);
	if (!Array.isArray(columns)) return defaultColumns;

	const columnMap = new Map(columns.map((col: any) => [col.id, col]));
	return defaultColumns.map(defaultCol => {
		const storedCol = columnMap.get(defaultCol.id);
		return {
			...defaultCol,
			visible: storedCol?.visible ?? defaultCol.visible,
			order: storedCol?.order ?? defaultCol.order,
		};
	});
}

export const useContentsStore = createResourceStore<Content, ContentsState>(
	{
		model: Content,
		baseFilter: () => {
			const currentContentType = extractContentTypeFromPath();
			if (currentContentType) {
				return {
					content_type_id: currentContentType.id,
				};
			}
		},
		eagerOverride: ['category', 'tags', 'file'],
	},
	(set, get) => {
		const storedColumns = loadFromStorage(
			STORAGE_KEYS.COLUMNS,
			defaultColumns,
		);
		const columns = syncColumnsWithDefaults(storedColumns);
		saveToStorage(STORAGE_KEYS.COLUMNS, columns);

		return {
			viewType: loadFromStorage(STORAGE_KEYS.VIEW_TYPE, 'cards'),
			columns,

			toggleViewType() {
				const newViewType =
					get().viewType === 'cards' ? 'table' : 'cards';
				saveToStorage(STORAGE_KEYS.VIEW_TYPE, newViewType);
				set({
					viewType: newViewType,
				} as Partial<ContentsState>);
			},

			addColumn(id) {
				const columns = get().columns;
				const newColumns = columns.map(col =>
					col.id === id ? { ...col, visible: true } : col,
				);
				saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
				set({ columns: newColumns } as Partial<ContentsState>);
			},

			removeColumn(id) {
				const columns = get().columns;
				const newColumns = columns.map(col =>
					col.id === id ? { ...col, visible: false } : col,
				);
				saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
				set({ columns: newColumns } as Partial<ContentsState>);
			},

			reorderColumn(id, newIndex) {
				const columns = get().columns;
				const visibleColumns = columns
					.filter(c => c.visible)
					.sort((a, b) => a.order - b.order);
				const oldIndex = visibleColumns.findIndex(c => c.id === id);
				if (oldIndex === -1) return;
				const [moved] = visibleColumns.splice(oldIndex, 1);
				visibleColumns.splice(newIndex, 0, moved);
				const newColumns = columns.map(col => {
					const newOrder = visibleColumns.findIndex(
						c => c.id === col.id,
					);
					return newOrder !== -1
						? { ...col, order: newOrder + 1 }
						: col;
				});
				saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
				set({ columns: newColumns } as Partial<ContentsState>);
			},

			resetColumns() {
				saveToStorage(STORAGE_KEYS.COLUMNS, defaultColumns);
				set({
					columns: defaultColumns,
				} as Partial<ContentsState>);
			},
		};
	},
);
