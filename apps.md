# Hosted apps

- Hebrew Date: https://natanel.ca/calendar/
- RPC Print Estimator: https://natanel.ca/print/

Netlify publishes these static folders along with the portfolio at the root.
The trailing-slash redirects keep relative assets and the calendar's offline
worker scoped to the correct folder.

To update Hebrew Date, build https://github.com/nroize/nroize.github.io and copy
the contents of its `dist/` into `calendar/`, including its license and source
archive. To update the estimator, copy `index.html` from
https://github.com/nroize/rpc-print-estimator into `print/`.
