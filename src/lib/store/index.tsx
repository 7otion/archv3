/* eslint-disable react-refresh/only-export-components */

import {
	useSyncExternalStore,
	useContext,
	createContext,
	type ReactNode,
} from 'react';

type Listener = () => void;
type Unsubscribe = () => void;

export class Observable<T> {
	private value: T;
	private listeners = new Set<Listener>();

	constructor(initialValue: T) {
		this.value = initialValue;
	}

	get(): T {
		return this.value;
	}

	set(next: T): void {
		if (!Object.is(this.value, next)) {
			this.value = next;
			this.notify();
		}
	}

	update(fn: (prev: T) => T): void {
		this.set(fn(this.value));
	}

	subscribe(listener: Listener): Unsubscribe {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notify() {
		this.listeners.forEach(l => l());
	}
}

export abstract class Store {
	dispose() {
		// Placeholder for cleanup if needed in the future
	}
}

type StoreConstructor<T extends Store> = new (...args: any[]) => T;
type StoreRegistry = Map<StoreConstructor<any>, Store>;

const StoreContext = createContext<StoreRegistry | null>(null);

export function StoreProvider({
	children,
	stores,
}: {
	children: ReactNode;
	stores?: StoreRegistry;
}) {
	return (
		<StoreContext.Provider value={stores ?? null}>
			{children}
		</StoreContext.Provider>
	);
}

const GLOBAL_STORES = new Map<StoreConstructor<any>, Store>();

export function useStore<T extends Store>(StoreClass: StoreConstructor<T>): T {
	const registry = useContext(StoreContext);

	if (registry?.has(StoreClass)) {
		return registry.get(StoreClass) as T;
	}

	if (!GLOBAL_STORES.has(StoreClass)) {
		GLOBAL_STORES.set(StoreClass, new StoreClass());
	}

	return GLOBAL_STORES.get(StoreClass) as T;
}

export function useObservable<T>(obs: Observable<T>): T {
	return useSyncExternalStore(
		l => obs.subscribe(l),
		() => obs.get(),
		() => obs.get(),
	);
}

export function createStoreRegistry(
	classes: StoreConstructor<any>[],
): StoreRegistry {
	const registry = new Map<StoreConstructor<any>, Store>();

	classes.forEach(StoreClass => {
		registry.set(StoreClass, new StoreClass());
	});

	return registry;
}
