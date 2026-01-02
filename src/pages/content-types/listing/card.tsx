import { useState } from 'react';
import { useLocation } from 'wouter';
import {
	PinIcon,
	AnchorIcon,
	LockIcon,
	EditIcon,
	Trash2Icon,
	UnlockIcon,
	CogIcon,
} from 'lucide-react';

import { Toggle } from '@/components/toggle';
import { IconRenderer } from '@/components/iconify/renderer';
import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
} from '@/components/context-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/tooltip';

import { useStore } from '@/lib/store';
import { DialogStore } from '@/lib/store/dialog';
import { ContentTypesStore } from '@/lib/store/content-types';
import { TabsStore } from '@/lib/store/tabs';

import type { ContentType } from '@/lib/models/content-type';
import { cn } from '@/lib/utils';

interface ContentTypeCardProps {
	contentType: ContentType;
	itemCount: number;
}

const ContentTypeCard = ({ contentType, itemCount }: ContentTypeCardProps) => {
	const [, navigate] = useLocation();
	const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

	const tabsStore = useStore(TabsStore);
	const dialogStore = useStore(DialogStore);
	const contentTypesStore = useStore(ContentTypesStore);

	const handleTogglePin = async () => {
		await contentTypesStore.update(contentType.id, {
			pinned: contentType.pinned ? 0 : 1,
		});
	};

	const handleToggleDock = async () => {
		await contentTypesStore.update(contentType.id, {
			docked: contentType.docked ? 0 : 1,
		});
	};

	const handleToggleLock = () => {
		contentTypesStore.setSelected(contentType);
		dialogStore.openDialog('content-type-lock-toggle');
	};

	const handleEdit = () => {
		contentTypesStore.setSelected(contentType);
		dialogStore.openDialog('content-type-upsert');
	};

	const handleDelete = () => {
		contentTypesStore.setSelected(contentType);
		dialogStore.openDialog('content-type-delete');
	};

	const handleCardClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;

		if (
			target.closest('button') ||
			target.closest('[role="button"]') ||
			target.closest('.interactive-element')
		) {
			return;
		}

		navigate(`/content-types/${contentType.slug}`);
	};

	const handleManageLink = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate(`/content-types/${contentType.slug}/manage`);
	};

	const handleMiddleClick = (e: React.MouseEvent) => {
		if (e.button === 1) {
			e.preventDefault();
			tabsStore.addTab({
				title: contentType.name,
				path: `/content-types/${contentType.slug}`,
			});
		}
	};

	const cardStyle: React.CSSProperties = {
		backgroundImage:
			'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
		backgroundSize: contentType.coverSrc ? 'cover' : '40px 40px',
	};

	const bgImage = {
		backgroundImage: `url(${contentType.coverSrc})`,
	};

	return (
		<ContextMenu onOpenChange={setIsContextMenuOpen}>
			<ContextMenuTrigger asChild>
				<div
					onClick={handleCardClick}
					onMouseDown={e => handleMiddleClick(e)}
					className={cn(
						'overflow-hidden relative card hover:shadow-lg dark:hover:shadow-blue-800/10 dark:hover:border-blue-700/20 hover:cursor-pointer rounded-md w-full h-full flex flex-col justify-between p-4 bg-cover z-2 bg-center group hover:-translate-y-0.5 ransition-all duration-200 ease-out',
						contentType.coverSrc
							? ''
							: 'rounded-lg! border bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
						isContextMenuOpen &&
							'context-menu-active -translate-y-0.5 border-blue-700/20 shadow-lg shadow-blue-800/10',
					)}
					style={cardStyle}
				>
					{contentType.coverSrc && (
						<div
							className="absolute inset-0 bg-cover bg-center rounded-lg"
							style={bgImage}
						/>
					)}
					<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 via-70% to-black/80 z-1" />
					<div className="flex justify-between items-center space-x-4 z-10">
						<IconRenderer iconSvg={contentType.icon ?? undefined} />
						<div className="flex flex-col text-xs text-right">
							<p className="font-normal text-shadow-strong text-gray-50 relative z-10">
								{itemCount} items
							</p>
							<p className="text-orange-100">
								{new Date(
									contentType.updated_at,
								).toLocaleDateString()}
							</p>
						</div>
					</div>
					<div className="text content z-10">
						<div
							className={cn(
								'flex justify-between mb-2 transform opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-50',
								isContextMenuOpen &&
									'translate-y-0 opacity-100',
							)}
						>
							<div className="flex items-center gap-1">
								<Toggle
									pressed={!!contentType.pinned}
									onPressedChange={handleTogglePin}
									className={cn(
										'size-8 bg-background/80 backdrop-blur-sm hidden',
										contentType.pinned && 'text-primary',
									)}
									aria-label={
										contentType.pinned ? 'Unpin' : 'Pin'
									}
								>
									<PinIcon />
								</Toggle>{' '}
								<Toggle
									pressed={!!contentType.docked}
									onPressedChange={handleToggleDock}
									className={cn(
										'size-8 bg-background/80 backdrop-blur-sm data-[state=on]:text-blue-400 data-[state=on]:bg-background data-[state=on]:border-blue-900 data-[state=on]:hover:bg-secondary',
										contentType.docked && 'text-primary',
									)}
									aria-label={
										contentType.docked ? 'Undock' : 'Dock'
									}
								>
									<AnchorIcon />
								</Toggle>{' '}
								<Toggle
									pressed={!!contentType.locked}
									onPressedChange={handleToggleLock}
									className={cn(
										'size-8 bg-background/80 backdrop-blur-sm data-[state=on]:text-red-400 data-[state=on]:bg-background data-[state=on]:border-red-900 data-[state=on]:hover:bg-secondary',
										contentType.locked && 'text-primary',
									)}
									aria-label={
										contentType.locked ? 'Unlock' : 'Lock'
									}
								>
									{contentType.locked ? (
										<LockIcon />
									) : (
										<UnlockIcon />
									)}
								</Toggle>
							</div>

							<Tooltip delayDuration={500}>
								<TooltipTrigger asChild>
									<div
										onClick={handleManageLink}
										className="size-8 rounded-md flex hover:text-blue-500 transition-colors duration-200 interactive-element cursor-pointer"
									>
										<CogIcon />
									</div>
								</TooltipTrigger>
								<TooltipContent>Manage</TooltipContent>
							</Tooltip>
						</div>
						<h1 className="font-bold text-xl md:text-2xl text-gray-50 z-10 text-shadow-strong">
							{contentType.name}
						</h1>

						{contentType.description && (
							<p className="font-normal text-sm z-10 mt-2 text-orange-100 text-shadow-strong">
								{contentType.description}
							</p>
						)}
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent className="bg-neutral-950/70">
				<ContextMenuItem
					onClick={handleEdit}
					className="focus:bg-neutral-900/60"
				>
					<EditIcon className="mr-2" />
					Edit
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem
					className="text-destructive focus:bg-neutral-900/60 focus:text-destructive hover:brightness-125"
					onClick={handleDelete}
				>
					<Trash2Icon className="mr-2" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default ContentTypeCard;
