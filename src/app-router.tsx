import { lazy } from 'react';
import { Route, Switch } from 'wouter';

import Layout from '@/layout';

const ContentTypeListPage = lazy(() => import('@/pages/content-types/listing'));
const Placeholder = lazy(() => import('@/pages/placeholder'));

export function AppRouter() {
	return (
		<Layout>
			<Switch>
				<Route path="/" component={ContentTypeListPage} />
				<Route path="/video-downloader" component={Placeholder} />
			</Switch>
		</Layout>
	);
}
