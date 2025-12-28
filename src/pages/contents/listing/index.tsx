import { useCallback, useEffect, useMemo } from 'react';
import { EyeIcon, EditIcon, Trash2Icon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/button';
import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
} from '@/components/context-menu';
import { PaginationControls } from '@/components/pagination-controls';

import { useContentsStore } from '@/lib/store/contents';
import { useCurrentContentType } from '@/lib/hooks/use-current-content-type';

import { ContentListToolbar } from './toolbar';
import { ContentVideoCard } from './cards/video';
import { ContentGenericCard } from './cards/generic';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/table';
import { EmptyResult } from './empty-result';

const ContentListPage = () => {
	const currentContentType = useCurrentContentType();

	const {
		paginatedItems,
		currentPage,
		totalPages,
		totalItems,
		pageSize,
		paginate,
		isLoading,
		viewType,
		columns,
	} = useContentsStore(
		useShallow(state => ({
			paginatedItems: state.paginatedItems,
			currentPage: state.currentPage,
			totalPages: state.totalPages,
			totalItems: state.totalItems,
			pageSize: state.pageSize,
			paginate: state.paginate,
			isLoading: state.isLoading,
			viewType: state.viewType,
			columns: state.columns,
		})),
	);

	const visibleColumns = useMemo(() => {
		return columns
			.filter(col => col.visible)
			.sort((a, b) => a.order - b.order);
	}, [columns]);

	useEffect(() => {
		paginate(currentPage, pageSize);
	}, [currentPage, pageSize]);

	const handleView = useCallback((content: any) => {
		console.log('View content:', content);
	}, []);

	const handleEdit = useCallback((content: any) => {
		console.log('Edit content:', content);
	}, []);

	const handleDelete = useCallback((content: any) => {
		console.log('Delete content:', content);
	}, []);

	const renderContentCard = useCallback(
		(content: any) => {
			const CardComponent = (() => {
				switch (currentContentType?.file_type) {
					case 'video':
						return ContentVideoCard;
					case 'image':
					case 'binary':
					case 'document':
					case 'other':
					default:
						return ContentGenericCard;
				}
			})();

			return (
				<ContextMenu key={content.id}>
					<ContextMenuTrigger asChild>
						<div>
							<CardComponent content={content} />
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent className="bg-neutral-950/70">
						<ContextMenuItem
							onClick={() => handleView(content)}
							className="focus:bg-neutral-900/60"
						>
							<EyeIcon className="mr-2" />
							View
						</ContextMenuItem>
						<ContextMenuItem
							onClick={() => handleEdit(content)}
							className="focus:bg-neutral-900/60"
						>
							<EditIcon className="mr-2" />
							Edit
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem
							className="text-destructive focus:bg-neutral-900/60 focus:text-destructive hover:brightness-125"
							onClick={() => handleDelete(content)}
						>
							<Trash2Icon className="mr-2" />
							Delete
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
			);
		},
		[currentContentType?.file_type, handleView, handleEdit, handleDelete],
	);

	if (paginatedItems.length === 0 && !isLoading) {
		return <EmptyResult />;
	}

	return (
		<div className="flex-1 transition-all duration-300 p-4">
			<div className="flex flex-wrap justify-between items-center gap-4">
				<ContentListToolbar />
				<PaginationControls
					isCompact
					perPageOptions={[7, 14, 20, 50, 100]}
					currentPage={currentPage}
					totalItems={totalItems}
					totalPages={totalPages}
					perPage={pageSize}
					onPageChange={page => {
						if (page >= 1 && page <= totalPages) {
							paginate(page, pageSize);
						}
					}}
					onPerPageChange={per => {
						paginate(1, per);
					}}
				/>
			</div>
			{viewType === 'cards' ? (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 mt-4">
					{paginatedItems.map(content => renderContentCard(content))}
				</div>
			) : (
				<Table className="table-auto w-full mt-2">
					<TableHeader>
						<TableRow>
							{visibleColumns.map(col => (
								<TableHead
									key={col.id}
									style={{ width: col.width }}
									className="text-md text-pink-200"
								>
									{col.label}
								</TableHead>
							))}
							<TableHead className="w-30">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedItems.map(content => (
							<TableRow key={content.id}>
								{visibleColumns.map(col => {
									const value =
										col.type === 'property' &&
										col.propertyKey
											? (content as any)[col.propertyKey]
											: col.accessor?.(content) || '-';

									return (
										<TableCell
											key={col.id}
											className="whitespace-normal"
										>
											{value}
										</TableCell>
									);
								})}
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="ghost"
											onClick={() => handleView(content)}
										>
											<EyeIcon className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => handleEdit(content)}
										>
											<EditIcon className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={() =>
												handleDelete(content)
											}
										>
											<Trash2Icon className="w-4 h-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
};

export default ContentListPage;
