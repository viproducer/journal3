import { migrateEntriesToUserStructure, rollbackMigration } from '../src/lib/firebase/migrations';
import '../src/lib/firebase/load-env';

async function main() {
  try {
    const isRollback = process.argv.includes('--rollback');
    
    if (isRollback) {
      console.log('Starting rollback process...');
      await rollbackMigration();
      console.log('Rollback completed successfully');
    } else {
      console.log('Starting migration process...');
      await migrateEntriesToUserStructure();
      console.log('Migration completed successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Process failed:', error);
    process.exit(1);
  }
}

main(); 