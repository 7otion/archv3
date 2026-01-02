import routes from '@/routes';
import { createStoreRegistry, Observable, Store } from './index';
import { TagsStore } from './tags';
import { ContentTypesStore } from './content-types';
import { ContentsStore } from './contents';
import { MetadataAttributesStore } from './metadata-attributes';
import { CategoriesStore } from './categories';
import { DialogStore } from './dialog';

export interface Tab {
	id: string;
	path: string;
	title: string;
	isActive: boolean;
	canClose: boolean;
	stores: ReturnType<typeof createStoreRegistry>;
}

function createTabStores() {
	return createStoreRegistry([
		TagsStore,
		ContentTypesStore,
		ContentsStore,
		MetadataAttributesStore,
		CategoriesStore,
		DialogStore,
	]);
}

function resolveTitle(path: string): string {
	const route = routes.find(r => r.path === path);
	return route?.title ?? path;
}

function resolveCanClose(path: string): boolean {
	const route = routes.find(r => r.path === path);
	return route?.canClose ?? true;
}

export class TabsStore extends Store {
	readonly tabs = new Observable<Tab[]>([
		{
			id: 'initial',
			path: routes[0]?.path ?? '/',
			title: routes[0]?.title ?? 'Home',
			isActive: true,
			canClose: routes[0]?.canClose ?? false,
			stores: createTabStores(),
		},
	]);

	readonly activeTab = new Observable<Tab | undefined>(
		this.tabs.get().find(t => t.isActive),
	);

	private _syncActiveTab(): void {
		this.activeTab.set(this.tabs.get().find(t => t.isActive));
	}

	private _setTabs(tabs: Tab[]): void {
		this.tabs.set(tabs);
		this._syncActiveTab();
	}

	addTab(input: Partial<Tab> & Pick<Tab, 'path'>): void {
		const tabs = this.tabs.get();

		const id = input.id ?? `${input.path}-${Date.now()}`;
		if (tabs.some(t => t.id === id)) return;

		const tab: Tab = {
			id,
			path: input.path,
			title: input.title ?? resolveTitle(input.path),
			isActive: false,
			canClose: input.canClose ?? resolveCanClose(input.path),
			stores: createTabStores(),
		};

		this._setTabs([...tabs, tab]);
	}

	removeTab(id: string): void {
		const tabs = this.tabs.get();
		const index = tabs.findIndex(t => t.id === id);
		if (index === -1) return;

		const wasActive = tabs[index].isActive;
		const remaining = tabs.filter(t => t.id !== id);

		// Dispose stores to prevent memory leaks
		const removed = tabs[index];
		if (removed?.stores) {
			Object.values(removed.stores).forEach(store => {
				if (store && typeof store.dispose === 'function') {
					store.dispose();
				}
			});
		}

		if (wasActive && remaining.length > 0) {
			const next =
				remaining[index - 1] ?? remaining[index] ?? remaining[0];
			next.isActive = true;

			if (typeof window !== 'undefined') {
				window.history.replaceState(null, '', next.path);
			}
		}

		this._setTabs(
			remaining.map(t => ({
				...t,
				isActive: !!t.isActive,
			})),
		);
	}

	activateTab(id: string): void {
		const tabs = this.tabs.get();
		if (!tabs.some(t => t.id === id)) return;

		this._setTabs(
			tabs.map(t => ({
				...t,
				isActive: t.id === id,
			})),
		);
	}
}
