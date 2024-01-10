const express = require('express');
const router = express.Router();

const dateFns = require('date-fns');
const { Parser } = require('json2csv');
const { format, formatISO } = require('date-fns');



router.get('/generate-csv', (req, res) => {

    
    try {

      // Get the events 
      const Events = req.app.locals.event;
  
      // Retrieve the eventId from the query parameter
      const eventId = req.query.eventId
  
      // Find the event with the specified eventId
      const event = Events.find(event => event.id == eventId);
  
  
  
      // Format the date-time values in a human-readable format
      const formattedEvent = {
        subject: event.subject,
        start: dateFns.format(new Date(event.start.dateTime),'dd/MM/yyyy'),
        end: dateFns.format(new Date(event.end.dateTime),'dd/MM/yyyy')
      };
  
  
  
      // Convert the specific event data to an array of objects
      const data = [formattedEvent];
  
  
      // Set up fields for CSV headers (corresponding to properties in the specific event)
      const fields = ['subject', 'start', 'end'];
  
      // Create a new CSV parser instance with the specified fields
      const json2csvParser = new Parser({ fields });
  
      // Convert the data to a CSV string
      const csv = json2csvParser.parse(data);
  
      // Set the response headers to force the browser to download the file
      res.setHeader('Content-Disposition', 'attachment; filename=Congés.csv');
      res.set('Content-Type', 'text/csv; charset=utf-8');
  
      // Send the CSV data as a response
      res.send(csv);

    } catch (err) {
      console.error('Error generating CSV:', err);
      res.status(500).send('Error generating CSV');
    }
  });
  // </PostEventFormSnippet>
  module.exports = router;