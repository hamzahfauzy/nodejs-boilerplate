// core/auth/auth.controller.js
import * as AppService from './app.service.js'
import ui from './app.ui.js'

export async function register(req, res) {
  try {
    const user = await AppService.register(req.body)
    res.json({ success: true, userId: user._id })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export async function login(req, res) {
  try {
    const result = await AppService.login(req.body)
    res.json(result)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export async function userInterfaces(req, res){
  const permissions = req.user.permissions
  const user = {
    id: req.user._id,
    name: req.user.name,
    username: req.user.username,
    permissions
  }

  const menus = ui.getAllMenus()
  const pages = ui.getAllPages()
  const data = {
    user,
    menus,
    pages,
  }
  res.json({
    data,
    message: 'ui response here'
  })
}
