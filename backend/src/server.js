import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/database.js'
import { ensureAdmin } from './utils/ensureAdmin.js'

const port = process.env.PORT || 5000

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe configurarse con al menos 32 caracteres.')
  }
  await connectDatabase()
  await ensureAdmin()
  app.listen(port, () => console.log(`AgroVet API disponible en http://localhost:${port}`))
} catch (error) {
  console.error('No fue posible iniciar AgroVet:', error.message)
  process.exit(1)
}
