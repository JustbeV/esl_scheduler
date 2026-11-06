# ESL Scheduler

A browser-based scheduling dashboard for an ESL teacher. Built with HTML, CSS, and vanilla JavaScript. No backend or database server is required.

## Run the project

1. Extract the ZIP file.
2. Open the `esl-scheduler` folder.
3. Open `index.html` in a modern browser.

For the most reliable development experience, open the folder in Visual Studio Code and use the Live Server extension.

## Features

- Dashboard with student, daily class, upcoming class, and completed lesson counts
- Monthly, weekly, and daily calendar views
- Add, edit, and delete classes
- Online and face-to-face class formats
- Individual students and groups
- Multiple group selections for a lesson
- Schedule overlap warnings
- Class statuses: Upcoming, Completed, Cancelled, and No-show
- Student directory with search and filters
- Basic lesson reports
- Teacher settings and default lesson duration
- JSON backup export and import
- Responsive layout for desktop and mobile
- Data stored locally in browser `localStorage`

## Data storage

The app uses these localStorage keys:

- `esl_students`
- `esl_schedules`
- `esl_settings`

Data is tied to the browser and device. It does not automatically sync between devices or browsers. Export a JSON backup regularly. Clearing browser site data may erase saved records.

## Notes and current limitations

- This is a single-browser, frontend-only application. It has no login system or cloud synchronization.
- Student timezone is currently stored as profile information, but class times are entered in the teacher's browser-local timezone. Timezone conversion is not implemented yet.
- Weekly and daily calendar views display events in their start-time hour rows. The month view is the most complete overview.
- The schedule conflict warning checks overlapping classes on the same date. It excludes cancelled classes.
- Group lessons can include multiple group records. For a group lesson with several learners, create a group profile and use that profile when scheduling.
- The app uses Google Fonts when internet access is available, with system font fallbacks.

## Suggested next improvements

1. Add student-level membership inside group profiles.
2. Add recurring lessons.
3. Add class reminders and printable schedules.
4. Add timezone conversion for international students.
5. Add a more detailed student lesson history.
6. Add an optional cloud database if the teacher later needs multi-device access.
