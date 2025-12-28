import { lazy, Suspense } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { ChevronLeftIcon } from 'lucide-react';

import { Button } from '@/components/button';
import { Loading } from '@/components/loading';

const CategoriesPage = lazy(() => import('@/pages/categories'));
const MetadataAttributesPage = lazy(
	() => import('@/pages/metadata-attributes'),
);
const TagsPage = lazy(() => import('@/pages/tags'));

const ManageContentType = () => {
	const [, setLocation] = useLocation();
	const params = useParams();
	const section = params.section || 'categories';

	const handleGoBack = () => {
		setLocation('/');
	};

	const renderContent = () => {
		switch (section) {
			case 'categories':
				return <CategoriesPage />;
			case 'metadata-attributes':
				return <MetadataAttributesPage />;
			case 'tags':
				return <TagsPage />;
			default:
				return <div>Section not found</div>;
		}
	};

	return (
		<div className="gap-0 px-4 py-3">
			<div className="flex items-center">
				<Button
					onClick={handleGoBack}
					className="mr-4"
					variant="outline"
					size="icon"
				>
					<ChevronLeftIcon />
				</Button>
				<div className="flex space-x-1">
					<Link
						href={`/content-types/${params.contentType}/manage/categories`}
						className={`px-3 py-2 text-sm font-medium rounded-md ${
							section === 'categories'
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Categories
					</Link>
					<Link
						href={`/content-types/${params.contentType}/manage/metadata-attributes`}
						className={`px-3 py-2 text-sm font-medium rounded-md ${
							section === 'metadata-attributes'
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Metadata Attributes
					</Link>
					<Link
						href={`/content-types/${params.contentType}/manage/tags`}
						className={`px-3 py-2 text-sm font-medium rounded-md ${
							section === 'tags'
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Tags
					</Link>
				</div>
			</div>
			<div className="relative">
				<Suspense fallback={<Loading />}>{renderContent()}</Suspense>
			</div>
		</div>
	);
};

export default ManageContentType;
