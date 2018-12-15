var cardinal = require('cardinal-spline-js/src/curve_calc').getCurvePoints
var _ = require('./vector')

function curve (__points, steps) {
  var points = []
  var _points = cardinal(__points.reduce(function (a, b) {
    return a.concat(b)
  }), 0.5, Math.ceil(steps/(__points.length-1)))
  for(var i = 0; i < _points.length; i += 2)
    points.push([_points[i], _points[i+1]])
  return points
}

function toPath(points) {
  var s = 'M '+points[0].join(',') + ' '
  for(var i = 1; i < points.length; i++)
    s += 'L '+points[i].join(',') + ' '
  return s
}

function toTeeth (path, dir, odd) {
  var points = []
  for(var i = 0; i < path.length; i++) {
    if(true && i) {
      var v = _.mul(_.toVector(_.toAngle(
          //on the very first point, use the next point
          //on the others, use the previous point.
          !i ? v.sub(path[i], path[i+1]) :
          _.sub(path[i], path[i-1])
        ) - (Math.PI/2)), 2)

      var _e = _.add(path[i], v)
      if(!!(i % 2) == !!odd) {
        points.push(path[i])
        if(true && i) points.push(_e)
      } else  {
        points.push(_e)
        if(true && i) points.push(path[i])
      }

    } else {
      var v = _.mul(_.toVector(_.toAngle(_.sub(path[i], path[i+1])) - (Math.PI/2)), 2)
      var _e = _.add(path[i], v)
      if(odd) {
        points.push(_e)
        points.push(path[i])
      } else {
        points.push(path[i])
        points.push(_e)
      }
    }
  }
  return points
}

function _resample (path, getStep) {
  var l = _.length(path)
  var output = [], consumed = 0
  output.push(path[0])
  var point = path[0], i = 1, step = getStep(l, 0)

  //check step > 0 to handle edge case of rounding error at final edge.
  while(i < path.length && step > 0) {
    var _point = path[i]
    var diff = _.sub(_point, point)
    var _l = _.length(diff)
    if(step < _l) {
      output.push(point = _.add(point, _.mul(diff, step/_l)))
      consumed += step
      step = getStep(l-consumed, output.length)
    } else {
      point = _point
      step -= _l
      consumed += _l
      i++
    }
  }
  //if we didn't get the expected about, the last item must be a tiny rounding error...
//  if(output.length < parts)
//    output.push(path[path.length-1])
  return output
}

function resample (path, parts) {
  var output = _resample(path, function (remaining_length, items) {
    return remaining_length / (parts-items)
  })
  if(output.length < parts)
    output.push(path[path.length-1])
  return output
}


var keel = [[0, 15], [65, 6], [180, 5], [240, 10]]
var chine = [[0, 0], [60, 14], [120, 22], [200, 17], [240, 9]]

var keelSpline = resample(curve(keel, 40), 21)
var chineSpline = resample(curve(chine, 40), 21)

function side(port) {
  return [[0, 0]].concat(
    _.translate(toTeeth(chineSpline, 1, true).slice(1), [0, 20])
  ).concat([[240, 0]])
}

function flip (path) {
  var top = _.top(path)
  var bottom = _.bottom(path)
  var height = bottom - top
  return path.map(function (e) {
    return [e[0], top = (bottom - e[1])]
  })
}

function bottom (port) {
  return toTeeth(keelSpline, 1, !!port).reverse()
  .concat(

    _.translate(toTeeth(chineSpline, 1, false).slice(1), [0, 40])
  )
}


//console.log('<path fill="none" stroke="blue" d="' + toPath(side) + ' Z"/>')
//console.log('<path fill="none" stroke="red" d="' +toPath(bottom) + ' Z"/>')

var parts = [
  side(),
  _.translate(flip(bottom(true)), [0, 45]),
  _.translate(bottom(), [0, 105]),
  _.translate(flip(side()), [0, 170])
]

console.log('<svg viewBox="-10 -10 250 250" xmlns="http://www.w3.org/2000/svg">')

//show plywood sheets...
console.log('<rect fill="none" stroke="green" x="0" y="0" width="240" height="120" />')
console.log('<rect fill="none" stroke="green" x="0" y="120" width="240" height="120" />')


function cut (path, colour) {
  console.log('<path fill="none" stroke="' + (colour || 'red') + '" d="'+toPath(path) + ' Z"/>')
}

function _toHoles(path, initial, step) {
//  initial = initial || 10
//  parts = parts || 21
  var points = _resample(path, function (length, steps) {
    console.error('toHoles', length, steps)
    return steps == 0 ? initial : step //(length + initial) / (parts-steps)
  })
  points.shift()
//  points[0] = _.add(points[0], [edge, 0])
//  points[points.length-1] = _.add(points[points.length-1], [-edge, 0])
  return points
}

function toHoles(path, odd) {
  path = curve(path, 40)
  var length = _.length(path)
  var second = 7
  var offset = odd ? 2 : 14.5
  return [].concat(
   // []
    _toHoles(path, offset, length/10)
  ).concat(
    _toHoles(path, second+offset, length/10)
//    _toHoles(path, odd ? 2+second : 14.5+second, length/20.2)
  )
}


function drill(holes) {
  holes.forEach(function (e, i) {
    console.log('<circle fill="none" stroke="black" cx="'+e[0]+'" cy="'+e[1]+'" r="0.5" />');
  })
}

function g() {
}

var _keel = keel.slice()

var hole_space = 2.5

//drill(toHoles(flip(_keel), 2))
//side
cut(parts[0], "red")
  console.log("<g>")
  g(drill(_.translate(toHoles(chine, true), [0, _.bottom(parts[0]) - _.bottom(chine) - hole_space])))
  console.log("</g>")

cut(parts[1], "red")
  console.log("<g>")
  g(drill(_.translate(flip(toHoles(chine, false)), [0, _.top(parts[1]) - _.top(chine) + hole_space])))
  g(drill(_.translate(flip(toHoles(keel, false)), [0, _.bottom(parts[1]) - _.bottom(flip(toHoles(keel))) - hole_space])))
  console.log("</g>")

cut(parts[2], "red")
  console.log("<g>")
//  g(drill(_.translate(toHoles(keel, 2), [0, _.top(parts[2]) - _.top(keel) + 5])))
//  g(drill(_.translate(toHoles(chine, 2), [0, _.bottom(parts[2]) - _.bottom(chine) - 5])))
  g(drill(_.translate(toHoles(keel, true), [0, _.top(parts[2]) - _.top(keel) + hole_space])))
  g(drill(_.translate(toHoles(chine, false), [0, _.bottom(parts[2]) - _.bottom(chine) - hole_space])))
  console.log("</g>")

cut(parts[3], "red")
  console.log("<g>")
  g(drill(_.translate(toHoles(flip(chine), true), [0, _.top(parts[3]) - _.top(chine) + hole_space])))
  console.log("</g>")

//drill(_.translate(flip(toHoles(keel, 2)), [0, _.bottom(parts[1]) - _.bottom(flip(keel)) - 5]))
//drill(_.translate(toHoles(keel, 2), [0, _.top(parts[2]) - _.top(keel) + 5]))


console.log('</svg>')




