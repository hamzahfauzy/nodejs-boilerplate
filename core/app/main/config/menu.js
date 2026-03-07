export default {
    dashboard: {
        label: 'Dashboard',
        icon: 'home',
        route: '/dashboard',
        page: 'dashboard',
        permission: 'dashboard.view'
    },
    master: {
        label: "Master Data",
        icon: "layers",
        permissions: ["people.list",'categories.list'],
        activeState:['/people','/categories'],
        children: {
            categories: {
                label: 'Categories',
                route: '/categories',
                permission: "categories.list",
                activeState:['/categories'],
            },
            people: {
                label: 'People',
                route: '/people',
                permission: "people.list",
                activeState:['/people'],
            },
        }
    },
}