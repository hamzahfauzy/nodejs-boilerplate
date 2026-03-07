export default {
    title: "Categories",
    path: 'categories',
    permission: "categories.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/table/categories',
            create: { 
                label: 'Create', icon: 'plus', permission: "categories.create", title: "Create Category",
                modalClass: 'modal-md',
                fields: [
                    { name: "name", label: "Name", type: "text"},
                    { name: "record_type", label: "Record Type", type: "text"},
                ]
            },
            actions: [
                { 
                    label: 'Edit', type: 'edit', icon: 'edit-2', permission: "categories.update", title: "Edit Category",
                    modalClass: 'modal-md',
                    fields: [
                        { name: "name", label: "Name", type: "text"},
                        { name: "record_type", label: "Record Type", type: "text"},
                    ]
                },
                { label: 'Delete', type: 'delete', icon: 'trash', class:'text-danger', permission: "categories.delete"},
            ],

            columns: [
                { key: "name", label: "Name", sortable: true, searchable: true },
                { key: "record_type", label: "Record Type", sortable: true, searchable: true },
                { key: "created_at", label: "Created At", sortable: true,type: "date" },
                { key: "updated_at", label: "Updated At", sortable: true,type: "date" },
            ],
        }
    }
}