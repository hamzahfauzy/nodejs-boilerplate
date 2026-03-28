
export default {
    // context {register, ui, db}
    init(context){
        const menus = {
            label: 'Default',
            name: 'default',
            isSection: true,
            children: {
                // documents: {
                //     label: 'Documents',
                //     icon: 'file',
                //     route: '/documents',
                //     permission: "documents.list",
                //     activeState:['/documents'],
                // },

                categories: {
                    label: 'Categories',
                    route: '/categories',
                    icon: "sliders",
                    permission: "categories.list",
                    activeState:['/categories'],
                },
                people: {
                    label: 'People',
                    icon: "users",
                    route: '/people',
                    permission: "people.list",
                    activeState:['/people'],
                },
                
                users: {
                    label: "Users",
                    icon: "users",
                    permission: "users.list",
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
                
                // settings: {
                //     label: "Settings",
                //     icon: "settings",
                //     route: "/settings",
                //     permission: "settings.list",
                //     activeState:['/settings']
                // },

                activities: {
                    label: "Activities",
                    icon: "activity",
                    route: "/activities",
                    permission: "log_activities.list",
                    activeState:['/activities'],
                }
            }
        }

        context.ui.registerMenu('default', menus)

    },
}