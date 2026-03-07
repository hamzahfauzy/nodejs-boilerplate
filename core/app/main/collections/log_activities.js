import mongoose from "mongoose"

const responseFields = {
    _id: {},
    user: {searchable: true},
    method: {searchable: true},
    url: {searchable: true},
    ip_address: {searchable: true},
    user_agent: {searchable: true},
    request_data: {},
    old_data: {},
    new_data: {},
    createdAt: {},
    updatedAt: {}
}

const log_activities = {
    name: 'log_activities',
    schema: {
        fields: {
            user: mongoose.Schema.Types.Mixed,
            method: String,
            url: String,
            request_data: mongoose.Schema.Types.Mixed,
            old_data: mongoose.Schema.Types.Mixed,
            new_data: mongoose.Schema.Types.Mixed,
            ip_address: String,
            user_agent: String
        },
        options: {
            timestamps: true
        }
    },
    permissions: ['log_activities.list','log_activities.single'],
    response: {
        list: responseFields,
        single: responseFields
    },
    hooks: {
        queryList: context => {
            if(context.req.query.order.column == '_id')
            {
                context.req.query.order.column = 'createdAt'
                context.req.query.order.dir = 'desc'
            }
        }
    }
}

export default log_activities