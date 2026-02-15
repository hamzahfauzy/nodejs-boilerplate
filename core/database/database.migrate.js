import fs from 'fs'
import path from 'path'
import { sequelize } from './database.sequelize.js'
import { getMigrationFile } from './database.registry.js'

const MIGRATION_TABLE = 'migrations'

export async function runSqlMigrations() {
  const queryInterface = sequelize.getQueryInterface()

  // 1. Pastikan tabel migration_history ada
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) UNIQUE,
      executed_at DATETIME
    )
  `)

  // 2. Ambil migration yang sudah dijalankan
  const [rows] = await queryInterface.sequelize.query(
    `SELECT filename FROM ${MIGRATION_TABLE}`
  )

  const migrationFile = getMigrationFile()

  const executed = new Set(rows.map(r => r.filename))

  for (const [name, migrationDir] of Object.entries(migrationFile)) {
    const files = fs
        .readdirSync(migrationDir)
        .filter(f => f.endsWith('.sql'))
        .sort()
    for (const file of files) {
        if (executed.has(file)) {
            //   console.log(`⏭️  Skip ${file}`)
            continue
        }
    
        const fullPath = path.join(migrationDir, file)
        const sql = fs.readFileSync(fullPath, 'utf8')
    
        console.log(`🚀 Running ${file}`)
        await queryInterface.sequelize.query(sql)
    
        await queryInterface.sequelize.query(
          `INSERT INTO ${MIGRATION_TABLE} (filename, executed_at)
           VALUES (?, NOW())`,
          { replacements: [fullPath] }
        )
    }
  }

  console.log('✅ SQL migrations completed')
}
