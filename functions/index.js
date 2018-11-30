// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const { findByTopicIntent, findByTopicMoreIntent, findByTopicSelected, findByTopicEnroll } = require('./findByTopicIntent');

const { findByCourseIntent } = require('./findByCourseIntent');
const { helpIntent } = require('./helpIntent');

const {dialogflow, SignIn, Suggestions} = require('actions-on-google');
const functions = require('firebase-functions');
const app = dialogflow({
  debug: true,
});

// const jwt = require('jsonwebtoken');
const { api, setJWT } = require('./api');

app.intent('Default Welcome Intent', (conv) => {
  // conv.ask(`Hi! I'm Go1 Assistant`);

  // Open signup dialog
  conv.ask(new SignIn('To get your account details'));
});

app.intent('Get Signin', async (conv, params, signin) => {
  if (signin.status === 'OK') {
    const { token } = conv.user.access;
    // const payload = jwt.decode(token);

    setJWT(token);
    const { data: portal } = await api.get('/v2/account');

    conv.data.portal = portal;

    conv.ask(`What can I do for you?`);
    conv.ask(new Suggestions(['Tell me about Big Data', 'Find AI course']));
  } else {
    conv.ask(`Sorry! I couldn't get your data. Please try again`);
  }
});

app.intent('find_by_topic', findByTopicIntent);

app.intent('find_by_topic_more', findByTopicMoreIntent);

app.intent('find_by_topic_selected', findByTopicSelected);

app.intent('find_by_topic_enroll', findByTopicEnroll);

app.intent('find_my_course', findByCourseIntent);

app.intent('Help', helpIntent);

exports.go1 = functions.https.onRequest(app);
