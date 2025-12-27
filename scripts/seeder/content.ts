import { Database } from 'bun:sqlite';
import chalk from 'chalk';
import { faker } from '@faker-js/faker';

export function contentSeeder(db: Database) {
	const contentTypes = db.query('SELECT id, name FROM content_types').all();
	// Prepare queries
	const getCategories = db.query(
		'SELECT id FROM categories WHERE content_type_id = $ctid',
	);
	const getMetadata = db.query(
		'SELECT id, attribute_type FROM metadata_attributes WHERE content_type_id = $ctid',
	);
	const insertContent = db.query(`
		INSERT INTO contents (
			content_type_id, category_id, file_id, name, slug, description, cover, cover_gif, rating, favorite, view_count, last_viewed_at, source_url, scrape_url
		) VALUES (
			$content_type_id, $category_id, $file_id, $name, $slug, $description, $cover, $cover_gif, $rating, $favorite, $view_count, $last_viewed_at, $source_url, $scrape_url
		)
	`);
	const insertMetadataValue = db.query(`
		INSERT INTO metadata_values (
			content_id, attribute_id, value
		) VALUES (
			$content_id, $attribute_id, $value
		)
	`);

	let lastLogLength = 0;
	for (const ctRaw of contentTypes) {
		process.stdout.write(' '.repeat(lastLogLength) + '\r');
		lastLogLength = 0;
		const ct = ctRaw as { id: number; name: string };
		const categories = getCategories.all({ $ctid: ct.id }) as {
			id: number;
		}[];
		const metadata = getMetadata.all({ $ctid: ct.id }) as {
			id: number;
			attribute_type: string;
		}[];
		let contentRows: any[] = [];
		let metaRows: any[] = [];
		for (let i = 0; i < 1000; i++) {
			const category = faker.helpers.arrayElement(categories);
			const name = faker.commerce.productName() + ' ' + faker.word.noun();
			const slug =
				name
					.toLowerCase()
					.replace(/\s+/g, '-')
					.replace(/[^a-z0-9-]/g, '') +
				'-' +
				faker.string.alphanumeric(6).toLowerCase();
			const description = faker.lorem.sentence();
			const cover = null;
			const cover_gif = null;
			const rating = Number(
				faker.number
					.float({ min: 0, max: 10, fractionDigits: 1 })
					.toFixed(1),
			);
			const favorite = faker.datatype.boolean() ? 1 : 0;
			const view_count = faker.number.int({ min: 0, max: 10000 });
			const last_viewed_at = faker.date.past().toISOString();
			const source_url = faker.internet.url();
			const scrape_url = faker.internet.url();
			contentRows.push({
				$content_type_id: ct.id,
				$category_id: category.id,
				$file_id: null,
				$name: name,
				$slug: slug,
				$description: description,
				$cover: cover,
				$cover_gif: cover_gif,
				$rating: rating,
				$favorite: favorite,
				$view_count: view_count,
				$last_viewed_at: last_viewed_at,
				$source_url: source_url,
				$scrape_url: scrape_url,
			});
			metaRows.push(metadata.map(attr => ({ attr, contentIndex: i })));

			if ((i + 1) % 500 === 0 || i === 999) {
				db.run('BEGIN TRANSACTION');
				for (let j = 0; j < contentRows.length; j++) {
					insertContent.run(contentRows[j]);
					const contentId = (
						db.query('SELECT last_insert_rowid() as id').get() as {
							id: number;
						}
					).id;
					for (const meta of metaRows[j]) {
						let value: string;
						switch (meta.attr.attribute_type) {
							case 'text':
								value = faker.lorem.words(3);
								break;
							case 'number':
								value = faker.number
									.int({ min: 0, max: 10000 })
									.toString();
								break;
							case 'date':
								value = faker.date.past().toISOString();
								break;
							case 'boolean':
								value = faker.datatype.boolean() ? '1' : '0';
								break;
							case 'json':
								value = JSON.stringify({
									foo: faker.word.noun(),
									bar: faker.number.int({ min: 0, max: 100 }),
								});
								break;
							default:
								value = '';
						}
						insertMetadataValue.run({
							$content_id: contentId,
							$attribute_id: meta.attr.id,
							$value: value,
						});
					}
				}
				db.run('COMMIT');
				contentRows = [];
				metaRows = [];
				// Log progress
				const logMsg = chalk.green(
					`Seeded content for ${ct.name}: ${i + 1}/1000`,
				);
				process.stdout.write(logMsg + '\r');
				lastLogLength = logMsg.length;
			}
		}
	}

	process.stdout.write(' '.repeat(lastLogLength) + '\r');
	console.log(chalk.blue('Content seeding complete.'));
}
