
var root = require('root-path');

import ctx = require('../appcontext');
import Q = require('q');
var br_sequel = require(root('/server/breeze_sequel/main'));
var sequel_manager = br_sequel.SequelizeManager;
var sequel_query = br_sequel.SequelizeQuery;
var sequel_save = br_sequel.SequelizeSaveHandler;
var __sequel = require('sequelize');
import utils = require('./utils');
import _ = require('lodash');
import Store = require('./store');
import breeze = require('breeze-client');
require('./adapter');


br_sequel.breeze.config.initializeAdapterInstance('dataService', 'adapter_webApi', true);



export class DataService {

    private context: ctx.AppContext;
    private model: string;

    constructor(context: ctx.AppContext, model: string) {
        this.context = context;
        this.model = model;
    }


    private __dm: breeze.EntityManager;
    get datasource(): breeze.EntityManager {

        if (!this.__dm) {
            this.__dm = new breeze.EntityManager({
                dataService: new breeze.DataService({
                    serviceName: this.model,
                    hasServerMetadata: false
                })
            });
            this.__dm.metadataStore.importMetadata(Store.ModelStore.exportMetadata());
        }
        return this.__dm;
    }


    private __fill_entityManager(data: any[]) {

        var that = this;

        data.forEach(e => {

            this.datasource.createEntity(this.model, e, breeze.EntityState.Unchanged, breeze.MergeStrategy.OverwriteChanges);
        });
    }


    private __execQuery(query: breeze.EntityQuery): Q.Promise<any> {

        var d = Q.defer<any>();


        var qry = new sequel_query(this.context.conn, query);


        qry.execute().then(rst => {
            d.resolve(rst);
        });


        return d.promise;
    }


    fetch(query: breeze.EntityQuery): Q.Promise<any[]> {

        var d = Q.defer<any[]>();

        this.__execQuery(query).then(result => {

            if (result) {
                this.__fill_entityManager(result);
            }

            d.resolve(result);

        });

        return d.promise;

    }


    internal_exec_sql(sql: string): Q.Promise<any[]> {

        var d = Q.defer<any[]>();

        this.context.conn.sequelize.query(sql, { type: __sequel.QueryTypes.SELECT }).then((list: any[]) => {
            d.resolve(list);
        });

        return d.promise;
    }



    exec_sql(input: any): Q.Promise<any[]> {

        return this.internal_exec_sql(input.sql);

    }


    private __saveChanges(saveBundle: any): Q.Promise<any> {

        var d = Q.defer<any>();

        sequel_save.save(this.context.conn, {
            body: {
                entities: JSON.parse(saveBundle).entities
            }
        }).then(() => {

            d.resolve(true);

        }).catch((err) => {

            d.reject(err.message)
        });

        return d.promise;

    }



    savechanges(data: string): Q.Promise<any> {

        this.datasource.importEntities(data, { mergeStrategy: breeze.MergeStrategy.OverwriteChanges });

        return this.do_savechanges();
    }



    do_savechanges(): Q.Promise<any> {

        var dataservice: any = br_sequel.breeze.config.getAdapterInstance('dataService');

        var savecontext = {
            entityManager: this.datasource,
            dataService: dataservice,
            resourceName: this.model
        }


        var bundle = { entities: this.datasource.getEntities(), saveOptions: {} };


        var saveBundle = dataservice.saveChanges(savecontext, bundle);


        return this.__saveChanges(saveBundle);

    }
}