import { create } from 'zustand';
import { Model, type ModelConstructor, type QueryValue } from '@7otion/orm';
import { loadFromStorage, saveToStorage } from '@/lib/utils';

export interface ResourceState<T extends Model<any>> {
	items: T[];
	paginatedItems: T[];
	selectedItem: T | null;
	isLoading: boolean;

	// Pagination state
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;

	// CRUD
	fetch: () => Promise<void>;
	paginate: (
		page: number,
		limit: number,
		filter?: Record<string, any>,
		eager?: string[],
	) => Promise<void>;
	add: (data: Partial<T>) => Promise<T>;
	update: (primaryKey: any, data: Partial<T>) => Promise<void>;
	remove: (item: T) => Promise<void>;

	setSelected: (item: T | null) => void;
	setPage: (page: number) => void;
	setPageSize: (size: number) => void;
}

export interface ResourceStoreConfig<T extends Model<any>> {
	model: ModelConstructor<T>;
	baseFilter?: Record<string, any> | (() => Record<string, any>);
	initialState?: Partial<ResourceState<T>>;
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
	const slugifiedPath = Model.generateSlug(pathname);
	const slugifiedModel = Model.generateSlug(modelName);
	return `${slugifiedModel}_${slugifiedPath}_table`;
}

export function createResourceStore<
	T extends Model<any>,
	TExtended extends ResourceState<T>,
>(
	baseConfig: ResourceStoreConfig<T>,
	extender: (
		set: (partial: Partial<TExtended>) => void,
		get: () => TExtended,
	) => Partial<TExtended>,
) {
	const { model, baseFilter, eagerOverride, initialState = {} } = baseConfig;
	const primaryKeyName = model.config.primaryKey || 'id';
	const modelName = model.name;

	const persistedState = loadFromStorage<PaginationPersistState | null>(
		getStorageKey(modelName),
		null,
	);
	const defaultPageSize = 20;
	const defaultCurrentPage = 1;

	const store = create<TExtended>((set, get) => {
		const baseState: ResourceState<T> = {
			items: [],
			paginatedItems: [],
			selectedItem: null,
			isLoading: false,

			currentPage: persistedState?.currentPage ?? defaultCurrentPage,
			totalPages: persistedState?.totalPages ?? 0,
			totalItems: persistedState?.totalItems ?? 0,
			pageSize: persistedState?.pageSize ?? defaultPageSize,

			async fetch() {
				set({ isLoading: true } as Partial<TExtended>);
				try {
					const filter =
						typeof baseFilter === 'function'
							? baseFilter()
							: baseFilter;
					const query = model.query();
					if (filter) {
						for (const [key, val] of Object.entries(filter)) {
							query.where(
								key,
								val as
									| string
									| number
									| boolean
									| null
									| undefined,
							);
						}
					}
					if (eagerOverride) {
						query.with(...eagerOverride);
					}
					const data = await query.get();
					set({
						items: data,
						isLoading: false,
					} as Partial<TExtended>);
				} catch (error) {
					set({ isLoading: false } as Partial<TExtended>);
					throw error;
				}
			},

			async paginate(page = 1, limit = 20, filter?, eagerParam?) {
				const eagerFinal = eagerParam ?? eagerOverride;
				set({ isLoading: true } as Partial<TExtended>);
				try {
					const computedBaseFilter =
						typeof baseFilter === 'function'
							? baseFilter()
							: baseFilter;
					const mergedFilter = {
						...computedBaseFilter,
						...filter,
					};

					const query = model.query();
					if (mergedFilter && Object.keys(mergedFilter).length > 0) {
						for (const [key, val] of Object.entries(mergedFilter)) {
							query.where(
								key,
								val as
									| string
									| number
									| boolean
									| null
									| undefined,
							);
						}
					}
					if (eagerFinal) {
						query.with(...eagerFinal);
					}

					try {
						const storeAny: any = get();
						if (storeAny && storeAny.orderBy) {
							const dir = (storeAny.orderDir || 'ASC').toString();
							if (typeof (query as any).orderBy === 'function') {
								(query as any).orderBy(
									storeAny.orderBy,
									dir.toLowerCase(),
								);
							}
						}
					} catch (_e) { } // ignore ordering errors

					const paginatedItems = get().paginatedItems;
					if (
						page === defaultCurrentPage &&
						limit === defaultPageSize &&
						persistedState &&
						paginatedItems.length === 0
					) {
						page = persistedState.currentPage;
						limit = persistedState.pageSize;
					}

					let data, total;
					const result = await query.paginate(page, limit);
					data = result.data;
					total = result.total;
					if (data.length === 0 && total > 0 && page > 1) {
						// If the current page has no data but there are total items,
						// it means the page is out of range
						// Fetch the last available page.
						saveToStorage(getStorageKey(modelName), {
							currentPage: page,
							totalPages: Math.ceil(total / limit),
							totalItems: total,
							pageSize: limit,
						});
						const lastPage = Math.ceil(total / limit);
						const result = await query.paginate(lastPage, limit);
						data = result.data;
						total = result.total;
						page = lastPage;
					}

					saveToStorage(getStorageKey(modelName), {
						currentPage: page,
						totalPages: Math.ceil(total / limit),
						totalItems: total,
						pageSize: limit,
					});

					const totalPages = Math.ceil(total / limit);
					set({
						paginatedItems: data,
						currentPage: page,
						totalPages,
						totalItems: total,
						pageSize: limit,
						isLoading: false,
					} as Partial<TExtended>);
				} catch (error) {
					set({ isLoading: false } as Partial<TExtended>);
					throw error;
				}
			},

			async add(data: Partial<T>) {
				const saved = await model.create(data as any);
				set(
					state =>
						({
							items: [...state.items, saved],
							totalItems: state.totalItems + 1,
						}) as Partial<TExtended>,
				);

				get()
					.paginate(get().currentPage, get().pageSize)
					.catch(err => {
						console.error('Failed to paginate after add:', err);
					});

				return saved;
			},

			async update(primaryKey: any, data: Partial<T>) {
				const item = await model.find(primaryKey as QueryValue);
				if (!item) {
					throw new Error('Item not found');
				}
				for (const [key, val] of Object.entries(data)) {
					(item as Record<string, unknown>)[key] = val;
				}
				const saved = await item.save();
				set(
					state =>
						({
							items: state.items.map(i =>
								(i as Record<string, unknown>)[
									primaryKeyName
								] === primaryKey
									? saved
									: i,
							),
						}) as Partial<TExtended>,
				);
			},

			async remove(item: T) {
				const itemId = (item as Record<string, unknown>)[
					primaryKeyName
				];
				await item.delete();
				set(
					state =>
						({
							items: state.items.filter(
								i =>
									(i as Record<string, unknown>)[
										primaryKeyName
									] !== itemId,
							),
							totalItems: Math.max(0, state.totalItems - 1),
						}) as Partial<TExtended>,
				);

				get()
					.paginate(get().currentPage, get().pageSize)
					.catch(err => {
						console.error('Failed to paginate after remove:', err);
					});
			},

			setSelected(item) {
				set({ selectedItem: item } as Partial<TExtended>);
			},

			setPage(page) {
				set({ currentPage: page } as Partial<TExtended>);
			},

			setPageSize(size) {
				set({ pageSize: size } as Partial<TExtended>);
			},
		};

		const extended = extender(
			set as (partial: Partial<TExtended>) => void,
			get,
		);

		return {
			...baseState,
			...initialState,
			...extended,
		} as TExtended;
	});

	// Automatically set up Suspense update callback for this model
	(model as any).setUpdateCallback?.(modelName, () => {
		store.setState(
			state =>
				({
					items: [...state.items],
				}) as Partial<TExtended>,
		);
	});

	return store;
}
