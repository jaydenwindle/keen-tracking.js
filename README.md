# keen-tracking.js

A JavaScript tracking library for [Keen](https://keen.io).
Track events, user actions, clicks, pageviews, conversions and more!

### Installation

Install this package from NPM *Recommended*

```ssh
npm install keen-tracking --save
```

Or load it from public CDN

```html
<script crossorigin src="https://cdn.jsdelivr.net/npm/keen-tracking@4"></script>
```

### Project ID & API Keys

[Login to Keen IO to create a project](https://keen.io/login?s=gh_js) and grab the **Project ID** and **Write Key** from your project's **Access** page.

## Getting started

The following examples demonstrate how to implement rock-solid web analytics, capturing **pageviews**, **clicks**, and **form submissions** with robust data models.

[Full documentation is available here](./docs/README.md)

**Using React? Check out these setup guides:**

* [React Flux Logger](./docs/examples/react-flux): How to instrument a Flux ReduceStore
* [React Redux Middleware](./docs/examples/react-redux-middleware): How to instrument a Redux Store

**Upgrading from an earlier version of keen-js?** [Read this](./docs/upgrade-guide.md).

---

### Record an Event

```javascript
import KeenTracking from 'keen-tracking';

const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});

client
  .recordEvent('purchases', {
    item: 'Avocado',
    number_of_items: 10,
    user: {
      name: 'John Smith'
    }
  })
  .then((response) => {
    // handle successful responses
  })
  .catch(error => {
    // handle errors
  });
```

---

### Automated Event Tracking

Automatically record `pageviews`, `clicks`, and `form_submissions` events with robust data models:

```html
<script>
  (function(name,path,ctx){ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;ctx[name].ready(fn)};s.async=1;s.src=path;h.parentNode.insertBefore(s,h)}}})
  ('KeenTracking', 'https://cdn.jsdelivr.net/npm/keen-tracking@4/dist/keen-tracking.min.js', this);

  KeenTracking.ready(function(){
    const client = new KeenTracking({
      projectId: 'YOUR_PROJECT_ID',
      writeKey: 'YOUR_WRITE_KEY'
    });
    client.initAutoTracking();
  });
</script>
```

[Learn how to configure and customize this functionality here](./docs/auto-tracking.md)

---

### Pageview Tracking

First, let's create a new `client` instance with your Project ID and Write Key, and use the `.extendEvents()` method to define a solid baseline data model that will be applied to every single event that is recorded. Consistent data models and property names make life much easier later on, when analyzing and managing several event streams. This setup also includes our [data enrichment add-ons](https://keen.io/docs/streams/data-enrichment-overview/), which will populate additional information when an event is received on our end.

```javascript
import KeenTracking from 'keen-tracking';

const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});
const helpers = KeenTracking.helpers;
const utils = KeenTracking.utils;

const sessionCookie = utils.cookie('rename-this-example-cookie');
if (!sessionCookie.get('guest_id')) {
  sessionCookie.set('guest_id', helpers.getUniqueId());
}

// optional
client.extendEvents(() => {
  return {
    geo: {
      ip_address: '${keen.ip}',
      info: {
        /* Enriched data from the API will be saved here */
        /* https://keen.io/docs/api/?javascript#ip-to-geo-parser */
      }
    },
    page: {
      title: document.title,
      url: document.location.href,
      info: { /* Enriched */ }
    },
    referrer: {
      url: document.referrer,
      info: { /* Enriched */ }
    },
    tech: {
      browser: helpers.getBrowserProfile(),
      user_agent: '${keen.user_agent}',
      info: { /* Enriched */ }
    },
    time: helpers.getDatetimeIndex(),
    visitor: {
      guest_id: sessionCookie.get('guest_id')
      /* Include additional visitor info here */
    },
    keen: {
      addons: [
        {
          name: 'keen:ip_to_geo',
          input: {
            ip: 'geo.ip_address'
          },
          output : 'geo.info'
        },
        {
          name: 'keen:ua_parser',
          input: {
            ua_string: 'tech.user_agent'
          },
          output: 'tech.info'
        },
        {
          name: 'keen:url_parser',
          input: {
            url: 'page.url'
          },
          output: 'page.info'
        },
        {
          name: 'keen:referrer_parser',
          input: {
            referrer_url: 'referrer.url',
            page_url: 'page.url'
          },
          output: 'referrer.info'
        }
      ]
    }
  }
});

// record the event
client
  .recordEvent('pageviews', {
    // here you can add even more data
    // some_key: some_value
  })
  .then((response) => {
    // handle responses
  }).catch(error => {
    // handle errors
  });
```

Every event that is recorded will inherit this baseline data model. Additional properties defined in `client.recordEvent()` will be applied before the event is finally recorded.

**What else can this SDK do?**

* [Automated tracking (browser-only)](./docs/auto-tracking.md)
* [Record multiple events in batches](./docs/record-events.md)
* [Extend event data models for a single event stream](./docs/extend-events.md)
* [Queue events to be recorded at a given time interval](./docs/defer-events.md)

**App Frameworks:**

* [React Flux Logger](./docs/examples/react-flux): How to instrument a Flux ReduceStore
* [React Redux Middleware](./docs/examples/react-redux-middleware): How to instrument a Redux Store
* [Vue.js Vuex Store](./docs/examples/vue-vuex): How to instrument a Vue Vuex Store

**Video Players:**

* [Facebook video player](./docs/examples/video/facebook-video)
* [HTML5 video player](./docs/examples/video/html5)
* [Video.js player](./docs/examples/video/video-js)
* [Vimeo video player](./docs/examples/video/vimeo)
* [Youtube iFrame video player](./docs/examples/video/youtube)

[Full documentation is available here](./docs/README.md)

---

### Click and Form Submit Tracking

Clicks and form submissions can be captured with `.listenTo()`. This function intercepts events for designated elements and creates a brief 500ms delay, allowing an HTTP request to execute before the page begins to unload.

This example further extends the `client` instance defined previously, and activates a simple timer when the page the loaded. Once a `click` or `submit` event is captured, the timer's value will be recorded as `visitor.time_on_page`.

```javascript
import KeenTracking from 'keen-tracking';

const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});
const helpers = KeenTracking.helpers;
const timer = KeenTracking.utils.timer();
timer.start();

KeenTracking.listenTo({
  'click .nav a': (e) => {
    return client.recordEvent('click', {
      action: {
        intent: 'navigate',
        target_path: helpers.getDomNodePath(e.target)
      },
      visitor: {
        time_on_page: timer.value()
      }
    });
  },
  'submit form#signup': (e) => {
    return client.recordEvent('form-submit', {
      action: {
        intent: 'signup',
        target_path: helpers.getDomNodePath(e.target)
      },
      visitor: {
        email_address: document.getElementById('signup-email').value,
        time_on_page: timer.value()
      }
    });
  }
});
```

Want to get up and running faster? This can also be achieved in the browser with [automated event tracking](./docs/auto-tracking.md).

---

### Block Bots and Improve Device Recognition

Install [mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) to identify basic device types and block noisy bots and crawlers.

```ssh
npm install mobile-detect --save
```

This example further extends the `client` instance defined above, inserting a new `tech.device_type` property with three possible values: `'desktop'`, `'mobile'`, and `'tablet'`. If the user agent is determined to be a bot, it may be ideal to abort and avoid recording an event.

```javascript
import MobileDetect from 'mobile-detect';

const md = new MobileDetect(window.navigator.userAgent);
if (md.is('bot')) {
  return false;
}

// extends client instance defined previously
client.extendEvents(() => {
  return {
    tech: {
      device_type: md.tablet() ? 'tablet' : md.mobile() ? 'mobile' : 'desktop'
    }
  };
});
```

Check out the many additional methods supported by [mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) to further enrich your data model.

This can also be used with [automated event tracking](./docs/auto-tracking.md).

---

### Server-side Event Tracking

```javascript
const KeenTracking = require('keen-tracking');

const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});

// promise
client
  .recordEvent('purchases', {
    item: 'Avocado',
    number_of_items: 10,
    user: {
      name: 'John Promise'
    }
  })
  .then((response) => {
    // handle successful responses
  })
  .catch(error => {
    // handle errors
  });

// or callback
client
  .recordEvent('purchases', {
    item: 'Avocado',
    number_of_items: 10,
    user: {
      name: 'John Callback'
    }
  }, (error, response) => {
    if (error) {
      // handle errors
      return;
    }
    // handle responses
  });
```

---

### Handling connection problems

When KeenTracking encounters connection problems, it will retry to send the data.

```javascript
import KeenTracking from 'keen-tracking';

const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY',

  // customize the default values
  retry: {
    limit: 10, // how many times retry to record an event
    initialDelay: 200, // initial delay between consecutive calls.
    // Each next retry will be delayed by (2^retries_count * 100) milliseconds,
    retryOnResponseStatuses: [ // array of invalid http response statuses
      408,
      500,
      502,
      503,
      504
    ]
  }
});
```

---

### Unique events

Save the event only once.

```javascript
client
  .recordEvent({
    collection: 'unique_clicks',
    event: {
      some_key: 'some_value',
      // ...
    },
    unique: true, // check if the event is unique, before sending to API
    cache: {
      storage: 'indexeddb', // for persistence. Remove this property to use RAM
      hashingMethod: 'md5', // remove this property to store as a stringified json
      maxAge: 1000 * 60, // store the information about unique value for 60 seconds
    }
  })
  .then((response) => {
    console.log('ok', response);
  })
  .catch(someError => {
    console.log('error', someError);
  });
```

---

### Request types

By default, we make requests using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

For UI interactions, consider using the
[BeaconAPI](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API).
It's the fastest non-invasive way to track user behaviour.
Due its nature, BeaconAPI runs requests in the background, with no possibility  
to handle errors. If you want to handle errors, you need to use the Fetch API.

```javascript
// specify request types for all requests
const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY',
  requestType: 'fetch' // fetch, beaconAPI, img
});

// you can use different requestType for a single request
client
  .recordEvent({
    collection: 'clicks',
    event: {
      some_key: 'some_value',
      // ...
    },
    requestType: 'beaconAPI'
  });
```

---

### Recorded Event ID

A successful response from our API does not contain the ID of the newly created event. We are using Cassandra Database (NoSQL), so there are no joins. Store all necessary data in each event you record.
Denormalization and duplication of data is a fact of life with Cassandra.
Read more:
- [Cassandra Modeling Guide](https://www.datastax.com/dev/blog/basic-rules-of-cassandra-data-modeling)
- [How not to use Cassandra](https://opencredo.com/how-not-to-use-cassandra-like-an-rdbms-and-what-will-happen-if-you-do/)
---

### Contributing

This is an open source project and we love involvement from the community! Hit us up with pull requests and issues.

[Learn more about contributing to this project](./CONTRIBUTING.md).

---

### Support

Need a hand with something? Shoot us an email at [team@keen.io](mailto:team@keen.io). We're always happy to help, or just hear what you're building! Here are a few other resources worth checking out:

* [API status](http://status.keen.io/)
* [API reference](https://keen.io/docs/api)
* [How-to guides](https://keen.io/guides)
* [Data modeling guide](https://keen.io/guides/data-modeling-guide/)
* [Slack (public)](http://slack.keen.io/)
