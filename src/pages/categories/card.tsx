import { useState, useMemo } from 'react';
import { Edit2Icon, Trash2Icon } from 'lucide-react';

import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
} from '@/components/context-menu';

import type { Category } from '@/lib/models/category';

import { useStore } from '@/lib/store';
import { CategoriesStore } from '@/lib/store/categories';
import { DialogStore } from '@/lib/store/dialog';
import { cn } from '@/lib/utils';

const STRIPE_CONFIG = {
	lightGradient: 'from-neutral-900 to-neutral-950',
	darkGradient: 'from-neutral-900 to-neutral-950',

	lightStripeColor: 'rgba(0,0,0,0.1)',
	darkStripeColor: 'rgba(255,255,255,0.3)',

	stripeAngle: '45deg',
	stripeSize: '50px',
} as const;

interface CategoryCardProps {
	category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

	const categoriesStore = useStore(CategoriesStore);
	const dialogStore = useStore(DialogStore);

	const handleEdit = () => {
		categoriesStore.setSelected(category);
		dialogStore.openDialog('category-upsert');
	};

	const handleDelete = () => {
		categoriesStore.setSelected(category);
		dialogStore.openDialog('category-delete');
	};

	const cardStyle = useMemo(() => {
		if (!category.cover) return undefined;

		const shouldShowGif =
			(isHovered || isContextMenuOpen) && category.cover_gif !== null;

		return {
			backgroundImage: `url(${
				shouldShowGif ? category.cover_gif : category.cover
			})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		};
	}, [category.cover, category.cover_gif, isHovered, isContextMenuOpen]);

	return (
		<ContextMenu onOpenChange={setIsContextMenuOpen}>
			<ContextMenuTrigger asChild>
				<div
					className={cn(
						'group cursor-pointer overflow-hidden relative card rounded-md shadow-xl flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800 max-w-80 max-h-80',
						!category.cover &&
							`bg-linear-to-br ${STRIPE_CONFIG.lightGradient} dark:${STRIPE_CONFIG.darkGradient}`,
						category.cover &&
							category.cover_gif &&
							"hover:after:content-[''] hover:after:absolute hover:after:inset-0  hover:after:opacity-50",
						!category.cover &&
							`relative before:absolute before:inset-0 before:bg-[linear-gradient(${STRIPE_CONFIG.stripeAngle},transparent_25%,${STRIPE_CONFIG.lightStripeColor}_25%,${STRIPE_CONFIG.lightStripeColor}_50%,transparent_50%,transparent_75%,${STRIPE_CONFIG.lightStripeColor}_75%)] before:bg-[length:${STRIPE_CONFIG.stripeSize}_${STRIPE_CONFIG.stripeSize}] dark:before:bg-[linear-gradient(${STRIPE_CONFIG.stripeAngle},transparent_25%,${STRIPE_CONFIG.darkStripeColor}_25%,${STRIPE_CONFIG.darkStripeColor}_50%,transparent_50%,transparent_75%,${STRIPE_CONFIG.darkStripeColor}_75%)]`,
						'transition-all duration-500 relative',
						'w-full aspect-square',
					)}
					style={cardStyle}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 z-1" />

					<div className="text z-10">
						<h1
							className={cn(
								'font-bold text-xl md:text-3xl text-shadow-strong',
								category.cover
									? 'text-gray-50'
									: 'text-gray-800 dark:text-gray-200',
							)}
						>
							{category.name}
						</h1>
						{category.description && (
							<p className="font-normal text-sm text-shadow-strong my-1 text-muted-foreground">
								{category.description}
							</p>
						)}
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent className="bg-neutral-950/90">
				<ContextMenuItem
					onClick={handleEdit}
					className="focus:bg-neutral-900/60"
				>
					<Edit2Icon className="mr-2" />
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
