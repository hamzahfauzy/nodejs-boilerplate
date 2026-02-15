export default {
    title: "Roles Management",
    path: 'roles',
    permission: "roles.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/collection/roles',
            create: { 
                label: 'Create', icon: 'plus', permission: "roles.create", title: "Create Role",
                modalClass: 'modal-md',
                fields: [
                    { name: "name", label: "Name", type: "text" },
                    { name: "permissions", label: "Permission", type: "multiCheckbox", options: {url: '/collection/permissions?nolimit=1', map: {label: 'label', value: '_id'}} },
                ]
            },
            actions: [
                { 
                    label: 'Edit', type: 'edit', icon: 'edit-2', permission: "roles.update", title: "Edit Role",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "name", label: "Name", type: "text" },
                        { name: "permissionIds", label: "Permission", type: "multiCheckbox", options: {url: '/collection/permissions?nolimit=1', map: {label: 'label', value: '_id'}} },
                    ],
                },
                { label: 'Hapus', type: 'delete', icon: 'trash', class:'text-danger', permission: "roles.delete"},
            ],

            columns: [
                { key: "name", label: "Name", sortable: true, searchable: true },
                { key: "permissions", label: "Permission", searchable: false, type: "multi-badge", badge: {color: "info", labelKey: "label"} },
                { key: "createdAt", label: "Created At", sortable: true,type: "date" },
                { key: "updatedAt", label: "Updated At", sortable: true,type: "date" },
            ],
        }
    }
}