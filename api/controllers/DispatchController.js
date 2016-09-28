/**
 * DispatchController
 *
 * @description :: Server-side logic for managing dispatches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var root = require('root-path');
var dispatcher = require(root('/server/dispatcher'));

module.exports = {
	
    fetch_data: function (req, res){
        dispatcher.dispatch_call(dispatcher.operationtype.fetch, req, res);
    },
    
    
    fetch_metadata: function (req, res){

        dispatcher.dispatch_call(dispatcher.operationtype.metadata, req, res);
    },

};

