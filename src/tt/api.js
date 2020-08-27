let serviceUri = 'serviceQuery/'

export function setServiceUri(arg0) {
  serviceUri = arg0
}

export function processSingleService(action, callback) {

  if (typeof action.service === 'function') {
    callback(action.service(action.parameters))
    return
  }
  if (action.serviceId) {
    fetch(serviceUri + action.serviceId, {
      method: 'POST',
      headers: {
        redirect: 'follow', cache: 'no-cache',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(action.parameters || {})
    })
      .then(response => {
        if (response.ok === false) {
          callback({ exception: response.status + ' : ' + response.statusText })
        } else {
          return response.json()
        }
      })
      .then(data => {
          callback(data)
        }
      )
      .catch(error => {
        callback({ exception: error.message })
      })
    return
  }
  callback()
}


export function processService(action, callback) {

  if (Array.isArray(action)) {
    action = { serviceId: 'processRequestList', parameters: { requestArray: JSON.stringify(action) } }
  }
  processSingleService(action, callback)
}
