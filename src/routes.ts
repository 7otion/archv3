import { lazy } from 'react';

const ContentTypeListPage = lazy(() => import('@/pages/content-types/listing'));
const ManageContentTypePage = lazy(
	() => import('@/pages/content-types/manage'),
);
const ContentListPage = lazy(() => import('@/pages/contents/listing'));
const Placeholder = lazy(() => import('@/pages/placeholder'));

export type AppRoute = {
	path: string;
	component: any;
	title: string;
	canClose?: boolean;
};

export const routes: AppRoute[] = [
	{
		path: '/',
		component: ContentTypeListPage,
		title: 'Home',
		canClose: false,
	},
	{
		path: '/content-types/:contentType/manage/:section?',
		component: ManageContentTypePage,
		title: 'Manage Content Type',
		canClose: true,
	},
	{
		path: '/content-types/:contentType',
		component: ContentListPage,
		title: 'Contents',
		canClose: true,
	},
	{
		path: '/video-downloader',
		component: Placeholder,
		title: 'Video Downloader',
		canClose: true,
	},
];

export default routes;
