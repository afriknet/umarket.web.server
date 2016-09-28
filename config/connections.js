
module.exports.connections = {
    // sails-disk is installed by default.
    localDiskDb: {
        adapter: 'sails-disk'
    },
    memory: {
        adapter: 'sails-memory'
    },

    mssql_connection: {

        config: {
            dbName: 'DB_9E3241_seyaobey',
            user: 'DB_9E3241_seyaobey_admin',
            password:'JazzTheSoul1.'
        },
        extra: {
            host: 'SQL5017.Smarterasp.net',
            dialect: 'mssql',
            dialectOptions: {
                //instanceName: 'SQL5017.Smarterasp.net'
            }
        }
    }
};