import axios from "axios";
import cookie from "react-cookies";

export var Session = (function () {
  var serverAddress = "";
  var configurations = {}

  const setServer = (url) => {
    serverAddress = url;
  }

  const syncSession = () => {
    query("/server/configurations").then((response) => {
      configurations = response.data;
    });
  }

  const getData = async (url, form) => {
    axios.defaults.headers.post["X-CSRFToken"] = cookie.load("csrftoken");
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.post["Accept"] = "application/json";
    return axios.get(serverAddress + url, form);
  }

  const query = async (url, form, config) => {
    axios.defaults.headers.post["X-CSRFToken"] = cookie.load("csrftoken");
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.post["Accept"] = "application/json";
    return axios.post(serverAddress + url, form, config);
  }

  return {
    setServer: setServer,
    syncSession: syncSession,
    getData: getData,
    query: query
  }

})();
