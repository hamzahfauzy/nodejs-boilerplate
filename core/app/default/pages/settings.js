export default {
    title: 'Setting',
    path: 'settings',
    permission: "settings.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/collection/settings',
            create: { 
                label: 'Create', icon: 'plus', permission: "settings.create", title: "Create Setting",
                modalClass: 'modal-md',
                fields: [
                    { name: "label", label: "Label", type: "text", className: 'col-md-6' },
                    { name: "key", label: "Key", type: "text", className: 'col-md-6' },
                    { name: "value", label: "Value", type: "text" },
                ]
            },
            actions: [
                { 
                    label: 'Edit', type: 'edit', icon: 'edit-2', permission: "settings.update", title: "Edit Setting",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "label", label: "Label", type: "text", className: 'col-md-6' },
                        { name: "key", label: "Key", type: "text", className: 'col-md-6' },
                        { name: "value", label: "Value", type: "text" },
                    ]
                },
                { label: 'Delete', type: 'delete', icon: 'trash', class:'text-danger', permission: "settings.delete"},
            ],

            columns: [
                { key: "label", label: "Label", sortable: true, searchable: true },
                { key: "key", label: "Key", sortable: true, searchable: true },
                { key: "value", label: "Value", sortable: true, searchable: true },
                { key: "createdAt", label: "Created At", sortable: true,type: "date" },
                { key: "updatedAt", label: "Updated At", sortable: true,type: "date" },
            ],
        }
    }
}