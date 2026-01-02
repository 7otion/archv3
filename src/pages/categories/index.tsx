import { useEffect, useState, useMemo } from 'react';
import { PlusIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/button';
import { Toggle } from '@/components/toggle';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';

import { CategoryCard } from '@/pages/categories/card';

import { useStore, useObservable } from '@/lib/store';
import { CategoriesStore } from '@/lib/store/categories';
import { DialogStore } from '@/lib/store/dialog';
import { useCurrentContentType } from '@/lib/hooks/use-current-content-type';

const CategoriesPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [filterToggle, setFilterToggle] = useState(false);
	const [filterQuery, setFilterQuery] = useState('');

	const currentContentType = useCurrentContentType();

	const categoriesStore = useStore(CategoriesStore);
	const categories = useObservable(categoriesStore.items);
	const dialogStore = useStore(DialogStore);

	const filteredCategories = useMemo(() => {
		if (!filterQuery.trim()) {
			return categories;
		}

		const query = filterQuery.toLowerCase().trim();
		return categories.filter(category => {
			const nameMatch = category.name.toLowerCase().includes(query);
			const descriptionMatch =
				category.description?.toLowerCase().includes(query) || false;
			return nameMatch || descriptionMatch;
		});
	}, [categories, filterQuery]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				await categoriesStore.fetch();
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (!filterToggle) {
			setFilterQuery('');
		}
	}, [filterToggle]);

	const handleCreateCategory = () => {
		categoriesStore.setSelected(null);
		dialogStore.openDialog('category-upsert');
	};

	return (
		<div className="h-screen">
			<div className="flex items-center justify-between sticky top-0 z-50 py-3 bg-background border-b">
				<div className="flex flex-col gap-1">
					<div className="flex items-baseline gap-2">
						<h1 className="font-bold">Categories</h1>
						<p className="text-sm text-muted-foreground">
							Organize categories in "{currentContentType?.name}".
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Toggle
						pressed={!!filterToggle}
						onPressedChange={setFilterToggle}
						aria-label="Filter Mode"
					>
						<SearchIcon />
					</Toggle>
					<Button
						variant="outline"
						size="icon"
						onClick={handleCreateCategory}
					>
						<PlusIcon />
					</Button>
				</div>
			</div>

			{filterToggle && (
				<Input
					className="mt-4 mb-2"
					placeholder="Filter categories ..."
					value={filterQuery}
					onChange={e => setFilterQuery(e.target.value)}
				/>
			)}

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loading />
					<span className="ml-2">Loading categories...</span>
				</div>
			) : filteredCategories.length === 0 ? (
				<div className="text-center py-8">
					{filterQuery.trim() ? (
						<>
							<p className="text-muted-foreground mb-4">
								No categories found matching "{filterQuery}".
							</p>
							<Button
								onClick={() => setFilterQuery('')}
								variant="outline"
							>
								Clear filter
							</Button>
						</>
					) : (
						<>
							<p className="text-muted-foreground mb-4">
								No categories found for this content type.
							</p>
							<Button
								onClick={handleCreateCategory}
								variant="outline"
							>
								<PlusIcon className="h-4 w-4 mr-2" />
								Create your first category
							</Button>
						</>
					)}
				</div>
			) : (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-3 py-3">
					{filteredCategories.map(category => (
						<CategoryCard
							key={`category-card-${category.id}`}
							category={category}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default CategoriesPage;
