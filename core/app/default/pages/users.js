export default {
    title: "Users Management",
    path: 'users',
    permission: "users.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/collection/users',
            create: { 
                label: 'Create', icon: 'plus', permission: "users.create", title: "Create User",
                modalClass: 'modal-md',
                fields: [
                    { name: "name", label: "Name", type: "text" },
                    { name: "username", label: "Username", type: "text", className: 'col-md-6' },
                    { name: "password", label: "Password", type: "password", className: 'col-md-6' },
                    { name: "isActive", label: "Status", type: "select", options: [{label: 'Active', value: 1}, {label: 'Inactive', value: 0}] },
                    { name: "roles", label: "Role", type: "multiCheckbox", options: {url: '/collection/roles', map: {label: 'name', value: '_id'}} },
                ]
            },
            actions: [
                { 
                    label: 'Detail', type: 'view', icon: 'eye', permission: "users.single", title: 'Detail Pengguna',
                    fields: [
                        { name: "name", label: "Name", type: "text" },
                        { name: "username", label: "Username", type: "text" },
                        { name: "isActive", label: "Status", type: "status-badge", 
                            badge: {
                                color:{'1': 'success', '0': 'danger'}, 
                                label:{'1':'Active', '0':'Inactive'}
                            }
                        },
                        { name: "roles", label: "Role", type: "multi-badge", badge: {color: "success", labelKey: "name"} },
                        { name: "createdAt", label: "Created At", type: "date" },
                        { name: "updatedAt", label: "Updated At", type: "date" },
                    ]
                },
                { 
                    label: 'Edit', type: 'edit', icon: 'edit-2', permission: "users.update", title: "Edit User",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "name", label: "Name", type: "text" },
                        { name: "username", label: "Username", type: "text", className: 'col-md-6' },
                        { name: "password", label: "Password", type: "password", className: 'col-md-6' },
                        { name: "isActive", label: "Status", type: "select", options: [{label: 'Aktif', value: 1}, {label: 'Tidak Aktif', value: 0}] },
                        { name: "roleIds", label: "Roles", type: "multiCheckbox", options: {url: '/collection/roles', map: {label: 'name', value: '_id'}} },
                        { name: "pic_url", label: "Foto", type: "text",  },
                    ]
                },
                { label: 'Delete', type: 'delete', icon: 'trash', class: 'text-danger', permission: "users.delete"},
            ],
            search: { label: "Cari..."},

            columns: [
                { key: "name", label: "Name", sortable: true, searchable: true },
                { key: "username", label: "Username", sortable: true, searchable: true },
                { key: "isActive", label: "Status", sortable: true, searchable: true, type: "status-badge", 
                    badge: {
                        color:{'1': 'success', '0': 'danger'}, 
                        label:{'1':'Active', '0':'Inactive'}
                    }
                },
                { key: "roles", label: "Roles", searchable: false, type: "multi-badge", badge: {color: "success", labelKey: "name"} },
                { key: "createdAt", label: "Created At", sortable: true,type: "date" },
                { key: "updatedAt", label: "Updated At", sortable: true,type: "date" },
            ],
            filters: [
                { key: "isActive", type: "options", label: "Status", placeholder: 'All Status', options: [{label: 'Active', value: 1},{label: 'Inactive', value: 0}] },
            ]
        }
    }
}