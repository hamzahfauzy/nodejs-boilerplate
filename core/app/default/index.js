import users from './collections/user.js'
import roles from './collections/roles.js'
import user_roles from './collections/user_roles.js'
import role_permissions from './collections/role_permissions.js'
import permissions from './collections/permissions.js'
import settings from './collections/settings.js'
import log_activities from './collections/log_activities.js'
import menu from './config/menu.js'
import page from './config/page.js'
import document_shares from './databases/model/document_shares.js'
import document_versions from './databases/model/document_versions.js'
import documents from './databases/model/documents.js'
import { documentRouter } from './documents.js'

const collectionSchema = [
    users,
    roles,
    permissions,
    user_roles,
    role_permissions,
    settings,
    log_activities
]

const tables = [
    documents,
    document_shares,
    document_versions
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

        for(const t in tables)
        {
            context.register.table(tables[t].name, tables[t])
        }

        context.register.migration('default', 'core/app/default/databases/migrations')

        context.register.route('documents', documentRouter)
    }
}