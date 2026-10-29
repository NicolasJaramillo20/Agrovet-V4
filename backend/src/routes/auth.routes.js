import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = Router()
const publicUser = (user) => ({
  _id: user._id,
  nombre: user.nombre,
  usuario: user.usuario,
  correo: user.correo,
  rol: user.rol,
  telefono: user.telefono,
  direccion: user.direccion,
  fecha_registro: user.fecha_registro,
})

router.post('/register', async (req, res, next) => {
  try {
    const { nombre, usuario, correo, password, telefono = '', direccion = '' } = req.body
    if (
      typeof nombre !== 'string' || !nombre.trim()
      || typeof usuario !== 'string' || usuario.trim().length < 3
      || typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
      || typeof password !== 'string'
    ) {
      return res.status(400).json({ message: 'Nombre, usuario, correo y contraseña son obligatorios.' })
    }
    if (telefono !== undefined && typeof telefono !== 'string') return res.status(400).json({ message: 'El teléfono no es válido.' })
    if (direccion !== undefined && typeof direccion !== 'string') return res.status(400).json({ message: 'La dirección no es válida.' })
    if (password.length < 8) return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' })
    const exists = await Usuario.findOne({ $or: [{ correo: correo.toLowerCase() }, { usuario: usuario.toLowerCase() }] })
    if (exists) return res.status(409).json({ message: 'Ese correo o nombre de usuario ya está registrado.' })
    const user = await Usuario.create({
      nombre, usuario, correo, telefono, direccion,
      password: await bcrypt.hash(password, 12),
    })
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.status(201).json({ token, user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { identificador, password } = req.body
    if (typeof identificador !== 'string' || !identificador.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Ingresa usuario o correo y contraseña.' })
    }
    const user = await Usuario.findOne({
      $or: [{ correo: identificador.toLowerCase() }, { usuario: identificador.toLowerCase() }],
    }).select('+password')
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' })
    }
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token, user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }))

router.put('/profile', protect, async (req, res, next) => {
  try {
    const { nombre, telefono, direccion, password } = req.body
    if (nombre !== undefined) req.user.nombre = nombre
    if (telefono !== undefined) req.user.telefono = telefono
    if (direccion !== undefined) req.user.direccion = direccion
    if (password) {
      if (password.length < 8) return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' })
      req.user.password = await bcrypt.hash(password, 12)
    }
    await req.user.save()
    return res.json({ user: publicUser(req.user) })
  } catch (error) {
    next(error)
  }
})

export default router
