import { Router } from 'express'
import Usuario from '../models/User.js'
import Mascota from '../models/Pet.js'
import Cita from '../models/Appointment.js'
import Producto from '../models/Product.js'
import Pedido from '../models/Order.js'
import { adminOnly, protect } from '../middleware/auth.js'

const router = Router()
router.use(protect, adminOnly)
router.get('/stats', async (_req, res, next) => {
  try {
    const [usuarios, mascotas, citasPendientes, productos] = await Promise.all([
      Usuario.countDocuments(), Mascota.countDocuments(),
      Cita.countDocuments({ estado: 'pendiente' }), Producto.countDocuments(),
    ])
    return res.json({ usuarios, mascotas, citasPendientes, productos })
  } catch (error) { next(error) }
})
router.get('/users', async (_req, res, next) => {
  try {
    const users = await Usuario.find().select('-password').sort({ fecha_registro: -1 })
    return res.json(users)
  } catch (error) { next(error) }
})
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    if (!['usuario', 'admin'].includes(req.body.rol)) return res.status(400).json({ message: 'Rol no válido.' })
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'No puedes cambiar tu propio rol.' })
    const user = await Usuario.findByIdAndUpdate(req.params.id, { rol: req.body.rol }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' })
    return res.json(user)
  } catch (error) { next(error) }
})
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' })
    const user = await Usuario.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' })
    await Promise.all([
      Mascota.deleteMany({ id_usuario: user._id }),
      Cita.deleteMany({ id_usuario: user._id }),
      Pedido.deleteMany({ id_usuario: user._id }),
    ])
    return res.json({ message: 'Usuario eliminado.' })
  } catch (error) { next(error) }
})
export default router
