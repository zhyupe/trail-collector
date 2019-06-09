(function () {
  var $id = function (id) { return document.getElementById(id) }
  var $clear = function (el) {
    var child
    while ((child = el.children[0])) {
      el.removeChild(child)
    }
  }

  var endpoint = 'https://qenkgteo.api.lncld.net/1.1/classes/Trails'
  var appid = ''
  var appkey = ''
  var trails = {
    '5240': '究极神兵破坏作战',
    '5241': '迦楼罗歼殛战',
    '5242': '泰坦歼殛战',
    '5243': '伊弗利特歼殛战',
    '5244': '莫古力贤王歼殛战',
    '5245': '利维亚桑歼殛战',
    '5246': '拉姆歼殛战',
    '5247': '希瓦歼殛战',
  }

  var trailIds = Object.keys(trails)

  var _init = function () {
    var arr = location.hash.substr(1).split('.')
    if (arr.length !== 3) {
      $id('configure').style.display = ''
      return false
    } 
    appid = arr[0]
    appkey = arr[1]
    endpoint = 'https://' + appid.substr(0, 8).toLowerCase() + '.api.lncld.net/1.1/classes/' + arr[2]
    $id('configure').style.display = 'none'
    return true
  }

  var $fetch = function (url, options) {
    if (!options) options = {}
    if (!options.headers) options.headers = {}
    Object.assign(options.headers, {
      'X-LC-Id': appid,
      'X-LC-Key': appkey,
      'Content-Type': 'application/json'
    })
    return fetch(url, options).then(function (a) { return a.json() })
  }

  var listTrails = function () {
    var now = new Date()
    var thisTue = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 2, 16, 0, 0)
    var thisTueTime = thisTue.getTime()

    $fetch(endpoint + '?where=' + encodeURIComponent(JSON.stringify({
      createdAt: {
        $gt: {
          __type: 'Date',
          iso: (now.getTime() < thisTueTime ? new Date(thisTueTime - 86400000 * 7) : thisTue).toISOString()
        }
      }
    }))).then(function (data) {
      var count = []
      var $body = $id('table-tbody')
      $clear($body)

      data.results.forEach(function (row) {
        var tr = document.createElement('tr')
        $body.appendChild(tr)

        var td = document.createElement('td')
        td.textContent = row.name
        tr.appendChild(td)

        var userTrailIds = row.trailIds.split(',')
        trailIds.forEach(function (trailId, index) {
          var td = document.createElement('td')
          if (userTrailIds.indexOf(trailId) !== -1) {
            td.className = 'active'
            td.textContent = '√'
            count[index] = (count[index] || 0) + 1
          }
          tr.appendChild(td)
        })
      })

      var $foot = $id('table-tfoot')
      $clear($foot)

      var tr = document.createElement('tr')
      $foot.appendChild(tr)

      var td = document.createElement('td')
      td.textContent = '统计'
      tr.appendChild(td)

      trailIds.forEach(function (trailId, index) {
        var td = document.createElement('td')
        td.textContent = count[index] || 0
        tr.appendChild(td)
      })
    })
  }
  
  var generateTHead = function () {
    var $head = $id('table-thead')
    $clear($head)

    var tr = document.createElement('tr')
    $head.appendChild(tr)

    var name = document.createElement('th')
    name.textContent = '角色'
    tr.appendChild(name)

    trailIds.forEach(function (trailId) {
      var th = document.createElement('th')
      th.textContent = trails[trailId]
      tr.appendChild(th)
    })
  }

  var generateCheckbox = function () {
    var $trails = $id('form-trails')
    $clear($trails)
    trailIds.forEach(function (trailId) {
      var label = document.createElement('label')
      $trails.appendChild(label)

      var checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.name = 'trail'
      checkbox.value = trailId
      label.appendChild(checkbox)

      var text = document.createDocumentFragment()
      text.textContent = trails[trailId]
      label.appendChild(text)
    })
  }

  window.reloadTrail = function () {
    listTrails()
  }

  window.createTrail = function () {
    var name = $id('form-name').value
    var userTrailIds = Array.from($id('form-trails').children).map(function (el) {
      return el.children[0]
    }).filter(function (el) {
      return el.checked
    }).map(function (el) {
      return el.value
    })

    if (!name || !userTrailIds.length) {
      alert('请将表单填写完整')
      return
    } 

    $fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        name,
        trailIds: userTrailIds.join(',')
      })
    }).then(function (res) {
      console.log(res)
      listTrails()
    })
  }

  window.init = function () {
    if (_init()) {
      generateCheckbox()
      generateTHead()
      listTrails()
    }
  }

  window.init()
})()