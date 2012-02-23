asyncMap = (arr, fn, cb) ->
  return cb {} if arr.length is 0
  todo = arr.length
  out = {}
  check = -> cb out if --todo is 0
  for item in arr
    console.log "Loading #{item}"
    fn item, (res) ->
      out[item] = res
      check()
  return

loadFile = (file, cb) ->
  return cb tease.loaded[file] if tease.loaded[file]
  downloadFile file, (res) ->
    eval res
    cb require file
  return

downloadFile = (file, cb) ->
  req = new XMLHttpRequest
  req.onload =  -> cb @responseText
  req.onerror = -> cb null
  req.open 'GET', window.require.toUrl(file), true
  req.send null
  return

window.tease =
  loaded: {}

loadDependencies = (dependencies, cb) ->
  asyncMap dependencies, loadFile, (obj) ->
    cb (val for key, val of obj)
  return

window.define = (name, dependencies, cb) ->
  loadDependencies dependencies, (deps) ->
    tease.loaded[name] = cb deps...
  return

window.require = (name) ->
  obj = tease.loaded[name]
  throw "#{name} not loaded" unless obj?
  return obj

window.require.toUrl = (file) ->
  return file if file.indexOf('http://') is 0 or file.indexOf('https://') is 0
  throw "Invalid file name #{file}" if file[file.length] is '/'
  index = file.lastIndexOf '.'
  if index isnt -1
    ext = file.substring index, file.length
    name = file.substring 0, index
  else
    ext = '.js'
    name = file
  {origin, pathname} = window.location
  return origin + pathname + name + ext