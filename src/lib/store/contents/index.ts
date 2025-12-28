import { Content } from '@/lib/models/content';
import type { Tag } from '@/lib/models/tag';
import { MetadataAttribute } from '@/lib/models/metadata-attribute';

import { loadFromStorage, saveToStorage } from '@/lib/utils';
import { createResourceStore, type ResourceState } from '../resource';
import { extractContentTypeFromPath } from '../content-types';
import {
	contentColumns,
	type ColumnConfig,
	buildMetadataColumn,
} from './columns';

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
	refreshMetadataColumns: () => Promise<void>;

	orderBy?: string;
	orderDir?: 'ASC' | 'DESC';
	setOrder: (columnId: string) => void;
}

const STORAGE_KEYS = {
	VIEW_TYPE: 'contents_view_type',
	COLUMNS: 'contents_columns',
} as const;

const defaultColumns = Object.values(contentColumns);

/**
 * Merges stored column preferences with default columns and preserves
 * dynamically added columns (like metadata columns)
 */
function syncColumnsWithDefaults(storedColumns: any): ColumnConfig[] {
	if (!Array.isArray(storedColumns)) return defaultColumns;

	const storedColumnMap = new Map(
		storedColumns.map((col: any) => [col.id, col]),
	);

	// Merge default columns with stored preferences
	const mergedDefaults = defaultColumns.map(defaultCol => {
		const stored = storedColumnMap.get(defaultCol.id);
		return {
			...defaultCol,
			visible: stored?.visible ?? defaultCol.visible,
			order: stored?.order ?? defaultCol.order,
		};
	});

	// Preserve dynamic columns (e.g., metadata columns) not in defaults
	const defaultIds = new Set(defaultColumns.map(c => c.id));
	const dynamicColumns = storedColumns
		.filter((col: any) => !defaultIds.has(col.id))
		.map(
			(col: any, idx: number) =>
				({
					id: col.id,
					label: col.label ?? col.id,
					visible: col.visible ?? false,
					order: col.order ?? mergedDefaults.length + idx + 1,
					type: col.type ?? 'property',
					width: col.width,
					propertyKey: col.propertyKey,
				}) as ColumnConfig,
		);

	return [...mergedDefaults, ...dynamicColumns];
}

/**
 * Updates a column's visibility in the column array
 */
function updateColumnVisibility(
	columns: ColumnConfig[],
	id: string,
	visible: boolean,
): ColumnConfig[] {
	return columns.map(col => (col.id === id ? { ...col, visible } : col));
}

/**
 * Reorders columns based on visible columns only
 */
function reorderColumns(
	columns: ColumnConfig[],
	id: string,
	newIndex: number,
): ColumnConfig[] {
	const visibleColumns = columns
		.filter(c => c.visible)
		.sort((a, b) => a.order - b.order);

	const oldIndex = visibleColumns.findIndex(c => c.id === id);
	if (oldIndex === -1) return columns;

	// Reorder visible columns
	const [moved] = visibleColumns.splice(oldIndex, 1);
	visibleColumns.splice(newIndex, 0, moved);

	// Update order property for all columns
	return columns.map(col => {
		const newOrder = visibleColumns.findIndex(c => c.id === col.id);
		return newOrder !== -1 ? { ...col, order: newOrder + 1 } : col;
	});
}

export const useContentsStore = createResourceStore<Content, ContentsState>(
	{
		model: Content,
		baseFilter: () => {
			const currentContentType = extractContentTypeFromPath();
			return currentContentType
				? { content_type_id: currentContentType.id }
				: undefined;
		},
		eagerOverride: ['category', 'tags', 'file', 'metadata'],
	},
	(set, get) => {
		// Initialize columns from storage
		const storedColumns = loadFromStorage(
			STORAGE_KEYS.COLUMNS,
			defaultColumns,
		);
		const initialColumns = syncColumnsWithDefaults(storedColumns);
		saveToStorage(STORAGE_KEYS.COLUMNS, initialColumns);

		/**
		 * Refreshes metadata columns from the database and merges with existing preferences
		 */
		async function refreshMetadataColumns() {
			const currentContentType = extractContentTypeFromPath();
			if (!currentContentType) return;

			try {
				const attributes = await MetadataAttribute.query()
					.where('content_type_id', currentContentType.id)
					.orderBy('order', 'ASC')
					.get();

				if (!attributes?.length) return;

				const currentColumns = get().columns;
				const currentColumnMap = new Map(
					currentColumns.map(c => [c.id, c]),
				);

				// Build metadata columns and preserve user preferences
				const metadataColumns = attributes
					.map(attr => buildMetadataColumn(attr))
					.map(col => {
						const stored = currentColumnMap.get(col.id);
						return {
							...col,
							visible: stored?.visible ?? col.visible,
							order: stored?.order ?? col.order,
						};
					});

				const nonMetadataColumns = currentColumns.filter(
					c => !c.id.startsWith('meta:'),
				);

				const newColumns = [...nonMetadataColumns, ...metadataColumns];
				saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
				set({ columns: newColumns } as Partial<ContentsState>);
			} catch (error) {
				console.error(
					'Failed to load metadata attributes for columns:',
					error,
				);
			}
		}

		return {
			viewType: loadFromStorage(STORAGE_KEYS.VIEW_TYPE, 'cards'),
			columns: initialColumns,
			refreshMetadataColumns,

			orderBy: undefined,
			orderDir: undefined,
			setOrder(columnId: string) {
				const cols = get().columns as ColumnConfig[];
				const col = cols.find(c => c.id === columnId);
				if (!col) return;
				// skip metadata columns (unsupported ordering)
				if (col.id.startsWith('meta:')) return;
				const field = (col.propertyKey as string) ?? col.id;
				const current = get() as unknown as {
					orderBy?: string;
					orderDir?: 'ASC' | 'DESC';
				};
				const currentOrder = current.orderBy;
				const currentDir = current.orderDir ?? 'ASC';
				let newDir: 'ASC' | 'DESC' = 'ASC';
				if (currentOrder === field) {
					newDir = currentDir === 'ASC' ? 'DESC' : 'ASC';
				}
				set({
					orderBy: field,
					orderDir: newDir,
				} as Partial<ContentsState>);
				get()
					.paginate(1, get().pageSize)
					.catch((e: any) =>
						console.error('Failed to paginate after setOrder', e),
					);
			},

			toggleViewType() {
				const newViewType =
					get().viewType === 'cards' ? 'table' : 'cards';
				saveToStorage(STORAGE_KEYS.VIEW_TYPE, newViewType);
				set({ viewType: newViewType } as Partial<ContentsState>);
			},

			addColumn(id) {
				const newColumns = updateColumnVisibility(
					get().columns,
					id,
					true,
				);
				saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
				set({ columns: newColumns } as Partial<ContentsState>);
			},

			removeColumn(id) {
				const newColumns = updateColumnVisibility(
					get().columns,
					id,
					false,
				);
				saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
				set({ columns: newColumns } as Partial<ContentsState>);
			},

			reorderColumn(id, newIndex) {
				const newColumns = reorderColumns(get().columns, id, newIndex);
				saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
				set({ columns: newColumns } as Partial<ContentsState>);
			},

			resetColumns() {
				saveToStorage(STORAGE_KEYS.COLUMNS, defaultColumns);
				set({ columns: defaultColumns } as Partial<ContentsState>);
				get().refreshMetadataColumns();
			},
		};
	},
);
