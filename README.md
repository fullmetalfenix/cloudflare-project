# cloudflare-project
 
 
This project was done in association with Cloudflare's Summer Developer challenge. If you would like to build off it please do but also do your own diligence in checking out the configurations included yourself before using it in a production setting. 
 
 
There are three parts to creating an AMP page with a serverless contact form: Coding the page in AMP, hosting the page and processing the form. Below is a walkthrough of one way to check off each of these stages using Cloudflare pages, the AMP framework and Cloudflare workers:
 
## Part One: Coding the AMP page
 
First I suggest you go to https://amp.dev/ and checkout exactly what AMP is about - You may already be familiar with it but its evolving all the time so even if you already have some experience with it I would take another look before beginning any project in AMP. You can also find some starter templates there but the starter code for the most basic AMP website looks like this:
 
 
 
`<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <title>Hello, AMPs</title>
    <link rel="canonical" href="https://amp.dev/documentation/guides-and-tutorials/start/create/basic_markup/">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  </head>
  <body>
    <h1 id="hello">Hello AMPHTML World!</h1>
  </body>
</html>`
 
You can build off this template to make your own site using the components [here](https://amp.dev/documentation/components/) and then by following the associated instructions for use but for this project I will be concentrating on just one - the AMP form component [here](https://amp.dev/documentation/components/amp-form/?format=websites)
 
Forms in AMP have extensive documentation and can be implemented in a number of ways so this is just one way you can do it. AMP has some specific guidelines when it comes to form submissions concerning CORS and request origins that can make using forms a bit more complicated than usual but here’s how I did it -starting with the front end:
 
First as with most AMP components you have to add a script to the head of the document:
 
<script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
 
Then, in the body you add the form:
 
      `<form id="email-form" method="post"
      action-xhr="<form-destination-for-processing" target="_top"
      custom-validation-reporting="as-you-go"
      >
      <fieldset>
        <label>
          <span ><<message about the form here>>:</span>
          <input type="email" // any type you want
            name="email" // any name you want
            placeholder="ex example@example.com" // any placeholder
            required>
        </label>
        <br>
        <input type="submit"
          value="Get The Link">
          <div submit-success>
            // change as you would like
            Hooray! Check your email soon for the link!
        </div>
        <div submit-error>
            // Ditto here
            Uh Oh! Something went wrong with your submission!
        </div>
 
        </fieldset>
    </form>`
 
So what’s going on? It looks like a regular form, and that is because it is - the AMP specific stuff really happens on the processing side, not in the form itself. The important bit really is the Action must point to wherever you are going to process the form (in this case a cloudflare workers url). One area to point out is the submit-success and submit-error div’s above - those will only show after the form is submitted, on a successful submission and the other on an unsuccessful submission respectively. 
 
And that’s it for part one!
 
P.S. To test an AMP page, you can just append ‘#development=1’ to the end of the url, reload the page and look at the console to see a validation report
 
## Part Two: Processing the form.
 
First, if you haven't already set up an account with Cloudflare and go to Cloudflare Workers®. Next, I would recommend setting up the Workers CLI so you can debug your form locally before pushing it live. All the information for setting up your account, local development and publishing your worker can be found [here](https://developers.cloudflare.com/workers/) so I will only be covering the actual code of the worker here.
 
Take a look at the code in cloudflare-workers-script.js - What’s going on here? Some of it is the standard Cloudflare workers syntax and some is AMP specific headers. One difficulty in using AMP forms is that AMP pages can take advantage of AMP caches offered from Google and Microsoft so if someone is looking at your page from a cache then the origin of the form submit wouldn’t match your site! To get around this you can both reach out to an api endpoint available that sends back a json object with the caches that your site could appear on and do some url parsing to make your url match the address of the corresponding document stored in the AMP cache. Also, build up the required AMP headings for the return message. Another thing AMP requires is a response from the server with a JSON body, so I send back an empty object to trigger the success message if I get a 202 code returned from sendgrid. 
 
Where does Sendgrid come in?
Sendgrid has a way of programatically sending emails I use above - just go to sendgrid.com, create an account, go to the dash then go to the side menu > settings > api keys and generate a key. That is what you use above where it says <<your-sendgrid-api-key>>. Also replace <<your-email-from-your-sendgrid-account>> with the email you signed up to sendgrid with or if you would like to use another email go to settings > sender authentication and set up an alternative email. The last step is to go to email api > dynamic templates in the side menu and set up an email template - this is what will be sent to anyone that submits using your form. After you have designed your email - get the template id and paste that in the above code where it says <<your-template-id>>. 
 
Note: I added the sendgrid api key as an environmental variable through the workers dashboard so I wouldn't have to worry about accidentally committing my API key - you don't have to but it might be a good idea
 
 
## Step Three - Deploying your site to cloudflare pages
 
Add your Cloudflare workers URL to the forms 'action' attribute then push it to Github. Then go to [Cloudflare Pages](https://pages.cloudflare.com/) and sign up. Follow the instructions to link to your Github account - select your AMP repository and select 'begin setup'. Walk through the steps on the next page, select your production branch (it can be named anything), deploy your site and that's it! Cloudflare pages handle’s the actual deployment for you. After that you can deploy changes straight from your favorite code editor just by pushing to your selected branch to Github. Additionally, you can add your own domain, lock your site to the public until its ready or even preview changes to your site by pushing additional branches to your Github repo.
 
## Final Steps
 
Go back to your Cloudflare worker and add your site's actual URL to the worker where it says `<<My-cloudflare-pages-url>>`. Also, update the canonical tag in your AMP code to match the Cloudflare pages URL. Additionally, remember to validate the AMP code by adding the #development=1 appendation at the end of your url, reloading your page and checking the developer console. Remember to test everything, that's it!

