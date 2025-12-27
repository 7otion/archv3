import { create } from 'zustand';
import type { Model, ModelConstructor, QueryValue } from '@7otion/orm';

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

	const store = create<TExtended>((set, get) => {
		const baseState: ResourceState<T> = {
			items: [],
			paginatedItems: [],
			selectedItem: null,
			isLoading: false,

			currentPage: 1,
			totalPages: 0,
			totalItems: 0,
			pageSize: 20,

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
						for (const rel of eagerOverride) {
							query.with(rel);
						}
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

			async paginate(page = 1, limit = 20, filter?, eagerParam = []) {
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
						for (const rel of eagerFinal) {
							query.with(rel);
						}
					}
					const { data, total } = await query.paginate(page, limit);

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
	const modelName = model.name;
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
