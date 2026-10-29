import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 100 },
  usuario: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 40 },
  correo: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, required: true, select: false },
  rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
  telefono: { type: String, trim: true, default: '' },
  direccion: { type: String, trim: true, default: '' },
  fecha_registro: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Usuario', userSchema)
