import type { Content } from '@/lib/models/content';
import type { MetadataAttribute } from '@/lib/models/metadata-attribute';
import { HeartIcon, StarIcon } from 'lucide-react';

export type ColumnConfig = {
	id: string;
	label: string;
	visible: boolean;
	order: number;
	type: string;
	width?: string;
	propertyKey?: string;
	accessor?: (content: Content) => any;
};

const contentColumns: Record<string, ColumnConfig> = {};

function genericDataColumn(
	key: string,
	label?: string,
	width?: string,
	visible: boolean = false,
) {
	return {
		id: key,
		width,
		label:
			label ||
			key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
		visible,
		order: Object.keys(contentColumns).length + 1,
		type: 'property',
		accessor: (content: Content) => content[key as keyof Content] || '-',
	};
}

function genericDateColumn(
	key: string,
	label?: string,
	width?: string,
	visible: boolean = false,
) {
	return {
		id: key,
		width,
		label:
			label ||
			key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
		visible,
		order: Object.keys(contentColumns).length + 1,
		type: 'property',
		accessor: (content: Content) => {
			const val = content[key as keyof Content];
			if (val != null) {
				return new Date(
					val as string | number | Date,
				).toLocaleDateString();
			}
			return '-';
		},
	};
}

function relationshipColumn(
	key: string,
	propToDisplay: string,
	label?: string,
	width?: string,
	visible: boolean = false,
) {
	return {
		id: key,
		width,
		label:
			label ||
			key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
		visible,
		order: Object.keys(contentColumns).length + 1,
		type: 'property',
		accessor: (content: Content) => {
			const rel: any = content[key as keyof Content];
			if (rel) {
				if (Array.isArray(rel)) {
					return rel
						.map(item => item[propToDisplay] || '-')
						.join(', ');
				} else {
					return rel[propToDisplay] || '-';
				}
			}
		},
	};
}

contentColumns.id = genericDataColumn('id', 'ID', '40px', false);
contentColumns.id_with_cover = {
	id: 'id_with_cover',
	label: 'ID(C)',
	visible: true,
	order: 0,
	type: 'property',
	width: '60px',
	accessor: (content: Content) => {
		return (
			<div className="flex gap-1 items-center">
				{content.coverSrc && (
					<img
						src={content.coverSrc}
						className="size-9 rounded-full"
					/>
				)}
			</div>
		);
	},
};
contentColumns.name = genericDataColumn('name', undefined, undefined, true);
contentColumns.category = relationshipColumn('category', 'name');
contentColumns.description = genericDataColumn('description');
contentColumns.rating = {
	id: 'rating',
	label: 'Rating',
	visible: false,
	order: Object.keys(contentColumns).length + 1,
	type: 'property',
	width: '50px',
	accessor: (content: Content) => {
		return (
			<div className="flex gap-1 items-center text-center justify-center">
				<StarIcon className="size-3 text-yellow-400" />
				<span>{content.rating != null ? content.rating : '-'}</span>
			</div>
		);
	},
};
contentColumns.favorite = {
	id: 'favorite',
	label: 'Fav.',
	visible: false,
	order: Object.keys(contentColumns).length + 1,
	type: 'property',
	width: '50px',
	accessor: (content: Content) => {
		return (
			<div className="flex justify-center items-center">
				<HeartIcon
					className={`size-4 ${content.isFavorite ? 'text-red-400' : 'text-gray-400'}`}
				/>
			</div>
		);
	},
};
contentColumns.view_count = genericDataColumn('view_count', 'Views');
contentColumns.lastViewedAtDate = genericDataColumn(
	'lastViewedAtDate',
	'Last Viewed',
);
contentColumns.tags = relationshipColumn('tags', 'name');
contentColumns.created_at = genericDateColumn('created_at');
contentColumns.updated_at = genericDateColumn('updated_at');

export { contentColumns };

export type MetadataRenderer = (
	value: any,
	content: Content,
	attribute: MetadataAttribute,
) => any;

const metadataRenderers: Record<string, MetadataRenderer> = {};

export function registerMetadataRenderer(slug: string, fn: MetadataRenderer) {
	metadataRenderers[slug] = fn;
}

export function buildMetadataColumn(
	attribute: MetadataAttribute,
): ColumnConfig {
	const key = `meta:${attribute.slug}`;
	return {
		id: key,
		label: attribute.name,
		visible: false,
		order: Object.keys(contentColumns).length + 1,
		type: 'property',
		accessor: (content: Content) => {
			const md = (content as any).metadata || {};
			const val = md[attribute.slug];
			if (val === undefined || val === null) return '-';

			// If a custom renderer exists for this attribute, use it
			const renderer = metadataRenderers[attribute.slug];
			if (renderer) return renderer(val, content, attribute);

			// Default rendering: if array -> implode with comma
			if (Array.isArray(val)) return val.join(', ');

			if (typeof val === 'object') return JSON.stringify(val);
			return String(val);
		},
	};
}
