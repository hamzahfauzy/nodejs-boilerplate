export default {
    title: "Permissions Management",
    path: 'permissions',
    permission: "permissions.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/collection/permissions',
            create: { 
                label: 'Create', icon: 'plus', permission: "permissions.create", title: "Create Permission",
                modalClass: 'modal-md',
                fields: [
                    { name: "key", label: "Key", type: "text", className: 'col-md-6' },
                    { name: "label", label: "Label", type: "text", className: 'col-md-6' },
                    { name: "plugin", label: "Plugin", type: "text" },
                    { name: "description", label: "Description", type: "text" },
                ]
            },
            actions: [
                { 
                    label: 'Edit', type: 'edit', icon: 'edit-2', permission: "permissions.update", title: "Edit Permission",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "key", label: "Key", type: "text", className: 'col-md-6' },
                        { name: "label", label: "Label", type: "text", className: 'col-md-6' },
                        { name: "plugin", label: "Plugin", type: "text" },
                        { name: "description", label: "description", type: "text" },
                    ]
                },
                { label: 'Delete', type: 'delete', icon: 'trash', class:'text-danger', permission: "permissions.delete"},
            ],

            columns: [
                { key: "key", label: "Key", sortable: true, searchable: true },
                { key: "label", label: "Label", sortable: true, searchable: true },
                { key: "plugin", label: "Plugin", sortable: true, searchable: true },
                { key: "description", label: "Description", sortable: true, searchable: true },
                { key: "createdAt", label: "Created At", sortable: true,type: "date" },
                { key: "updatedAt", label: "Updated At", sortable: true,type: "date" },
            ],
        }
    }
}