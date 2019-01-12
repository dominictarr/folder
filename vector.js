function assertNumber(n) {
  if(isNaN(n)) throw new Error('NaN')
  return n
}

function toAngle (v) {
  return Math.atan(v[1]/v[0])
}

function toVector (a) {
  return [Math.cos(a), Math.sin(a)]
}

function add(a, b) {
  return [a[0]+b[0], a[1]+b[1]]
}

function sub(a, b) {
  return [a[0]-b[0], a[1]-b[1]]
}

function mul(v, s) {
  return [v[0]*s, v[1]*s]
}

function div(v, s) {
  return [v[0]/s, v[1]/s]
}

//total length _ALONG_ a path
function length (p) {
  if(isShape(p)) {
    var l = 0
    for(var i = 1; i < p.length; i++)
      l += length(sub(p[i-1], p[i]))
    return l
  }

  return Math.sqrt(p[0]*p[0]+p[1]*p[1])
}

function normalize (v) {
  return div(v, length(v))
}


function top (p) {
  var min = Infinity
  for(var i = 0; i < p.length; i++) {
    var y = p[i][1]
    if(y < min) min = y
  }
  return min

}
function bottom (p) {
  var max = -Infinity
  for(var i = 0; i < p.length; i++) {
    var y = p[i][1]
    if(y > max) max = y
  }
  return max

}
function height (p) {
  var min = Infinity, max = -Infinity
  for(var i = 0; i < p.length; i++) {
    var y = p[i][1]
    if(y > max) max = y
    else if(y < min) min = y
  }
  return max - min
}


function isShape(v) {
  return Array.isArray(v) && v.length > 0 ? Array.isArray(v[0]) : true
}

function isVector (v) {
  return Array.isArray(v) && v.length === 2
}

function round(p, dist) {
  return [
    Math.round(p[0]*(1/dist))*dist,
    Math.round(p[1]*(1/dist))*dist
  ]
}

function translate(shape, move) {
  if(isShape(shape)) return shape.map(function (e) { return add(e, move) })
  return add(e, move)
}

module.exports = {
  toAngle, toVector, mul, div, add, sub, length, height, isShape, isVector, round, translate,
  normalize,
  top, bottom
}



