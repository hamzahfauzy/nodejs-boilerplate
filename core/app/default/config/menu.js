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
    documents: {
        label: 'Documents',
        icon: 'file',
        route: '/documents',
        permission: "documents.list",
        activeState:['/documents'],
    },
    users: {
        label: "Users",
        icon: "users",
        permission: "users.list",
        // route: "/users",
        activeState:['/users', '/roles', '/permissions'],
        children: {
            users: {
                label: "All Users",
                icon: "users",
                route: "/users",
                permission: "users.list",
                activeState:['/users'],
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
            },
        }
    },
    
    settings: {
        label: "Settings",
        icon: "settings",
        route: "/settings",
        permission: "settings.list",
        activeState:['/settings'],
    },
    activities: {
        label: "Activities",
        icon: "activity",
        route: "/activities",
        permission: "log_activities.list",
        activeState:['/activities'],
    }
}