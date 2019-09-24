'use strict';

const test = require('ava');
const nock = require('nock');
const qs = require('querystring');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');

test('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token (body credentials and form format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', qs.stringify(expectedRequestParams))
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'form',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token (header credentials)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      authorizationMethod: 'header',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/root/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    auth: {
      tokenHost: 'https://authorization-server.org:443/root/',
      tokenPath: '/oauth/token',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with custom module configuration (http options)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
      'X-MYTHICAL-HEADER': 'mythical value',
      'USER-AGENT': 'hello agent',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    http: {
      headers: {
        'X-MYTHICAL-HEADER': 'mythical value',
        'USER-AGENT': 'hello agent',
      },
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token while following redirections', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const redirectionsScope = nock('https://authorization-server.org', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .times(19)
    .reply(301, null, {
      Location: 'https://authorization-server.org/oauth/token',
    })
    .post('/oauth/token', expectedRequestParams)
    .reply(301, null, {
      Location: 'https://origin-authorization-server.org/oauth/token',
    });

  const originScope = nock('https://origin-authorization-server.org', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(baseConfig);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  redirectionsScope.done();
  originScope.done();

  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token while requesting multiple scopes', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    scope: 'scope-a scope-b',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const tokenParams = {
    scope: ['scope-a', 'scope-b'],
  };

  const oauth2 = oauth2Module.create(baseConfig);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with a custom grant type', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'my_grant',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const tokenParams = {
    grant_type: 'my_grant',
  };

  const oauth2 = oauth2Module.create(baseConfig);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => rejects the operation when a non json response is received', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, '<html>Sorry for not responding with a json response</html>', {
      'Content-Type': 'application/html',
    });

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const error = await t.throwsAsync(() => oauth2.clientCredentials.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
});
