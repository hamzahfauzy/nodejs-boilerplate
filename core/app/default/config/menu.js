export default {
    dashboard: {
        label: 'Dashboard',
        icon: 'home',
        route: '/dashboard',
        page: 'dashboard',
        permission: 'dashboard.view'
    },
    default: {
        label: 'Default',
        isTitle: true
    },
    users: {
        label: "Users",
        icon: "users",
        permission: "users.list",
        route: "/users",
        activeState:['/users']
    },
    roles: {
        label: "Roles",
        icon: "award",
        route: "/roles",
        permission: "roles.list",
        activeState:['/roles'],
    },
    permissions: {
        label: "Permissions",
        icon: "tag",
        route: "/permissions",
        permission: "permissions.list",
        activeState:['/permissions'],
    }
}