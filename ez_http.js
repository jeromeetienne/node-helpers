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
	var request	= client.request('GET', pqh_str,  {
		'host'	: url.hostname,
		'Range'	: "bytes="+range_beg+"-"+range_end
	});
	// init the data to run
	var data	= "";
	request.addListener('response', function(response) {
		response.setEncoding('binary');
		response.addListener('data', function(chunk){
			data	+= chunk;
		});
		response.addListener('end', function(){
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
	var request	= client.request('GET', pqh_str,  {
		'host'	: url.hostname
	});
	request.addListener('response', function(response) {
		sys.puts('HEADERS: ' + JSON.stringify(response.headers));
		// notify the caller
		completed_cb(null, response.headers);
	});
	request.end();	
}

exports.http_resp_headers	= http_resp_headers;