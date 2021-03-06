# Send Email using <img height="40" alt="login with github" src="https://cloud.githubusercontent.com/assets/194400/12875883/cf23af1c-cdeb-11e5-8e57-dcda33fd3abb.png">

Send email from a Hapi.js app using Google Mail (Gmail)

[![Build Status](https://travis-ci.org/dwyl/sendemail-gmail.svg?branch=master)](https://travis-ci.org/dwyl/sendemail-gmail)
[![codecov.io](https://codecov.io/github/dwyl/sendemail-gmail/coverage.svg?branch=master)](https://codecov.io/github/dwyl/sendemail-gmail?branch=master)
[![Code Climate](https://codeclimate.com/github/dwyl/sendemail-gmail/badges/gpa.svg)](https://codeclimate.com/github/dwyl/sendemail-gmail)
[![Dependency Status](https://david-dm.org/dwyl/sendemail-gmail.svg)](https://david-dm.org/dwyl/sendemail-gmail)
[![devDependency Status](https://david-dm.org/dwyl/sendemail-gmail/dev-status.svg)](https://david-dm.org/dwyl/sendemail-gmail#info=devDependencies)


## Why?

We have been using ~~Mandrill~~ AWS Simple Email Service (*SES*) for sending email @dwyl
and we made a node module for this: https://github.com/dwyl/sendemail

However we have had requests from *clients* to send email via Gmail.
And have implemented this:
https://github.com/dwyl/html-form-send-email-via-google-script-without-server

*However* ... the amount of *setup* required to use ~~Mandrill~~ SES can be quite
*daunting* to beginners.
see: https://github.com/dwyl/sendemail#checklist-everything-you-need-to-get-started-in-5-minutes

## What?

+ Send *any type* of email using Gmail
+ Authenticate using OAuth2.
+ Track emails sent
+ Track open rates


## How?

> While this module does not *require* `Hapi.js` the *example*

#### *Required* Environment Variables

+ `GOOGLE_CLIENT_ID` - your google OAuth client id.
+ `GOOGLE_CLIENT_SECRET` - you get this when you register your app with Google

> If you need a quick primer on Google OAuth see:  
https://github.com/dwyl/hapi-auth-google


Running this app or its' tests on your local machine will require
that you set a few
[*environment variables*](https://github.com/dwyl/learn-environment-variables)
our *preferred* method is to use [`env2`](https://github.com/dwyl/env2)
and load our environment variables in an `.env` file.

Using your terminal or text editor, create your `.env` file.  
Then *paste* this *sample* into your `.env` file:

```txt
GOOGLE_CLIENT_ID=ClientIdGoesHere
GOOGLE_CLIENT_SECRET=YourSecretHere
PORT=8000
BASE_URL=http://localhost:8000
JWT_SECRET=WhatEverYouWant
```
...*replace the values for the ones you got from Google*

If you want to *contribute* to this project,
contact us for our "*Test*" Google OAuth Credentials.

## Google App Setup

### Scopes (*OAuth Permissions*)

> https://developers.google.com/gmail/api/auth/scopes

When you are setting up your Project in the Google Developer console
https://console.developers.google.com
you need to enable:
+ Google+ API
+ Gmail API
+ Contacts API

## Troubleshooting

Used the following to get this working:

+ http://stackoverflow.com/questions/30590988/failed-sending-mail-through-google-api-with-javascript

## Base64 Encoding ?

Messages sent via the GMail API have to be *encoded* as a **Base64 String**
In the browser this is done using the `btoa` method.
*However* as we [*discovered*](http://stackoverflow.com/questions/30590988/failed-sending-mail-through-google-api-with-javascript)
this method is not available in Node so we went searching ...

https://www.npmjs.com/search?q=btoa has a 51 results.
We ended up using https://www.npmjs.com/package/btoa
because it *appears* to serve our needs. So far so good.
