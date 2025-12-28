import { lazy } from 'react';
import { Route, Switch } from 'wouter';

import Layout from '@/layout';

const ContentTypeListPage = lazy(() => import('@/pages/content-types/listing'));
const ManageContentTypePage = lazy(
	() => import('@/pages/content-types/manage'),
);
const ContentListPage = lazy(() => import('@/pages/contents/listing'));

const Placeholder = lazy(() => import('@/pages/placeholder'));

export function AppRouter() {
	return (
		<Layout>
			<Switch>
				<Route path="/" component={ContentTypeListPage} />
				<Route
					path="/content-types/:contentType/manage/:section?"
					component={ManageContentTypePage}
				/>
				<Route
					path="/content-types/:contentType"
					component={ContentListPage}
				/>
				<Route path="/video-downloader" component={Placeholder} />
			</Switch>
		</Layout>
	);
}
