import { Suspense } from 'react';
import { Router } from 'wouter';

import { ErrorBoundary } from '@/components/error-boundary';
import { Loading } from '@/components/loading';
import { Toaster } from '@/components/sonner';

import { AppRouter } from './app-router';

function App() {
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
			<Suspense fallback={<Loading />}>
				<Router>
					<AppRouter />
				</Router>
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
