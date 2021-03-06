/*
 * � Copyright IBM Corp. 2012
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 * 
 * http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */

/**
 * Social Business Toolkit SDK. 
 * 
 * Implementation of a XML HTTP Request using the JQuery API.
 */
define(['jquery', 'sbt/_bridge/declare', 'sbt/util' ], function($, declare, util) {
	return declare("sbt._bridge.Transport", null, {
        /**
         * Provides an asynchronous request.
         * 
         * @method request
         * @param {String)
         *            url The URL the request should be made to.
         * @param {Object}
         *            [options] Optional A hash of any options for the provider.
         * @param {String|Object}
         *            [options.data=null] Data, if any, that should be sent with
         *            the request.
         * @param {String|Object}
         *            [options.query=null] The query string, if any, that should
         *            be sent with the request.
         * @param {Boolean}
         *            [options.preventCache=false] If true will send an extra
         *            query parameter to ensure the the server won�t supply
         *            cached values.
         * @param {String}
         *            [options.method=GET] The HTTP method that should be used
         *            to send the request.
         * @param {Integer}
         *            [options.timeout=null] The number of milliseconds to wait
         *            for the response. If this time passes the request is
         *            canceled and the promise rejected.
         * @param {String}
         *            [options.handleAs=text] The content handler to process the
         *            response payload with.
         * 
         */
        request : function(url,options) {
            return null;
        },
        
        createQuery: function(queryMap) {
            if (!queryMap) {
                return null;
            }
            var pairs = [];
            for(var name in queryMap){
                var value = queryMap[name];
                pairs.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
            }
            return pairs.join("&");
        },

		xhr: function(method, args, hasBody) {
		    var url = args.url;
		    var self = this;
		    var usedJQVersion = $().jquery;
		    var requiredJQVersion = "1.8";
		    var jQ_v_gte_18 = util.minVersion(requiredJQVersion, usedJQVersion);
		    
		    if (args.content && (method==="PUT"||method==="POST")) {
		    	var query = self.createQuery(args.content);
		    	if (query) {
		    		url += ((url.indexOf('?') != -1) ? "&" : "?") + query;	
		    	}
		    }
		    
		    var xhrData = args.putData || args.postData || args.content || null;
		    
		    if (!args.handleAs) {
		    	$.extend(args, {handleAs: "text"});
		    }
		    var settings = {
		        type: method,
		        data: xhrData,
		        dataType: args.handleAs
		    };
		    
		    if (args.headers) {
		    	settings.headers = args.headers;	
		    }
		    
		    if (!jQ_v_gte_18) {
		    	settings = $.extend(settings, {
		    		success: function(data, textStatus, jqXHR) {
		    			self.handleSuccess(args, data, textStatus, jqXHR);
		    		},
		    		error: function(jqXHR, textStatus, errorThrown)  {
		    			self.handleError(args, jqXHR, textStatus, errorThrown);
		    		}
		    	});
		    }
		    
		    var jqXHR = $.ajax(url, settings);
		    
		    if (jQ_v_gte_18) {
		    	jqXHR.done(function(data, textStatus, jqXHR) {
		            self.handleSuccess(args, data, textStatus, jqXHR);
		        }).fail(function(jqXHR, textStatus, errorThrown)  {
		            self.handleError(args, jqXHR, textStatus, errorThrown);
		        });	
		    }
		},
		handleSuccess: function(args, data, textStatus, jqXHR) {
		    if (args.handle) {
                var _ioArgs = {
                    'args' : args,
                    'headers' : util.getAllResponseHeaders(jqXHR),
                    '_ioargs' : jqXHR
                };
		        args.handle(data, _ioArgs);
		    }
		},
		handleError: function(args, jqXHR, textStatus, errorThrown) {
			var error = this.createError(jqXHR, textStatus, errorThrown, args.handleAs);
            if (args.handle) {
		        args.handle(error, args);
            }
		},
		createError: function(jqXHR, textStatus, errorThrown, type) {
            var _error = new Error();
            _error.code = jqXHR.status || 400;
            _error.message = this.getErrorMessage(jqXHR, textStatus, type);
            _error.cause = errorThrown || jqXHR;
            _error.response = jqXHR.getAllResponseHeaders();
            return _error;
        },
        getErrorMessage: function(jqXHR, textStatus, type) {
            try {
            	var xml = (type==="xml" ? jqXHR.responseXML : type==="text" ? $.parseXML(jqXHR.responseText) : undefined );
                var text = $($(xml).find("message")[0]).text().trim();
            } catch(ex) {
                console.log(ex);
            }
            return text || jqXHR.statusText || jqXHR.responseText || textStatus || jqXHR;
        }
	});
});
