/// <reference path="lib/dataservice.ts" />
/// <reference path="local/localdb.ts" />
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="appcontext.ts" />
/// <reference path="lib/store.ts" />
/// <reference path="lib/store.ts" />
/// <reference path="lib/fileupload.ts" />



import express = require('express');
import ctx = require('./appcontext');
import Q = require('q');
import store = require('./lib/store');
import breeze = require('breeze-client');
import _ = require('lodash');
import Store = require('./lib/store');
import FileUploader = require('./lib/fileupload');
import localDB = require('./local/localdb');
import dal = require('./lib/dataservice');


export interface srvCallResult {
    success: boolean,
    payload?: any,
    error?: any
}


function sendResponse(data: srvCallResult, res: express.Response) {

    res.send(data);
}


export var operationtype = {
    fetch: 'fetch',
    metadata: 'metadata',
}


export function dispatch_call(operation: string, req: express.Request, res: express.Response, next: any) {

    switch (operation) {

        case operationtype.metadata: {

            fetch_metadata(req, res, next);

        } break;

        case operationtype.fetch: {

            fetch_data(req, res, next);

        } break;
    }
}


function format_qry(qry: any) {

    var str_qry = JSON.stringify(qry);

    return JSON.parse(str_qry, (key: any, val: any) => {

        if (val === '___NULL___') {
            return null;
        }

        return val;
    });

}


function fetch_data(req: express.Request, res: express.Response, next: any) {

    var __qry:any = format_qry(req.body);

    var qry = new breeze.EntityQuery(__qry);
    
    var _ctx = new ctx.AppContext();

    var srv = new dal.DataService(_ctx, qry.resourceName);

    srv.fetch(qry).then(rst => {

        var response = {
            payload : srv.datasource.exportEntities()
        }

        res.send(response);
    });
}


function fetch_metadata(req: express.Request, res: express.Response, next: any) {

    res.send(Store.ModelStore.exportMetadata());
}


function process(req: express.Request, res: express.Response, next: any) {

    var model = req.params.model;
    var method = req.body ? req.body.method : null;

    if (model === 'Metadata') {
        method = 'Metadata'
    }
    
    var _ctx = new ctx.AppContext();

    var srv = new dal.DataService(_ctx, model);

    //srv.exec_sql({ sql: 'select * from occp'}).then(() => {


    //});

    switch (method) {


        case "data": {

            var localdb = {
                specs: localDB.SpecsAttribs,
                cats: localDB.Categories,
                parts: localDB.Partners
            }

            sendResponse({
                payload: localdb,
                success: true
            }, res);

        } break;


        case "upload": {

            FileUploader.upload_file(req, res, next);

        } break;
            

        case "Metadata": {
            res.send(Store.ModelStore.exportMetadata());
        } break;


        case 'fetch': {

            var qry = new breeze.EntityQuery(req.body.data);

            srv.fetch(qry).then(rst => {

                var data: string = srv.datasource.exportEntities();

                sendResponse({
                    success: true,
                    payload: data
                }, res);

            }).catch(err => {

                sendResponse({
                    success: false,
                    error: err
                }, res);

            });
            

        } break;


        
        case 'savechanges': {

            var data = req.body.params;

            srv.savechanges(data).then((rsp) => {

                sendResponse({
                    success: true,                    
                }, res);
                

            }).catch(err => {

                sendResponse({
                    success: false,
                    error: err
                }, res);

            });

        }
        break;


        default: {

            var p: Q.Promise<any> = srv[method](req.body);
            

            p.then(rst => {

                console.log(rst);

                res.send({
                    succes: true,
                    payload:rst
                });

            }).fail(err => {

                res.send({
                    succes: false,
                    error: err
                });
                
            });


        } break;

    }
    
}


