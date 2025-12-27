import { useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
	AnimatePresence,
	MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from 'motion/react';

import { cn } from '@/lib/utils';

type FloatingDockItem = {
	title: string;
	icon: React.ReactNode;
	href: string;
};

export const FloatingDock = ({
	items,
	scaleFactor = 1,
	dockScale = 1,
	desktopClassName,
}: {
	items: FloatingDockItem[];
	scaleFactor?: number;
	dockScale?: number;
	desktopClassName?: string;
	mobileClassName?: string;
}) => {
	return (
		<>
			<FloatingDockDesktop
				items={items}
				scaleFactor={scaleFactor}
				dockScale={dockScale}
				className={desktopClassName}
			/>
		</>
	);
};

const FloatingDockDesktop = ({
	items,
	className,
	scaleFactor,
	dockScale = 1,
}: {
	items: FloatingDockItem[];
	className?: string;
	scaleFactor?: number;
	dockScale?: number;
}) => {
	const mouseX = useMotionValue(Infinity);
	return (
		<motion.div
			style={{ scale: dockScale }}
			onMouseMove={e => mouseX.set(e.pageX)}
			onMouseLeave={() => mouseX.set(Infinity)}
			className={cn(
				'mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 dark:bg-neutral-900 md:flex',
				className,
			)}
		>
			{items.map(item => (
				<IconContainer
					mouseX={mouseX}
					key={item.title}
					item={item}
					scaleFactor={scaleFactor}
				/>
			))}
		</motion.div>
	);
};

function IconContainer({
	mouseX,
	item,
	scaleFactor = 1,
}: {
	mouseX: MotionValue;
	item: FloatingDockItem;
	scaleFactor?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const { title, icon, href } = item;
	const [location] = useLocation();

	const distance = useTransform(mouseX, val => {
		const bounds = ref.current?.getBoundingClientRect() ?? {
			x: 0,
			width: 0,
		};
		return val - bounds.x - bounds.width / 2;
	});

	// Apply scaleFactor
	const baseSize = 40;
	const maxSize = baseSize * (scaleFactor ?? 1) * 2;
	const minSize = baseSize;

	const widthTransform = useTransform(
		distance,
		[-150, 0, 150],
		[minSize, maxSize, minSize],
	);
	const heightTransform = useTransform(
		distance,
		[-150, 0, 150],
		[minSize, maxSize, minSize],
	);

	const widthIcon = useTransform(
		distance,
		[-150, 0, 150],
		[20, 20 * (scaleFactor ?? 1) * 2, 20],
	);
	const heightIcon = useTransform(
		distance,
		[-150, 0, 150],
		[20, 20 * (scaleFactor ?? 1) * 2, 20],
	);

	const width = useSpring(widthTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});
	const height = useSpring(heightTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	const widthIconSpring = useSpring(widthIcon, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});
	const heightIconSpring = useSpring(heightIcon, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	const [hovered, setHovered] = useState(false);

	const content = (
		<motion.div
			ref={ref}
			style={{ width, height }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className={cn(
				'relative flex aspect-square items-center justify-center rounded-full transition-colors',
				title !== '' ? 'bg-neutral-800 hover:bg-neutral-700' : 'w-2.5!',
				typeof href === 'string' && href !== '' && location === href
					? 'bg-pink-600/30!'
					: '',
			)}
		>
			<AnimatePresence>
				{hovered && title !== '' && (
					<motion.div
						initial={{ opacity: 0, y: 10, x: '-50%' }}
						animate={{ opacity: 1, y: 0, x: '-50%' }}
						exit={{ opacity: 0, y: 2, x: '-50%' }}
						className={cn(
							'absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border 	border-neutral-900 bg-neutral-800 px-2  py-0.5 text-xs',
						)}
					>
						{title}
					</motion.div>
				)}
			</AnimatePresence>
			<motion.div
				style={{ width: widthIconSpring, height: heightIconSpring }}
				className="flex items-center justify-center"
			>
				{icon}
			</motion.div>
		</motion.div>
	);

	return <Link to={href}>{content}</Link>;
}
