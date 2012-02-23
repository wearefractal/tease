(function() {
  var asyncMap, downloadFile, loadDependencies, loadFile;

  asyncMap = function(arr, fn, cb) {
    var check, item, out, todo, _i, _len;
    if (arr.length === 0) return cb({});
    todo = arr.length;
    out = {};
    check = function() {
      if (--todo === 0) return cb(out);
    };
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      item = arr[_i];
      console.log("Loading " + item);
      fn(item, function(res) {
        out[item] = res;
        return check();
      });
    }
  };

  loadFile = function(file, cb) {
    if (tease.loaded[file]) return cb(tease.loaded[file]);
    downloadFile(file, function(res) {
      eval(res);
      return cb(require(file));
    });
  };

  downloadFile = function(file, cb) {
    var req;
    req = new XMLHttpRequest;
    req.onload = function() {
      return cb(this.responseText);
    };
    req.onerror = function() {
      return cb(null);
    };
    req.open('GET', window.require.toUrl(file), true);
    req.send(null);
  };

  window.tease = {
    loaded: {}
  };

  loadDependencies = function(dependencies, cb) {
    asyncMap(dependencies, loadFile, function(obj) {
      var key, val;
      return cb((function() {
        var _results;
        _results = [];
        for (key in obj) {
          val = obj[key];
          _results.push(val);
        }
        return _results;
      })());
    });
  };

  window.define = function(name, dependencies, cb) {
    loadDependencies(dependencies, function(deps) {
      return tease.loaded[name] = cb.apply(null, deps);
    });
  };

  window.require = function(name) {
    var obj;
    obj = tease.loaded[name];
    if (obj == null) throw "" + name + " not loaded";
    return obj;
  };

  window.require.toUrl = function(file) {
    var ext, index, name, origin, pathname, _ref;
    if (file.indexOf('http://') === 0 || file.indexOf('https://') === 0) {
      return file;
    }
    if (file[file.length] === '/') throw "Invalid file name " + file;
    index = file.lastIndexOf('.');
    if (index !== -1) {
      ext = file.substring(index, file.length);
      name = file.substring(0, index);
    } else {
      ext = '.js';
      name = file;
    }
    _ref = window.location, origin = _ref.origin, pathname = _ref.pathname;
    return origin + pathname + name + ext;
  };

}).call(this);
