/// <reference path="lib/dataservice.ts" />
/// <reference path="local/localdb.ts" />
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="appcontext.ts" />
/// <reference path="lib/store.ts" />
/// <reference path="lib/store.ts" />
/// <reference path="lib/fileupload.ts" />
"use strict";
var ctx = require('./appcontext');
var breeze = require('breeze-client');
var Store = require('./lib/store');
var FileUploader = require('./lib/fileupload');
var localDB = require('./local/localdb');
var dal = require('./lib/dataservice');
function sendResponse(data, res) {
    res.send(data);
}
exports.operationtype = {
    fetch: 'fetch',
    metadata: 'metadata',
};
function dispatch_call(operation, req, res, next) {
    switch (operation) {
        case exports.operationtype.metadata:
            {
                fetch_metadata(req, res, next);
            }
            break;
        case exports.operationtype.fetch:
            {
                fetch_data(req, res, next);
            }
            break;
    }
}
exports.dispatch_call = dispatch_call;
function format_qry(qry) {
    var str_qry = JSON.stringify(qry);
    return JSON.parse(str_qry, function (key, val) {
        if (val === '___NULL___') {
            return null;
        }
        return val;
    });
}
function fetch_data(req, res, next) {
    var __qry = format_qry(req.body);
    var qry = new breeze.EntityQuery(__qry);
    var _ctx = new ctx.AppContext();
    var srv = new dal.DataService(_ctx, qry.resourceName);
    srv.fetch(qry).then(function (rst) {
        var response = {
            payload: srv.datasource.exportEntities()
        };
        res.send(response);
    });
}
function fetch_metadata(req, res, next) {
    res.send(Store.ModelStore.exportMetadata());
}
function process(req, res, next) {
    var model = req.params.model;
    var method = req.body ? req.body.method : null;
    if (model === 'Metadata') {
        method = 'Metadata';
    }
    var _ctx = new ctx.AppContext();
    var srv = new dal.DataService(_ctx, model);
    //srv.exec_sql({ sql: 'select * from occp'}).then(() => {
    //});
    switch (method) {
        case "data":
            {
                var localdb = {
                    specs: localDB.SpecsAttribs,
                    cats: localDB.Categories,
                    parts: localDB.Partners
                };
                sendResponse({
                    payload: localdb,
                    success: true
                }, res);
            }
            break;
        case "upload":
            {
                FileUploader.upload_file(req, res, next);
            }
            break;
        case "Metadata":
            {
                res.send(Store.ModelStore.exportMetadata());
            }
            break;
        case 'fetch':
            {
                var qry = new breeze.EntityQuery(req.body.data);
                srv.fetch(qry).then(function (rst) {
                    var data = srv.datasource.exportEntities();
                    sendResponse({
                        success: true,
                        payload: data
                    }, res);
                }).catch(function (err) {
                    sendResponse({
                        success: false,
                        error: err
                    }, res);
                });
            }
            break;
        case 'savechanges':
            {
                var data = req.body.params;
                srv.savechanges(data).then(function (rsp) {
                    sendResponse({
                        success: true,
                    }, res);
                }).catch(function (err) {
                    sendResponse({
                        success: false,
                        error: err
                    }, res);
                });
            }
            break;
        default:
            {
                var p = srv[method](req.body);
                p.then(function (rst) {
                    console.log(rst);
                    res.send({
                        succes: true,
                        payload: rst
                    });
                }).fail(function (err) {
                    res.send({
                        succes: false,
                        error: err
                    });
                });
            }
            break;
    }
}
//# sourceMappingURL=dispatcher.js.map