export default {
    title: 'Documents',
    path: 'documents',
    permission: "documents.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/table/documents',
            create: { 
                label: 'Create Folder', icon: 'plus', permission: "documents.create", title: "Create Folder",
                modalClass: 'modal-md',
                fields: [
                    { name: "name", label: "Folder Name", type: "text" },
                ]
            },
            actions: [
                { 
                    label: 'Detail', type: 'view', icon: 'eye', permission: "documents.single", title: 'Detail Document',
                    fields: [
                        { name: "name", label: "Name", type: "text" },
                        { name: "user_id", label: "Owner", type: "text" },
                        { name: "size", label: "Size", type: "text" },
                        { name: "created_at", label: "Created At", type: "date" },
                    ]
                },
                { label: 'Delete', type: 'delete', icon: 'trash', class: 'text-danger', permission: "documents.delete"},
            ],
            columns: [
                { key: "name", label: "Name", sortable: true, searchable: true },
                { key: "owner_name", label: "Owner", sortable: false, searchable: false },
                { key: "size", label: "Size", sortable: true, searchable: true },
                { key: "created_at", label: "Created At", sortable: true, type: "date" },
            ],
        }
    }
}