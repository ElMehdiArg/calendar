// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const router = require('express-promise-router').default();
const graph = require('../../graph.js');
const dateFns = require('date-fns');
const iana = require('windows-iana');

/* GET /calendar */
// <GetRouteSnippet>
router.get('/',
  async function (req, res) {
    if (!req.session.userId) {
      // Redirect unauthenticated requests to home page
      res.redirect('/');
    } else {
      const params = {
        active: { calendar: true }
      };

      // Get the user
      const user = req.app.locals.users[req.session.userId];
      // Convert user's Windows time zone 

      const timeZoneId = iana.findIana(user.timeZone)[0];
      console.log(`Time zone: ${timeZoneId.valueOf()}`);

      // Calculate the start and end of the current week
      // Get midnight on the start of the current week in the user's timezone,
      // but in UTC. For example, for Pacific Standard Time, the time value would be
      // 07:00:00Z
      const startDate = new Date(); // Start from the current date/time
      const endDate = dateFns.addYears(startDate, 1)

      try {
        // Get the events
        const events = await graph.getCalendarView(
          req.app.locals.msalClient,
          req.session.userId,
          dateFns.formatISO(startDate),
          dateFns.formatISO(endDate),
          user.timeZone);

        // Adjust the end date of each event by subtracting one day
        const adjustedEvents = events.value.map(event => {
          const adjustedEnd = dateFns.subDays(new Date(event.end.dateTime), 1);
          event.end.dateTime = adjustedEnd.toISOString();
          return event;
        });

        // Assign the events to the view parameters
        params.events = adjustedEvents;
      } catch (err) {
        req.flash('error_msg', {
          message: 'Could not fetch events',
          debug: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
      }

      req.app.locals.event = params.events

      res.render('calendar', params);
    }
  }
);
// </GetRouteSnippet>

module.exports = router;
