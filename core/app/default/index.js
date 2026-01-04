import users from './collections/user.js'
import roles from './collections/roles.js'
import user_roles from './collections/user_roles.js'
import role_permissions from './collections/role_permissions.js'
import permissions from './collections/permissions.js'
import settings from './collections/settings.js'
import menu from './config/menu.js'
import page from './config/page.js'

const collectionSchema = [
    users,
    roles,
    permissions,
    user_roles,
    role_permissions,
    settings
]

export default {
    // context {register, ui, db}
    init(context){
        collectionSchema.forEach(collection => {
            context.register.collection(collection.name, collection) 
        })

        for(const m in menu) {
            context.ui.registerMenu(m, menu[m])
        }
        
        for(const p in page) {
            context.ui.registerPage(p, page[p])
        }
    }
}