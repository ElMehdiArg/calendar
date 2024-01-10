const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const { format } = require('date-fns');
const db = require('./db')



router.get("/new",async(req,res)=>{
    res.render("newEvent");
})



// add-event POST route
router.post('/add-event', async (req, res) => {

    const {ev_subject, ev_start, ev_end } = req.body;
    const user_id = req.session.userId;

    try {


        const insertCalendar = db.prepare(`INSERT INTO calendar (user_id, event_name, event_start, event_end)VALUES (?, ?, ?, ?)`);
        insertCalendar.run(user_id, ev_subject, ev_start, ev_end, (err) => {
            if (err) {
                console.error('Error inserting calendar:', err.message);
                res.send('Error registering calendar.');
            } else {
                console.log('events registered successfully:', ev_subject);
                res.redirect('/calendar/user');
            }
        });

        insertCalendar.finalize();

    } catch (error) {
        console.log(`Error: ${error}`);
        req.flash('error_msg', {
            message: 'Error getting auth URL',
            debug: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
        res.redirect('/');
    }
});




// Events GET route
router.get('/', (req, res) => {
    const user_id = req.session.userId;

    if (!req.session.userId) {
        // Redirect unauthenticated requests to home page
        res.redirect('/');
    } else {
        const params = {
            active: { calendar: true }
        };

        try {

            const getEvent = db.prepare('SELECT * FROM calendar WHERE user_id = ?');
            getEvent.all(user_id, async (err, rows) => {
                if (err) {
                    console.error('Error getting Event:', err.message);
                    res.send('Error logging in.');
                } else {
                    if (rows) {

                        const events = rows;
                        // Iterate through the events and modify properties
                        const modifiedEvents = events.map(event => {

                            const processedEvent = {
                                id: event.id,
                                subject: event.event_name,
                                start: {
                                    dateTime: event.event_start,
                                },
                                end: {
                                    dateTime: event.event_end,
                                }

                            }

                            return processedEvent;
                        });

                        // Assign the events to the view parameters
                        params.events = modifiedEvents;
                        req.app.locals.event = params.events

                        res.render('calendar', params);

                    } else {
                        res.status(500).json({ error: 'Failed to fetch events' });
                    }
                }
            });

        } catch (error) {

            console.log(`Error: ${error}`);
            req.flash('error_msg', {
                message: 'Error getting auth URL',
                debug: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
            res.redirect('/');

        }

    }
});


module.exports = router
