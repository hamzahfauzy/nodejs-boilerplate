const menus = new Map()
const pages = new Map()

export default {
    registerMenu(key, config){
        menus.set(key, config)
    },
    getMenu(key){
        return menus.get(key)
    },
    getAllMenus(){
        return Object.fromEntries(menus)
    },
    registerPage(key, config){
        pages.set(key, config)
    },
    getPage(key){
        return pages.get(key)
    },
    getAllPages(){
        return Object.fromEntries(pages)
    }
}