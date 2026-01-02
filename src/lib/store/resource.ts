import { Model, type ModelConstructor, type QueryValue } from '@7otion/orm';

import { Store, Observable } from '@/lib/store';
import { loadFromStorage, saveToStorage } from '@/lib/utils';

export interface ResourceConfig<T extends Model<any>> {
	model: ModelConstructor<T>;
	baseFilter?: Record<string, any> | (() => Record<string, any>);
	eagerOverride?: string[];
}

interface PaginationPersistState {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
}

function getStorageKey(modelName: string): string {
	const pathname =
		typeof window !== 'undefined' ? window.location.pathname : '';
	return `${Model.generateSlug(modelName)}_${Model.generateSlug(pathname)}_table`;
}

export class ResourceStore<T extends Model<any>> extends Store {
	items = new Observable<T[]>([]);
	paginatedItems = new Observable<T[]>([]);
	selectedItem = new Observable<T | null>(null);
	isLoading = new Observable(false);

	currentPage: Observable<number>;
	totalPages = new Observable(0);
	totalItems = new Observable(0);
	pageSize: Observable<number>;

	private primaryKey: string;
	private storageKey: string;

	// @ts-ignore
	constructor(private config: ResourceConfig<T>) {
		super();

		const { model } = config;
		this.primaryKey = model.config.primaryKey || 'id';
		this.storageKey = getStorageKey(model.name);

		const persisted = loadFromStorage<PaginationPersistState | null>(
			this.storageKey,
			null,
		);

		this.currentPage = new Observable(persisted?.currentPage ?? 1);
		this.pageSize = new Observable(persisted?.pageSize ?? 20);
		this.totalPages.set(persisted?.totalPages ?? 0);
		this.totalItems.set(persisted?.totalItems ?? 0);
	}

	private async resolveBaseFilter() {
		const { baseFilter } = this.config;
		return typeof baseFilter === 'function'
			? await baseFilter()
			: baseFilter;
	}

	// ─────────────────────────────────────────────────────────────
	// CRUD
	// ─────────────────────────────────────────────────────────────

	async fetch() {
		this.isLoading.set(true);
		try {
			const query = this.config.model.query();
			const filter = await this.resolveBaseFilter();

			if (filter) {
				for (const [k, v] of Object.entries(filter)) {
					query.where(k, v as any);
				}
			}

			if (this.config.eagerOverride) {
				query.with(...this.config.eagerOverride);
			}

			const data = await query.get();
			this.items.set(data);
			this.isLoading.set(false);
		} catch (e) {
			this.isLoading.set(false);
			throw e;
		}
	}

	async paginate(
		page = this.currentPage.get(),
		limit = this.pageSize.get(),
		filter?: Record<string, any>,
		eager?: string[],
	) {
		this.isLoading.set(true);

		try {
			const query = this.config.model.query();
			const mergedFilter = {
				...(await this.resolveBaseFilter()),
				...filter,
			};

			if (mergedFilter) {
				for (const [k, v] of Object.entries(mergedFilter)) {
					query.where(k, v as any);
				}
			}

			const eagerFinal = eager ?? this.config.eagerOverride;
			if (eagerFinal) query.with(...eagerFinal);

			const result = await query.paginate(page, limit);

			const totalPages = Math.ceil(result.total / limit);

			saveToStorage(this.storageKey, {
				currentPage: page,
				totalPages,
				totalItems: result.total,
				pageSize: limit,
			});

			this.paginatedItems.set(result.data);
			this.currentPage.set(page);
			this.pageSize.set(limit);
			this.totalItems.set(result.total);
			this.totalPages.set(totalPages);
			this.isLoading.set(false);
		} catch (e) {
			this.isLoading.set(false);
			throw e;
		}
	}

	async add(data: Partial<T>) {
		const saved = await this.config.model.create(data as any);
		this.items.update(items => [...items, saved]);
		this.totalItems.update(n => n + 1);
		await this.paginate();
		return saved;
	}

	async update(pk: any, data: Partial<T>) {
		const item = await this.config.model.find(pk as QueryValue);
		if (!item) throw new Error('Item not found');

		Object.assign(item as any, data);
		const saved = await item.save();

		this.items.update(items =>
			items.map(i => ((i as any)[this.primaryKey] === pk ? saved : i)),
		);
	}

	async remove(item: T) {
		const id = (item as any)[this.primaryKey];
		await item.delete();

		this.items.update(items =>
			items.filter(i => (i as any)[this.primaryKey] !== id),
		);
		this.totalItems.update(n => Math.max(0, n - 1));

		await this.paginate();
	}

	// ─────────────────────────────────────────────────────────────
	// UI helpers
	// ─────────────────────────────────────────────────────────────

	setSelected(item: T | null) {
		this.selectedItem.set(item);
	}

	setPage(page: number) {
		this.currentPage.set(page);
	}

	setPageSize(size: number) {
		this.pageSize.set(size);
	}
}
