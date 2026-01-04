export default {
    dashboard: {
        title: 'Dashboard',
        path: 'dashboard',
        permission: "dashboard.view",
        content: {
            type: "html",
            value: "<h2>Dashboard</h2><p>this is dashboard page</p>"
        }
    },
    'users.list': {
        title: "Manajemen User",
        path: 'users',
        permission: "users.list",
        content: {
            type: "crud",
            value: {
                endpoint: '/collection/users',
                create: { 
                    label: 'Tambah', icon: 'plus', permission: "users.create", title: "Tambah Data Pengguna",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "name", label: "Nama", type: "text" },
                        { name: "username", label: "Username", type: "text", className: 'col-md-6' },
                        { name: "password", label: "Kata Sandi", type: "password", className: 'col-md-6' },
                        { name: "isActive", label: "Status", type: "select", options: [{label: 'Aktif', value: 1}, {label: 'Tidak Aktif', value: 0}] },
                        { name: "roles", label: "Peran", type: "multiCheckbox", options: {url: '/collection/roles', map: {label: 'name', value: '_id'}} },
                    ]
                },
                actions: [
                    { 
                        label: 'Lihat', type: 'view', icon: 'eye', permission: "users.single", title: 'Detail Pengguna',
                        fields: [
                            { name: "name", label: "Nama", type: "text" },
                            { name: "username", label: "Username", type: "text" },
                            { name: "isActive", label: "Status", type: "status-badge", 
                                badge: {
                                    color:{'1': 'success', '0': 'danger'}, 
                                    label:{'1':'Aktif', '0':'Tidak Aktif'}
                                }
                            },
                            { name: "roles", label: "Peran", type: "multi-badge", badge: {color: "success", labelKey: "name"} },
                        ]
                    },
                    { 
                        label: 'Edit', type: 'edit', icon: 'edit-2', permission: "users.update", title: "Edit Data Pengguna",
                        modalClass: 'modal-md',
                        fields: [
                            { name: "name", label: "Nama", type: "text" },
                            { name: "username", label: "Username", type: "text", className: 'col-md-6' },
                            { name: "password", label: "Kata Sandi", type: "password", className: 'col-md-6' },
                            { name: "isActive", label: "Status", type: "select", options: [{label: 'Aktif', value: 1}, {label: 'Tidak Aktif', value: 0}] },
                            { name: "roleIds", label: "Peran", type: "multiCheckbox", options: {url: '/collection/roles', map: {label: 'name', value: '_id'}} },
                        ]
                    },
                    { label: 'Hapus', type: 'delete', icon: 'trash', class: 'text-danger', permission: "users.delete"},
                ],
                search: { label: "Cari..."},

                columns: [
                    { key: "name", label: "Nama", sortable: true, searchable: true },
                    { key: "username", label: "Username", sortable: true, searchable: true },
                    { key: "isActive", label: "Status", sortable: true, searchable: true, type: "status-badge", 
                        badge: {
                            color:{'1': 'success', '0': 'danger'}, 
                            label:{'1':'Aktif', '0':'Tidak Aktif'}
                        }
                    },
                    { key: "roles", label: "Peran", searchable: false, type: "multi-badge", badge: {color: "success", labelKey: "name"} },
                ],
                filters: [
                    { key: "isActive", type: "options", label: "Status", placeholder: 'Semua', options: [{label: 'Aktif', value: 1},{label: 'Tidak Aktif', value: 0}] },
                ]
            }
        }
    },
    'roles.list': {
        title: "Manajemen Peran",
        path: 'roles',
        permission: "roles.list",
        content: {
            type: "crud",
            value: {
                endpoint: '/collection/roles',
                create: { 
                    label: 'Tambah', icon: 'plus', permission: "roles.create", title: "Tambah Data Peran",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "name", label: "Nama", type: "text" },
                        { name: "permissions", label: "Permission", type: "multiCheckbox", options: {url: '/collection/permissions', map: {label: 'label', value: '_id'}} },
                    ]
                },
                search: { label: "Cari..."},
                actions: [
                    { 
                        label: 'Edit', type: 'edit', icon: 'edit-2', permission: "roles.update", title: "Edit Data Peran",
                        modalClass: 'modal-md',
                        fields: [
                            { name: "name", label: "Nama", type: "text" },
                            { name: "permissionIds", label: "Permission", type: "multiCheckbox", options: {url: '/collection/permissions', map: {label: 'label', value: '_id'}} },
                        ],
                    },
                    { label: 'Hapus', type: 'delete', icon: 'trash', class:'text-danger', permission: "roles.delete"},
                ],

                columns: [
                    { key: "name", label: "Nama", sortable: true, searchable: true },
                    { key: "permissions", label: "Permission", searchable: false, type: "multi-badge", badge: {color: "info", labelKey: "label"} },
                ],
            }
        }
    },
    'permissions.list': {
        title: "Manajemen Permission",
        path: 'permissions',
        permission: "permissions.list",
        content: {
            type: "crud",
            value: {
                endpoint: '/collection/permissions',
                create: { 
                    label: 'Tambah', icon: 'plus', permission: "permissions.create", title: "Tambah Data Permission",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "key", label: "Key", type: "text", className: 'col-md-6' },
                        { name: "label", label: "Label", type: "text", className: 'col-md-6' },
                        { name: "plugin", label: "Plugin", type: "text" },
                        { name: "description", label: "description", type: "text" },
                    ]
                },
                search: { label: "Cari..."},
                actions: [
                    { 
                        label: 'Edit', type: 'edit', icon: 'edit-2', permission: "permissions.update", title: "Edit Data Permission",
                        modalClass: 'modal-md',
                        fields: [
                            { name: "key", label: "Key", type: "text", className: 'col-md-6' },
                            { name: "label", label: "Label", type: "text", className: 'col-md-6' },
                            { name: "plugin", label: "Plugin", type: "text" },
                            { name: "description", label: "description", type: "text" },
                        ]
                    },
                    { label: 'Hapus', type: 'delete', icon: 'trash', class:'text-danger', permission: "permissions.delete"},
                ],

                columns: [
                    { key: "key", label: "Key", sortable: true, searchable: true },
                    { key: "label", label: "Label", sortable: true, searchable: true },
                    { key: "plugin", label: "Plugin", sortable: true, searchable: true },
                    { key: "description", label: "Description", sortable: true, searchable: true }
                ],
            }
        }
    }
}