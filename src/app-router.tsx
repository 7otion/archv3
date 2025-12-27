import { lazy } from 'react';
import { Route, Switch } from 'wouter';

import Layout from '@/layout';

const Placeholder = lazy(() => import('@/pages/placeholder'));

export function AppRouter() {
	return (
		<Layout>
			<Switch>
				<Route path="/" component={Placeholder} />
				<Route path="/video-downloader" component={Placeholder} />
			</Switch>
		</Layout>
	);
}
