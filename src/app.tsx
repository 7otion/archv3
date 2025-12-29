import { Suspense, useEffect, useState } from 'react';
import { Router } from 'wouter';
import { ORM, SQLiteDialect, TauriAdapter } from '@7otion/orm';

import Layout from '@/layout';

import { ErrorBoundary } from '@/components/error-boundary';
import { Loading } from '@/components/loading';
import { Toaster } from '@/components/sonner';

import { AppRouter } from './app-router';
import { DialogCoordinator } from './dialog-coordinator';

function App() {
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
			<Layout>
				<Suspense fallback={<Loading />}>
					<Router>
						<AppRouter />
					</Router>
				</Suspense>
			</Layout>
		</ErrorBoundary>
	);
}

export default App;
