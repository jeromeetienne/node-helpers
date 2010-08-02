var sys		= require('sys');
var http	= require('http');
var url_module	= require('url');

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//	http_get								//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * Do a http get on this url
 * - currently range_beg/range_end are mandatory
 *   - TODO make them optional
*/
var http_get	= function(url_str, range_beg, range_len, completed_cb){
	var url		= url_module.parse(url_str);
	var range_end	= range_beg+range_len-1;

	// rebuild the path_query_hash string to put in the request path
	var pqh_str	 = url.pathname;
	if( url.query !== undefined )	pqh_str	+= "?"+url.query;
	if( url.hash  !== undefined )	pqh_str	+= url.hash;
	// create the http client
	var client	= http.createClient((url.port||80), url.hostname);
	// bind error cases at the socket level
	client.on("error"	, function(e){ completed_cb("error due to "+e.message, null) });
	client.on("timeout"	, function(e){ completed_cb("timeout", null) });	
	// create the request
	var request	= client.request('GET', pqh_str,  {
		'host'	: url.hostname,
		'Range'	: "bytes="+range_beg+"-"+range_end
	});
	// init the data to run
	var data	= "";
	request.on('response', function(response) {
		response.setEncoding('binary');
		// handle error at http level 
		if( response.statusCode != 206 ){
			completed_cb("http error ("+response.statusCode+")", null)
			return;
		}
		response.on('data', function(chunk){
			data	+= chunk;
		});
		response.on('end', function(){
			// notify caller
			completed_cb(null, data);
		});
	});
	request.end();	
}

exports.http_get	= http_get;

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//	http_headers								//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * Do a http get and return only the response headers
 * @param completed_cb {Function} callback notified on completion completed_cb(error, headers) 
*/
var http_resp_headers	= function(url_str, completed_cb){
	var url		= url_module.parse(url_str);
	// rebuild the path_query_hash string to put in the request path
	var pqh_str	 = url.pathname;
	if( url.query !== undefined )	pqh_str	+= "?"+url.query;
	if( url.hash  !== undefined )	pqh_str	+= url.hash;
	// create the http client
	var client	= http.createClient((url.port||80), url.hostname);
	// bind error cases at the socket level
	client.on("error"	, function(e){ completed_cb("error", null) });
	client.on("timeout"	, function(e){ completed_cb("timeout", null) });	
	// create the request
	var request	= client.request('HEAD', pqh_str,  {
		'host'	: url.hostname
	});
	request.on('response', function(response) {
		// handle error at http level 
		if( response.statusCode != 200 ){
			completed_cb("http error ("+response.statusCode+")", null)
			return;
		}
		// log to debug
		// console.log('HEADERS: ' + JSON.stringify(response.headers));
		// notify the called
		completed_cb(null, response.headers);
		// pause response from emitting events
		// - important not to download data
		response.pause();
	});
	request.end();	
}

exports.http_resp_headers	= http_resp_headers;