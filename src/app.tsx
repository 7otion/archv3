import { Suspense, useEffect, useState } from 'react';
import { Router } from 'wouter';
import { ORM, SQLiteDialect, TauriAdapter } from '@7otion/orm';

import Layout from '@/layout';

import { ErrorBoundary } from '@/components/error-boundary';
import { Loading } from '@/components/loading';
import { Toaster } from '@/components/sonner';

import { StoreProvider, useObservable, useStore } from '@/lib/store';
import { TabsStore } from '@/lib/store/tabs';

import { AppRouter } from './app-router';
import { DialogCoordinator } from './dialog-coordinator';

function App() {
	const tabsStore = useStore(TabsStore);
	const tabs = useObservable(tabsStore.tabs);
	const activeTab = tabs.find(t => t.isActive);

	const [dbInitialized, setDbInitialized] = useState(false);

	const initializeDatabase = async () => {
		const tauriAdapter = new TauriAdapter({
			database: 'sqlite:archv3.db',
			debug: true,
		});
		await tauriAdapter.initialize();
		ORM.initialize({
			adapter: tauriAdapter,
			dialect: new SQLiteDialect(),
			enableWriteQueue: true,
		});
		setDbInitialized(true);
	};

	useEffect(() => {
		(async () => {
			await initializeDatabase();
		})();
	}, []);

	if (!dbInitialized) {
		return <Loading />;
	}

	return (
		<ErrorBoundary>
			<Toaster
				toastOptions={{
					classNames: {
						success: 'text-green-500',
						error: 'text-red-500',
						info: 'text-blue-500',
					},
				}}
			/>
			<DialogCoordinator />
			{activeTab && (
				<StoreProvider stores={activeTab.stores}>
					<Layout>
						<Suspense fallback={<Loading />}>
							<Router>
								<AppRouter />
							</Router>
						</Suspense>
					</Layout>
				</StoreProvider>
			)}
		</ErrorBoundary>
	);
}

export default App;
