var cardinal = require('cardinal-spline-js/src/curve_calc').getCurvePoints

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

function mult(a, v) {
  return [a[0]*v, a[1]*v]
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

function isShape(v) {
  return Array.isArray(v) && v.length > 0 ? Array.isArray(v[0]) : true
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

function length (p) {
  if(isShape(p)) {
    var l = 0
    for(var i = 1; i < p.length; i++)
      l += length(sub(p[i-1], p[i]))
    return l
  }

  return Math.sqrt(p[0]*p[0]+p[1]*p[1])
}

/// ------------------------------

function curve (__points, steps) {
  var points = []
  var _points = cardinal(__points.reduce(function (a, b) {
    return a.concat(b)
  }), 0.5, Math.ceil(steps/(__points.length-1)))
  for(var i = 0; i < _points.length; i += 2)
    points.push([_points[i], _points[i+1]])
  console.error(points.length, _points.length, points[points.length-1])
//  console.error(points)
  return points
}

function toPath(points) {
  var s = 'M '+points[0].join(',') + ' '
  for(var i = 1; i < points.length; i++)
    s += 'L '+points[i].join(',') + ' '
  //s += 'L '+points[0].join(',')
  console.error(points[points.length-1])
  return s
}


function toTeeth (path, dir, odd) {
//  return path
//  return [].splice.call(path)
  var points = []
  for(var i = 0; i< path.length; i++) {
    if(i) {
      var v = mult(toVector(toAngle(sub(path[i], path[i-1])) - (Math.PI/2)), 2)
      var _e = add(path[i], v)
      if(!!(i % 2) == !!odd) {
        points.push(path[i])
        points.push(_e)
      } else {
        points.push(_e)
        points.push(path[i])
      }
    } else {
      points.push(path[i])
    }
  }
  return points
}

function round(p, dist) {
  return [
    Math.round(p[0]*(1/dist))*dist,
    Math.round(p[1]*(1/dist))*dist
  ]
}

function resample (path, parts) {
  var l = length(path)
  var output = [], consumed = 0
  output.push(path[0])
  var point = path[0], i = 1, step = l/parts
  //check step > 0 to handle edge case of rounding error at final edge.
  while(i < path.length && step > 0) {
    var _point = path[i]
    var diff = sub(_point, point)
    var _l = length(diff)
    if(step < _l) {
      output.push(point = add(point, mul(diff, step/_l)))
      consumed += step
      step = (l-consumed)/(parts-output.length)
    } else {
      point = _point
      step -= _l
      consumed += _l
      i++
    }
  }
  //if we didn't get the expected about, the last item must be a tiny rounding error...
  if(output.length < parts)
    output.push(path[path.length-1])
  return output
}

function translate(shape, move) {
  if(isShape(shape)) return shape.map(function (e) { return add(e, move) })
  return add(e, move)
}

console.log('<svg viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg">')

var keel = [[0, 15], [65, 6], [180, 5], [240, 10]]
var chine = [[0, 0], [120, 20], [240, 15]]
//side

var keelSpline = resample(curve(keel, 40), 21)
var chineSpline = resample(curve(chine, 40), 21)

var bottom =
  toTeeth(keelSpline, 1, true).reverse()
  .concat( translate(toTeeth(curve(chine, 22), 1, true), [0, 30]) )

var side = 
    [[0, 0]].concat(
      translate(toTeeth(chineSpline, 1, true), [0, 20])
    ).concat([[240, 0]])

var h = height(bottom)

side = side.map(function (e) { return add(e, [0, h+10]) })

console.log('<path fill="none" stroke="red" d="' +toPath(bottom) + ' Z"/>')
console.log('<path fill="none" stroke="blue" d="' +toPath(side) + ' Z"/>')

resample(keelSpline, 21).forEach(function (p) {
  console.log('<rect fill="black" x="'+ p[0] +'" y="'+ p[1] +'" width="1" height="1"/>')
})

console.log('</svg>')












