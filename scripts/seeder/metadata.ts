import { Database } from 'bun:sqlite';
import chalk from 'chalk';
import { faker } from '@faker-js/faker';

const ATTRIBUTE_TYPES = ['text', 'number', 'date', 'boolean', 'json'] as const;

export function metadataSeeder(db: Database) {
	const contentTypes = db.query('SELECT id, name FROM content_types').all();
	const insert = db.query(`
		INSERT INTO metadata_attributes (
			content_type_id, name, slug, attribute_type, "order", icon, is_array, filterable, sortable, description
		) VALUES (
			$content_type_id, $name, $slug, $attribute_type, $order, $icon, $is_array, $filterable, $sortable, $description
		)
	`);

	let lastLogLength = 0;
	for (const ctRaw of contentTypes) {
		const ct = ctRaw as { id: number; name: string };
		const usedNames = new Set<string>();
		for (let i = 0; i < 5; i++) {
			let name: string;
			do {
				name =
					faker.commerce.productAdjective() + ' ' + faker.word.noun();
			} while (usedNames.has(name));
			usedNames.add(name);
			const slug = name
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, '');
			const attribute_type =
				ATTRIBUTE_TYPES[
					Math.floor(Math.random() * ATTRIBUTE_TYPES.length)
				];
			const order = i;
			const icon = faker.helpers.arrayElement([
				'tag',
				'star',
				'calendar',
				'hash',
				'info',
			]);
			const is_array = faker.datatype.boolean() ? 1 : 0;
			const filterable = faker.datatype.boolean() ? 1 : 0;
			const sortable = faker.datatype.boolean() ? 1 : 0;
			const description = faker.lorem.sentence();
			insert.run({
				$content_type_id: ct.id,
				$name: name,
				$slug: slug + '-' + faker.string.alphanumeric(6).toLowerCase(),
				$attribute_type: attribute_type,
				$order: order,
				$icon: icon,
				$is_array: is_array,
				$filterable: filterable,
				$sortable: sortable,
				$description: description,
			});
			const logMsg = chalk.green(
				`Seeded metadata for ${ct.name}: ${name}`,
			);
			process.stdout.write(logMsg + '\r');
			lastLogLength = logMsg.length;
		}
	}

	process.stdout.write(' '.repeat(lastLogLength) + '\r');
	console.log(chalk.blue('Metadata seeding complete.'));
}
