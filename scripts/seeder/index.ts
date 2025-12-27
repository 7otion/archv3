import { Database } from 'bun:sqlite';
import chalk from 'chalk';
import dotenv from 'dotenv';

import { contentTypeSeeder } from './content-type';
import { categorySeeder } from './category';
import { metadataSeeder } from './metadata';
import { contentSeeder } from './content';
import { tagSeeder } from './tag';

dotenv.config();

const dbPath = process.env.SQLITE_DB_PATH;
if (!dbPath) {
	console.error(chalk.red('SQLITE_DB_PATH is not set in .env file!'));
	process.exit(1);
}

const db = new Database(dbPath);
db.run('PRAGMA journal_mode = WAL;');

function truncateAllTables() {
	const tables = db
		.query(
			`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`,
		)
		.all() as { name: string }[];
	for (const { name: table } of tables) {
		if (table.startsWith('_')) {
			console.log(chalk.yellow(`Skipped table: ${table}`));
			continue;
		}
		try {
			db.query(`DELETE FROM ${table}`).run();
			db.query(`DELETE FROM sqlite_sequence WHERE name = $name`).run({
				$name: table,
			});
			console.log(chalk.gray(`Truncated ${table}`));
		} catch (e) {
			console.log(chalk.red(`Failed to truncate ${table}: ${e}`));
		}
	}
}

function seeder() {
	console.log('⚡ Using database at: ' + chalk.cyan(dbPath));
	console.log(chalk.yellow('🧼 Truncating all tables...'));
	truncateAllTables();
	console.log(chalk.green('Truncated all tables.'));

	contentTypeSeeder(db);
	categorySeeder(db);
	metadataSeeder(db);
	contentSeeder(db);
	tagSeeder(db);
	console.log(chalk.green('Seeding complete!'));
}

seeder();
