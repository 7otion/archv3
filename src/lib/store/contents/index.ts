import { Content } from '@/lib/models/content';
import { MetadataAttribute } from '@/lib/models/metadata-attribute';

import { Observable } from '@/lib/store';
import { ResourceStore } from '@/lib/store/resource';
import { extractContentTypeFromPath } from '@/lib/store/content-types';

import { loadFromStorage, saveToStorage } from '@/lib/utils';

import {
	contentColumns,
	type ColumnConfig,
	buildMetadataColumn,
} from './columns';

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

function updateColumnVisibility(
	columns: ColumnConfig[],
	id: string,
	visible: boolean,
): ColumnConfig[] {
	return columns.map(col => (col.id === id ? { ...col, visible } : col));
}

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

export class ContentsStore extends ResourceStore<Content> {
	viewType = new Observable<'cards' | 'table'>('cards');
	columns = new Observable<ColumnConfig[]>(defaultColumns);
	orderBy = new Observable<string | undefined>(undefined);
	orderDir = new Observable<'ASC' | 'DESC' | undefined>(undefined);

	constructor() {
		super({
			model: Content,
			baseFilter: async () => {
				const currentContentType = await extractContentTypeFromPath();
				return currentContentType
					? { content_type_id: currentContentType.id }
					: undefined;
			},
			eagerOverride: ['category', 'tags', 'file', 'metadata'],
		});

		this.viewType.set(loadFromStorage(STORAGE_KEYS.VIEW_TYPE, 'cards'));
		this.columns.set(
			syncColumnsWithDefaults(
				loadFromStorage(STORAGE_KEYS.COLUMNS, defaultColumns),
			),
		);
	}

	toggleViewType() {
		this.viewType.update((v: 'cards' | 'table') =>
			v === 'cards' ? 'table' : 'cards',
		);
		saveToStorage(STORAGE_KEYS.VIEW_TYPE, this.viewType.get());
	}

	addColumn(id: string) {
		this.columns.update((cols: ColumnConfig[]) =>
			updateColumnVisibility(cols, id, true),
		);
		saveToStorage(STORAGE_KEYS.COLUMNS, this.columns.get());
	}

	removeColumn(id: string) {
		this.columns.update((cols: ColumnConfig[]) =>
			updateColumnVisibility(cols, id, false),
		);
		saveToStorage(STORAGE_KEYS.COLUMNS, this.columns.get());
	}

	reorderColumn(id: string, newIndex: number) {
		this.columns.update((cols: ColumnConfig[]) =>
			reorderColumns(cols, id, newIndex),
		);
		saveToStorage(STORAGE_KEYS.COLUMNS, this.columns.get());
	}

	resetColumns() {
		this.columns.set(defaultColumns);
		saveToStorage(STORAGE_KEYS.COLUMNS, defaultColumns);
		this.refreshMetadataColumns();
	}

	setOrder(columnId: string) {
		const cols = this.columns.get();
		const col = cols.find((c: ColumnConfig) => c.id === columnId);
		if (!col || col.id.startsWith('meta:')) return;
		const field = (col.propertyKey as string) ?? col.id;
		const currentOrder = this.orderBy.get();
		const currentDir = this.orderDir.get() ?? 'ASC';
		let newDir: 'ASC' | 'DESC' = 'ASC';
		if (currentOrder === field) {
			newDir = currentDir === 'ASC' ? 'DESC' : 'ASC';
		}
		this.orderBy.set(field);
		this.orderDir.set(newDir);
		this.paginate(1, this.pageSize.get()).catch(e =>
			console.error('Failed to paginate after setOrder', e),
		);
	}

	async refreshMetadataColumns() {
		const currentContentType = await extractContentTypeFromPath();
		if (!currentContentType) return;

		try {
			const attributes = await MetadataAttribute.query()
				.where('content_type_id', currentContentType.id)
				.orderBy('order', 'ASC')
				.get();

			if (!attributes?.length) return;

			const currentColumns = this.columns.get();
			const currentColumnMap = new Map(
				currentColumns.map((c: ColumnConfig) => [c.id, c]),
			);

			const metadataColumns = attributes
				.map(attr => buildMetadataColumn(attr))
				.map(col => {
					const stored = currentColumnMap.get(col.id) as
						| ColumnConfig
						| undefined;
					return {
						...col,
						visible: stored?.visible ?? col.visible,
						order: stored?.order ?? col.order,
					};
				});

			const nonMetadataColumns = currentColumns.filter(
				(c: ColumnConfig) => !c.id.startsWith('meta:'),
			);

			const newColumns = [...nonMetadataColumns, ...metadataColumns];
			this.columns.set(newColumns);
			saveToStorage(STORAGE_KEYS.COLUMNS, newColumns);
		} catch (error) {
			console.error(
				'Failed to load metadata attributes for columns:',
				error,
			);
		}
	}
}
