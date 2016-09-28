"use strict";
/// <reference path="../../server/lib/store.ts" />
var root = require('root-path');
var store = require('../../server/lib/store');
var breeze = require('breeze-client');
module.exports = function () {
    store.add_to_Store({
        defaultResourceName: 'prof',
        dataProperties: {
            ID: { dataType: breeze.DataType.String, isPartOfKey: true },
            COMPID: { dataType: breeze.DataType.String },
            OCCPID: { dataType: breeze.DataType.String },
            PROFTITLE: { dataType: breeze.DataType.String },
            PROFDESCRIPTION: { dataType: breeze.DataType.String },
            PROFCREATEDATE: { dataType: breeze.DataType.DateTime },
            PROFISPUBLIC: { dataType: breeze.DataType.Int16 },
            PROFACTIVE: { dataType: breeze.DataType.Int16 },
            PROFCOUNTRY: { dataType: breeze.DataType.String },
        }
    });
};
//# sourceMappingURL=prof.js.map