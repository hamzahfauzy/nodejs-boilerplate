export default {
    title: "People",
    path: 'people',
    permission: "people.list",
    content: {
        type: "crud",
        value: {
            endpoint: '/table/people',
            create: { 
                label: 'Create', icon: 'plus', permission: "people.create", title: "Create People",
                modalClass: "modal-lg",
                fields: [
                    { name: "code", label: "Code", type: "text", className: 'col-md-6' },
                    { name: "identity_number", label: "Identity Number", type: "text", className: 'col-md-6' },
                    { name: "first_name", label: "First Name", type: "text", className: 'col-md-6' },
                    { name: "last_name", label: "Last Name", type: "text", className: 'col-md-6' },
                    { name: "gender", label: "Gender", type: "select", options: [{label: 'Male', value: 'male'}, {label: 'Female', value: 'female'}] },
                    { name: "birth_date", label: "Birth Date", type: "datePicker", className: 'col-md-6' },
                    { name: "birth_place", label: "Birth Place", type: "text", className: 'col-md-6' },
                    { name: "email", label: "Email", type: "text", className: 'col-md-6' },
                    { name: "phone", label: "Phone", type: "text", className: 'col-md-6' },
                    { name: "address", label: "Address", type: "textArea", className: 'col-md-12' },
                    { name: "city", label: "City", type: "text", className: 'col-md-6' },
                    { name: "state", label: "State", type: "text", className: 'col-md-6' },
                    { name: "postal_code", label: "Postal Code", type: "text", className: 'col-md-6' },
                    { name: "country", label: "Country", type: "text", className: 'col-md-6' },
                    { name: "status", label: "Status", type: "select", defaultValue: 'active', options: [
                        {label: 'Active', value: 'active'},
                        {label: 'Inactive', value: 'inactive'},
                        {label: 'Deceased', value: 'deceased'},
                        {label: 'Archived', value: 'archived'},
                    ] },
                ]
            },
            actions: [
                { 
                    label: 'Detail', type: 'view', icon: 'eye', permission: "people.single", title: 'People Detail',
                    modalClass: "modal-lg",
                    fields: [
                        { name: "code", label: "Code", type: "text" },
                        { name: "identity_number", label: "Identity Number", type: "text" },
                        { name: "full_name", label: "Full Name", type: "text" },
                        { name: "gender", label: "Gender", type: "text" },
                        { name: "birth_date", label: "Birth Date", type: "text" },
                        { name: "birth_place", label: "Birth Place", type: "text" },
                        { name: "email", label: "Email", type: "text" },
                        { name: "phone", label: "Phone", type: "text" },
                        { name: "address", label: "Address", type: "text" },
                        { name: "city", label: "City", type: "text" },
                        { name: "postal_code", label: "Postal Code", type: "text" },
                        { name: "country", label: "Country", type: "text" },
                        { name: "status", label: "Status", type: "status-badge", 
                            badge: {
                                color:{'active': 'success', 'inactive': 'warning', 'deceased': 'secondary', 'archived': 'danger'}, 
                                label:{'active':'Active', 'inactive':'Inactive', 'deceased': 'Deceased', 'archived': 'Archived'}
                            }
                        },
                        { name: "created_at", label: "Created At", type: "date" },
                        { name: "updated_at", label: "Updated At", type: "date" },
                    ]
                },
                { 
                    label: 'Edit', type: 'edit', icon: 'edit-2', permission: "people.update", title: "Edit People",
                    modalClass: "modal-lg",
                    fields: [
                        { name: "code", label: "Code", type: "text", className: 'col-md-6' },
                        { name: "identity_number", label: "Identity Number", type: "text", className: 'col-md-6' },
                        { name: "first_name", label: "First Name", type: "text", className: 'col-md-6' },
                        { name: "last_name", label: "Last Name", type: "text", className: 'col-md-6' },
                        { name: "gender", label: "Gender", type: "select", options: [{label: 'Male', value: 'male'}, {label: 'Female', value: 'female'}] },
                        { name: "birth_date", label: "Birth Date", type: "datePicker", className: 'col-md-6' },
                        { name: "birth_place", label: "Birth Place", type: "text", className: 'col-md-6' },
                        { name: "email", label: "Email", type: "text", className: 'col-md-6' },
                        { name: "phone", label: "Phone", type: "text", className: 'col-md-6' },
                        { name: "address", label: "Address", type: "textArea", className: 'col-md-12' },
                        { name: "city", label: "City", type: "text", className: 'col-md-6' },
                        { name: "state", label: "State", type: "text", className: 'col-md-6' },
                        { name: "postal_code", label: "Postal Code", type: "text", className: 'col-md-6' },
                        { name: "country", label: "Country", type: "text", className: 'col-md-6' },
                        { name: "status", label: "Status", type: "select", defaultValue: 'active', options: [
                            {label: 'Active', value: 'active'},
                            {label: 'Inactive', value: 'inactive'},
                            {label: 'Deceased', value: 'deceased'},
                            {label: 'Archived', value: 'archived'},
                        ] },
                    ]
                },
                { label: 'Delete', type: 'delete', icon: 'trash', class: 'text-danger', permission: "people.delete"},
            ],
            search: { label: "Cari..."},

            columns: [
                { key: "code", label: "Code", sortable: true, searchable: true },
                { key: "identity_number", label: "Identity Number", sortable: true, searchable: true },
                { key: "full_name", label: "Full Name", sortable: true, searchable: true },
                { key: "gender", label: "Gender", sortable: true, searchable: true },
                { key: "email", label: "Email", sortable: true, searchable: true },
                { key: "status", label: "Status", sortable: true, searchable: true, type: "status-badge", 
                    badge: {
                        color:{'active': 'success', 'inactive': 'warning', 'deceased': 'secondary', 'archived': 'danger'}, 
                        label:{'active':'Active', 'inactive':'Inactive', 'deceased': 'Deceased', 'archived': 'Archived'}
                    }
                },
            ],
            filters: [
                { key: "status", type: "options", label: "Status", placeholder: 'All Status', options: [
                    {label: 'Active', value: 'active'},
                    {label: 'Inactive', value: 'inactive'},
                    {label: 'Deceased', value: 'deceased'},
                    {label: 'Archived', value: 'archived'},
                ] },
            ]
        }
    }
}