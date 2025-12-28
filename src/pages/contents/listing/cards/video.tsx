import { useState } from 'react';

import type { Content } from '@/lib/models/content';

export const ContentVideoCard = ({
	content,
	onClick,
}: {
	content: Content;
	onClick?: () => void;
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="relative w-full h-80 group cursor-pointer"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
		>
			<div className="absolute inset-0 bg-linear-to-br from-zinc-900/40 via-zinc-800/20 to-zinc-900/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-white/10 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
				<div className="absolute inset-0 opacity-30">
					<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-blue-500/20 to-transparent rounded-full blur-xl"></div>
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-purple-500/20 to-transparent rounded-full blur-lg"></div>
					<div className="absolute top-1/2 left-1/2 w-16 h-16 bg-linear-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-lg transform -translate-x-1/2 -translate-y-1/2"></div>
				</div>

				<div className="relative z-10 p-3 h-full flex flex-col">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-linear-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
								{content.rating}
							</div>
							<div>
								<h3 className="text-white font-medium text-sm leading-tight text-shadow-strong">
									{content.name}
								</h3>
								<p className="text-orange-200 text-xs">
									{content.category!.name}
								</p>
							</div>
						</div>
					</div>
				</div>

				{content.cover && (
					<div className="absolute inset-0 transition-all duration-300">
						<img
							src={content.cover}
							className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
							alt={content.name}
							loading="lazy"
							decoding="async"
						/>
						<div className="absolute inset-0 bg-linear-to-t from-black via-black/90 via-40% to-transparent"></div>
						<div className="absolute inset-0 bg-linear-to-b transition-all duration-300 from-black/90 via-40% via-transparent to-transparent"></div>

						<div className="absolute bottom-6 left-3 right-3 transition-all duration-300">
							<p className="text-zinc-300 text-xs leading-relaxed mb-4 line-clamp-3 text-shadow-strong">
								{content.description ||
									'No description available'}
							</p>

							<div className="space-y-3">
								{content.tags.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{content.tags.slice(0, 4).map(tag => (
											<span
												key={tag.id}
												className="px-2 py-1 bg-black/50 border border-white/10 rounded-full text-[10px] text-blue-100 font-medium"
											>
												{tag.name}
											</span>
										))}
										{content.tags.length > 4 && (
											<span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] text-blue-300 font-medium">
												+{content.tags.length - 4}
											</span>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
