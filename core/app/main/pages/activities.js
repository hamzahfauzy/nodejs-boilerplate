export default {
    title: 'Log Activity',
    path: 'activities',
    permission: "log_activities.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/collection/log_activities',
            create: false,
            actions: [
                { 
                    label: 'Detail', type: 'view', icon: 'eye', permission: "log_activities.single", title: 'Detail Acivity',
                    fields: [
                        { name: "user.name", label: "User", type: "text" },
                        { name: "method", label: "Method", type: "text" },
                        { name: "url", label: "URL", type: "text" },
                        { name: "request_data", label: "Request Data", type: "object" },
                        { name: "ip_address", label: "IP Address", type: "text" },
                        { name: "user_agent", label: "User Agent", type: "text" },
                        { name: "createdAt", label: "Created At", type: "date" },
                    ]
                },
            ],
            columns: [
                { key: "createdAt", label: "Created At", sortable: true,type: "date" },
                { key: "user.name", label: "User", sortable: true, searchable: true },
                { key: "method", label: "Method", sortable: true, searchable: true },
                { key: "ip_address", label: "IP Address", sortable: true, searchable: true },
                { key: "url", label: "URL", sortable: true, searchable: true },
            ],
        }
    }
}