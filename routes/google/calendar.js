
const express = require('express');
const router = express.Router();

const { google } = require('googleapis');


const dateFns = require('date-fns');




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
      const user = req.user;

      const oauth2Client = new google.auth.OAuth2();

      // Set the access token from the user's tokens
      oauth2Client.setCredentials({
        access_token: user.accessToken,
      });


      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      try {

        const response = await calendar.events.list({
          calendarId: 'primary', // Use 'primary' for the authenticated user's primary calendar
          timeMin: new Date().toISOString(),
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const events = response.data.items || [];

        // Iterate through the events and modify properties
        const modifiedEvents = events.map(event => {

          const processedEvent = {
            id: event.id,
            subject: event.summary,
            start: {
              dateTime: event.start?.date, // Use "dateTime" instead of "date"
            },
            end: {
              dateTime: event.end?.date,     // Use "dateTime" instead of "date"
            }

          }

          // Subtract one day from the end date
          if (processedEvent.end.dateTime) {
            const endDate = new Date(processedEvent.end.dateTime);
            endDate.setDate(endDate.getDate() - 1);
            processedEvent.end.dateTime = endDate.toISOString();
          }

          return processedEvent;
        });

        // Assign the events to the view parameters
        params.events = modifiedEvents;

      } catch (err) {

        req.flash('error_msg', {
          message: 'Could not fetch events',
          debug: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });

      }

      req.app.locals.event = params.events

      res.render('calendar', params);
    }

  });

module.exports = router