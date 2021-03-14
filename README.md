## Open MCT Coding Exercise Solution

*A realtime telemetry table*

![demo-1](./images/openmct-filter.gif)

> **Note**: this guide assumes you're using [Node](https://nodejs.org/) <= v14.0.0 and are familiar with [Git](https://git-scm.com/).

[Github Repo](https://github.com/laurynporte/laurynporte.github.io)

### HTML/CSS libraries used

 - [JQuery @3.5.1](https://jquery.com/)
 - [Bootstrap Table @1.18.2](https://bootstrap-table.com/)
 - [Bootstrap Styles @4.3.1](https://getbootstrap.com/docs/3.4/css/)
 - [Jekyll](https://jekyllrb.com/docs/)(README theme)


### Setup

1. Download & run the telemetry server 

```bash
	git clone https://github.com/nasa/openmct-tutorial.git 
```

To bypass CORS by adding the following to line 19 in `openmct-tutorial/example-server/server.js`

```js
  app.use(function(req, res, next) { 
	res.header("Access-Control-Allow-Origin", "*"); // * can be replaced by whatever server url is hosting your app
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
	next(); 
}); 
```

Install deps & run the server

```bash
	cd openmct-tutorial 
	npm install 
	npm start 
```

2. Download solution repo & open [solution.html](https://github.com/laurynporte/laurynporte.github.io/blob/main/solution.html) in your browser

```bash
	git clone https://github.com/laurynporte/laurynporte.github.io.git
	cd laurynporte.github.io
	open -a "Google Chrome" solution.html
```

 - Defaults to displaying /realtime and /history data by timestamp in desc order 
 - Table can be sorted by asc or desc timestamp order by clicking column arrows
 - Point event display & event subscription can be changed by selecting pwr.c" or "pwr.v" from the drop down and clicking the "filter" button
 - Point event display & event subscription to both point ids can be set by clicking the "clear" button
 - GET /history and /realtime calls availabe the network tab


### Next steps

 - Add unit tests
 - Refactor UI to use MVC + state management lib 
 - Include env variables 
 - Separate app.js into sep service files
 - Add caching layer

### Contact

Feel free to leave comments or feedback - thanks!


