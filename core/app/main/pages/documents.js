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
                    { 
                        name: "parent_id", type: "hidden",
                        defaultValue: 'parent_id',
                        defaultFrom: 'queryParam'
                    },
                ]
            },
            actions: [
                { 
                    label: 'View File', type: 'link', icon: 'eye', permission: "documents.single", title: 'View File', show_if: {field: 'type', operator: 'equals', value: 'file'},
                    to: {value: 'file_url'}, 
                },
                { 
                    label: 'Open Folder', type: 'link', icon: 'eye', permission: "documents.single", title: 'View File', show_if: {field: 'type', operator: 'equals', value: 'folder'},
                    to: {path: '/page/documents', query: {filters: {parent_id: 'id'}}}, 
                },
                { 
                    label: 'Detail', type: 'view', icon: 'eye', permission: "documents.single", title: 'Detail Document',
                    fields: [
                        { name: "name", label: "Name", type: "text" },
                        { name: "owner_name", label: "Owner", type: "text" },
                        { name: "readable_size", label: "Size", type: "text" },
                        { name: "file_url", label: "File", type: "link", linkLabel: 'View File', show_if: {field: 'type', operator: 'equals', value: 'file'} },
                        { name: "created_at", label: "Created At", type: "date" },
                    ]
                },
                { label: 'Delete', type: 'delete', icon: 'trash', class: 'text-danger', permission: "documents.delete"},
            ],
            columns: [
                { key: "name", label: "Name", sortable: true, searchable: true },
                { key: "owner_name", label: "Owner", sortable: false, searchable: false },
                { key: "readable_size", label: "Size" },
                { key: "created_at", label: "Created At", sortable: true, type: "date" },
            ],
        }
    }
}