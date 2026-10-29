# SCICS - Smart Campus Infrastructure Complaint & Tracking System

Agile Software Development (CSET455) team project. Prototype built with HTML, CSS and JavaScript; data is kept in the browser (localStorage).
This folder is the application as it should look at the end of **Sprint 1**.

## Run
Open `index.html` in a browser, or serve the folder:
```
python -m http.server 8000      # then open http://localhost:8000
node tests/store.test.js        # automated tests for the data layer
```
Use **Admin -> Load sample data** to fill the pages with SAMPLE complaints for screenshots, and **Clear all data** to start again.

## Features by sprint
| Sprint | Stories | What you can do |
|---|---|---|
| 1 Complaint Intake | SCICS-6, 7, 8, 17 | Submit a complaint, get a reference ID, view details, track by ID, manage categories |
| 2 Maintenance and Assignment | SCICS-9, 10, 13 | Assign to maintenance staff, update progress, view complaint history |
| 3 Priority, Escalation and Notifications | SCICS-11, 12, 16 | Set priority, escalate overdue complaints, in-app notifications |
| 4 Dashboard and Reporting | SCICS-14, 15 | Dashboard statistics, filtered reports, CSV export |
