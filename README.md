# Lelylan API for Node.js

Node.js client library for [Oauth2](http://oauth.net/2/)


## Requirements

Node client library is tested against Node ~0.8.x


## Installation

Install the client library using [npm](http://npmjs.org/):

    $ npm install simple-oath2

Install the client library using git:

    $ git clone git://github.com/andrearegianto/simple-oauth2.git
    $ cd simple-oauth2
    $ npm install


## Documentation

* [Simple Oauth2 Docs](git://andreareginato.github.com/simple-oauth2)


## Getting started

### Get the Access Token

```javascript
var credentials = { client: { id: 'client-id', secret: 'client-secret', site: 'https://example.org' } };
var OAuth2 = require('simple-oauth2')(credentials);

// Returns the URI where to redirect your app
var redirect = Oauth2.AuthCode.authorizeURL({ redirectURI: 'http://localhost:3000/callback', scope: 'user', state: '02afe928b');
// => "https://example.org/oauth/authorization?response_type=code&client_id=client_id&redirect_uri=http://localhost:3000/callback&scope=user&state=02afe928b"

// Get the access token object
vat params = { code: 'authorization-code', redirectURI: 'http://localhost:3000/callback' }
client.authCode.getToken(params, function(error, token){
  // save the token object
})
```

### Refresh the Access Token

```javascript

if (token.expired()) {
  token.refresh(function(error, newToken) { token = newToken; })
}
```

### Authorization Grants

Currently the Authorization Code and Resource Owner Password Credentials grant types
have helper strategy classes that simplify client use. They are available via the #authCode
and #password methods respectively.

// Authorization code flow
var authURL = client.authCode.authorizeURL({ redirect_uri: 'http://localhost:3000/callback');
var token   = client.authCode.getToken({ code: 'authorization-code', redirectURI: 'http://localhost:3000/callback' }, callback);

// Password credentials flow
var token = client.password.getToken({ username: 'username', 'password': 'password' }, callback);

If the functions fails an error object is passed as first argument to the callback.
The body response object is always the last argument.

## Errors

Exceptions are raised when a 4xx or 5xx status code is returned.

```javascript
SimpleOAtuh2.Error
```

Through the error message attribute you can access the JSON representation.

```javascript
client.authCode.getToken(function(error, token) {
  if (error) { console.log(error.message); }
});
```

## Contributing

Fork the repo on github and send a pull requests with topic branches. Do not forget to
provide specs to your contribution.


### Running specs

* Fork and clone the repository (`dev` branch).
* Run `npm install` for dependencies.
* Run `make test` to execute all specs.
* Run `make test-watch` to auto execute all specs when a file change.


## Coding guidelines

Follow [github](https://github.com/styleguide/) guidelines.


## Feedback

Use the [issue tracker](http://github.com/lelylan/lelylan-node/issues) for bugs.
[Mail](mailto:touch@lelylan.com) or [Tweet](http://twitter.com/lelylan) us for any idea that can improve the project.


## Links

* [GIT Repository](http://github.com/andreareginato/simple-oauth2)
* [Documentation](http://andreareginato.github.com/simple-oauth2)


## Authors

[Andrea Reginato](http://twitter.com/andreareginato)


## Contributors

Special thanks to the following people for submitting patches.


## Changelog

See [CHANGELOG](simple-oauth2/blob/master/CHANGELOG.md)


## Copyright

Copyright (c) 2013 [Lelylan](http://lelylan.com). See [LICENSE](simple-oauth2/blob/master/LICENSE.md) for details.
