import React from 'react';
import { Link } from 'wouter';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/breadcrumb';

const formatText = (text: string) =>
	text.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

export const LayoutBreadcrumb = ({ className }: { className?: string }) => {
	const pathSegments = location.pathname.split('/').filter(Boolean);

	return (
		<Breadcrumb className={className}>
			<BreadcrumbList
				className="flex-nowrap whitespace-nowrap overflow-x-auto min-w-0"
				style={{ flexWrap: 'nowrap' }}
			>
				{pathSegments.map((segment, index) => {
					const href = `/${pathSegments
						.slice(0, index + 1)
						.join('/')}`;
					const isLast = index === pathSegments.length - 1;

					return (
						<React.Fragment key={`breadcrumb-${href}`}>
							<BreadcrumbItem className="shrink-0">
								{isLast ? (
									<BreadcrumbPage>
										{formatText(segment)}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link to={href}>
											{formatText(segment)}
										</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && (
								<BreadcrumbSeparator className="shrink-0" />
							)}
						</React.Fragment>
					);
				})}

				{location.pathname === '/' && (
					<BreadcrumbPage>Home</BreadcrumbPage>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
