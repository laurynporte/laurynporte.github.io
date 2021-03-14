$(() => {
  const HISTORY_URL = "http://localhost:8080/history";
  const SOCKET_URL = "ws://localhost:8080/realtime";
  const PWR_C = "pwr.c";
  const PWR_V = "pwr.v";
  const POINT_IDS = [PWR_C,PWR_V];
   
  const $table = $('#telemetry-table');
  const $select = $('#select');

  let tableData = [];
  let socket = new WebSocket(SOCKET_URL);
  let subscriptionStatus = {
    [PWR_C]: false,
    [PWR_V]: false
  }

/*
 * Util methods for GET /history
 */
  const convertTimestampsToISO = (data) => data.map(data => {
  	return { ...data, timestamp: new Date(data.timestamp).toISOString() }
  });

  const withDateParams = (url) => dateParams => url + `?start=${dateParams.start}&end=${dateParams.end}`;

  function getFifteenMinuteDateRangeParams() {
    const minsToSubtract = 15;  
    const endDate = Date.now();
    const startDate = endDate - (minsToSubtract * 60 * 1000);
    return { start: startDate, end: endDate};
  };

  function generateHistoryUrl(pointId, dateParams) {
  	if(pointId && dateParams && POINT_IDS.indexOf(pointId) >= 0) {
	    const getHistoryUrl = withDateParams(`${HISTORY_URL}/${pointId}`)(dateParams)
	    return getHistoryUrl
  	}
  };

/*
 * GET /history API request for {POINT_IDS} telemetry data in last 15 min
 */
  function getHistoricalData() {
    isLoadingDisplayed(true);
    const dateParams = getFifteenMinuteDateRangeParams();
    $.when(
      $.ajax(generateHistoryUrl(PWR_C, dateParams)),
      $.ajax(generateHistoryUrl(PWR_V, dateParams))
    ).then(
      (pwrcData, pwrvData) => {
        const combinedHistoricalData = [...pwrcData[0], ...pwrvData[0]]
        const formattedData = convertTimestampsToISO(combinedHistoricalData);
        tableData = formattedData;
        isLoadingDisplayed(false);
        initTable(formattedData);
      },
      err => {
      	isLoadingDisplayed(false);
        console.log("Something went wrong: "+ JSON.stringify(request));
      }
    );
  };

/*
 * Util methods for /realtime subscribe & unsubscribe events
 */
  function isSubscribed(pointId) {
    return subscriptionStatus[pointId];
  };

  function subscribePointId(pointId) {
    socket.send(`subscribe ${pointId}`);
    subscriptionStatus[pointId] = true;
  };

  function unsubscribePointId(pointId) {
    socket.send(`unsubscribe ${pointId}`);
    subscriptionStatus[pointId] = false;
  };

  function toggleSubscriptionById(idToFilter) {
    const idNotFiltered = POINT_IDS.filter(id => id != idToFilter).pop();
    if(!isSubscribed(idToFilter)) { subscribePointId(idToFilter) };
    if(isSubscribed(idNotFiltered)) { unsubscribePointId(idNotFiltered) };
  };

  function subscribeToAll(){
    for (var i=0; i < POINT_IDS.length; i++) {
      const id = POINT_IDS[i]
      if(!isSubscribed(id)) {
        socket.send(`subscribe ${id}`);
        subscriptionStatus[id] = true;
      }
    }
  };

  function formatEventData({data}) {
    if(data && data.length) {
      const parsedData = JSON.parse(data);
      return convertTimestampsToISO([parsedData]);
    } else {
      return [];
    }
  };

/*
 * /realtime subscribe & unsubscribe to telemetry events
 */
  socket.onopen = function(e) {
    console.log("Socket Connection established");
    subscribeToAll();
  };

  socket.onmessage = function(event) {
    const newEventData = formatEventData(event)
    tableData = [...tableData, ...newEventData];

    $table.bootstrapTable("load", tableData);
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`Socket Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.log('Socket Connection died');
    }
  };

  socket.onerror = function(error) {
    console.log(`[error] ${error.message}`);
  };

/*
 * Utils for telemetry table
 */
  function datesSorter(a, b) {
     if (new Date(a) < new Date(b)) return 1;
     if (new Date(a) > new Date(b)) return -1;
     return 0;
  };

  function isLoadingDisplayed(isLoading) {
    const status = isLoading ? 'showLoading' : 'hideLoading';
    $table.bootstrapTable(status);
  };

/*
 * Telemetry table initializer
 */
  function initTable(data) {
    $table.bootstrapTable({
      toolbar: '.toolbar',
      columns: [
        {
          title: 'ID',
          field: 'id',
          sortable: 'true',
          filterControl: 'select',
        }, {
          title: 'Timestamp',
          field: 'timestamp',
          sortable: 'true',
          sorter: datesSorter,
        }, {
          title: 'Value',
          field: 'value'
        }],
        data: data
    })
  };

/*
 * Table filter selector initializer
 */
  function initToolbarSelectors() {
    POINT_IDS.map(id => {
      const option = `<option value=${id}>${id}</option>`
      $select.append(option)
    })
  };

/*
 * Table filter buttons handlers
 */
  $('#filterBy').click(function () {
    const idToFilter = $('[name="idToFilter"]').val()
    $table.bootstrapTable('filterBy', { id: idToFilter });
    toggleSubscriptionById(idToFilter);
  });

  $('#clear').click(function() {
    $table.bootstrapTable('filterBy', { id: POINT_IDS });
    subscribeToAll();
  });

/*
 * Setup UI
 */
  initToolbarSelectors();
  getHistoricalData();
});
