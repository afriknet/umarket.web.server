"use strict";
var root = require('root-path');
var Q = require('q');
var br_sequel = require(root('/server/breeze_sequel/main'));
var sequel_manager = br_sequel.SequelizeManager;
var sequel_query = br_sequel.SequelizeQuery;
var sequel_save = br_sequel.SequelizeSaveHandler;
var __sequel = require('sequelize');
var Store = require('./store');
var breeze = require('breeze-client');
require('./adapter');
br_sequel.breeze.config.initializeAdapterInstance('dataService', 'adapter_webApi', true);
var DataService = (function () {
    function DataService(context, model) {
        this.context = context;
        this.model = model;
    }
    Object.defineProperty(DataService.prototype, "datasource", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    DataService.prototype.__fill_entityManager = function (data) {
        var _this = this;
        var that = this;
        data.forEach(function (e) {
            _this.datasource.createEntity(_this.model, e, breeze.EntityState.Unchanged, breeze.MergeStrategy.OverwriteChanges);
        });
    };
    DataService.prototype.__execQuery = function (query) {
        var d = Q.defer();
        var qry = new sequel_query(this.context.conn, query);
        qry.execute().then(function (rst) {
            d.resolve(rst);
        });
        return d.promise;
    };
    DataService.prototype.fetch = function (query) {
        var _this = this;
        var d = Q.defer();
        this.__execQuery(query).then(function (result) {
            if (result) {
                _this.__fill_entityManager(result);
            }
            d.resolve(result);
        });
        return d.promise;
    };
    DataService.prototype.internal_exec_sql = function (sql) {
        var d = Q.defer();
        this.context.conn.sequelize.query(sql, { type: __sequel.QueryTypes.SELECT }).then(function (list) {
            d.resolve(list);
        });
        return d.promise;
    };
    DataService.prototype.exec_sql = function (input) {
        return this.internal_exec_sql(input.sql);
    };
    DataService.prototype.__saveChanges = function (saveBundle) {
        var d = Q.defer();
        sequel_save.save(this.context.conn, {
            body: {
                entities: JSON.parse(saveBundle).entities
            }
        }).then(function () {
            d.resolve(true);
        }).catch(function (err) {
            d.reject(err.message);
        });
        return d.promise;
    };
    DataService.prototype.savechanges = function (data) {
        this.datasource.importEntities(data, { mergeStrategy: breeze.MergeStrategy.OverwriteChanges });
        return this.do_savechanges();
    };
    DataService.prototype.do_savechanges = function () {
        var dataservice = br_sequel.breeze.config.getAdapterInstance('dataService');
        var savecontext = {
            entityManager: this.datasource,
            dataService: dataservice,
            resourceName: this.model
        };
        var bundle = { entities: this.datasource.getEntities(), saveOptions: {} };
        var saveBundle = dataservice.saveChanges(savecontext, bundle);
        return this.__saveChanges(saveBundle);
    };
    return DataService;
}());
//# sourceMappingURL=datalayer.js.map