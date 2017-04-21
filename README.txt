Smart Citizen Dashboard
========================

The following dashboard is a website that can be customize to show participants of a pilot the status of their kits. You can use it as an example to create any realtime application to viz data from multiple kits.






Instructions
============

On the `js/index.js` you can simply edit the time and interval you like:

```
    var tag = location.hash.substring(1) || 'Plaça del sol',
        offlineTime = 120;
```

You can also get any tag by simply adding the tag as a hash `http://sol.smartcitizen.me/#Research`

