addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * 
 * @param {Request} request
 */

async function handleRequest(request) {

  //parse the __amp_source_origin from the query string amp adds from the form post
  const { searchParams } = new URL(request.url)
  let sourceOrigin = searchParams.get('__amp_source_origin')


  // Get the actual origin of the request from the headers to compare to accepted origins list
  const reqHeaders = Object.fromEntries(request.headers);
  const origin = reqHeaders.origin

  // Your own origin when not served from amp caches
  const myOrigin = '<<My-cloudflare-pages-url>>'

  // Get the actual AMP caches  -https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/#testing-cors-in-amp
  var ampCaches = await fetch('https://cdn.ampproject.org/caches.json')
    .then(resData => resData.json())
    .then((resData) => {
      let cacheDomainArray = [];
      resData.caches.forEach((item) => {
        cacheDomainArray.push(`${myOrigin}.${item.cacheDomain}`)
      }
      )
      return cacheDomainArray
      }
    )

    // Google Cache Format -https://developers.google.com/amp/cache/overview
    const googleCacheUrlFormat = sourceOrigin.replace(/-/g, '--').replace(/\./g, '-')
    const googleCacheUrl = `${googleCacheUrlFormat}.cdn.ampproject.org`
  
    // Set valid origins for requests 
    allowedOrigins = [myOrigin, googleCacheUrl, ...ampCaches];


  if (request.method === "POST") {

    // Get form fields (just email in this case)
    const body = await request.formData();
    const {
      email
    } = Object.fromEntries(body);

    // add headers for sendgrid
    var myHeaders = new Headers();
    //  *you could put your api key right in the code adding it as an env. variable then referencing it here is safer 
    myHeaders.append("Authorization", sendgridAPIKey); 
    myHeaders.append("Content-Type", "application/json");

  // build request body for sendgrid
  var bodyData = `{"from":{"email":"<<your-sendgrid-account-email-here>>"},"personalizations":[{"to":[{"email":"${email}"}],}],"template_id":"<<template-id-here>>"}`;

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: bodyData,
      redirect: 'follow'
    };

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log(origin + ' :2')
    // Send Email to sendgrid
    const code = await fetch("https://api.sendgrid.com/v3/mail/send", requestOptions)
      .then(result => result)
      .catch(error => console.log('error', error));
        //check that sendgrid accepted the request for processing
        if( code.status == 202){
          //amp-forms require a json response object 
            const json = JSON.stringify({}, null, 2)
            return new Response(json, {
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': origin,
                'AMP-Access-Control-Allow-Source-Origin': sourceOrigin,
                'Access-Control-Expose-Headers':'AMP-Access-Control-Allow-Source-Origin',
                'Access-Control-Allow-Credentials':'true',
              }
            })
          } else {
            //not a good status code (bad request)
            return new Response('Error', {status: 400})
          }
        }else{
          // disalowed origin - don't use this error code, choose whatever you think matches closest.
          return new Response('Error', {status: 418})
        }
  } 


// not a post request
return new Response("Error", {status: 405});

}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

