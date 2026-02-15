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
    res.status(400).json({ message: err.message })
  }
}

export async function userInterfaces(req, res){
  const permissions = req.user.permissions
  const user = {
    id: req.user._id,
    name: req.user.name,
    pic_url: req.user.pic_url,
    username: req.user.username,
    isActive: req.user.isActive,
    roles: req.user.roles,
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

export async function updateAccount(req, res){
  const data = await AppService.updateProfile(req.user._id, req.body)
  res.json({
    status: 'success',
    data
  })
}

export async function updatePic(req, res, next){
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/storage/picture/${req.file.filename}`;
    const data = await AppService.updateProfile(req.user._id, {
      pic_url: fileUrl
    })
    res.json({
      status: 'success',
      data
    })
  } catch (err) {
    next(err);
  }
}