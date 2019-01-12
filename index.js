var cardinal = require('cardinal-spline-js/src/curve_calc').getCurvePoints
var _ = require('./vector')

var scale = 5

var keel = [[0, 15], [65, 6], [180, 5], [240, 10]]
var chine = [[0, 0], [60, 14], [120, 22], [200, 17], [240, 9]]
var keelSpline = resample(curve(keel, 40), 11)
var chineSpline = resample(curve(chine, 40), 11)
var hole_space = 0, teeth = (chineSpline.length - 1) / 2, tooth_height = 1
var space = 2.5, space2 = tooth_height+2
var hole_radius = 0.3
function curve (__points, steps) {
  var points = []
  var _points = cardinal(__points.reduce(function (a, b) {
    return a.concat(b)
  }), 0.5, Math.ceil(steps/(__points.length-1)))
  for(var i = 0; i < _points.length; i += 2)
    points.push([_points[i], _points[i+1]])
  return points
}

function toTeeth (path, dir, odd) {
  var points = []
  for(var i = 0; i < path.length; i++) {
    //first tooth
    if(!i) {
      var v = _.mul(_.toVector(_.toAngle(_.sub(path[i], path[i+1])) - (Math.PI/2)), tooth_height)
      var _e = _.add(path[i], v)
      if(odd) {
        points.push(_e)
        points.push(path[i])
      } else {
        points.push(path[i])
        points.push(_e)
      }
    }
    else {
    //the rest of the teeth
      var v = _.mul(_.toVector(_.toAngle(
          //on the very first point, use the next point
          //on the others, use the previous point.
          !i ? v.sub(path[i], path[i+1]) :
          _.sub(path[i], path[i-1])
        ) - (Math.PI/2)), tooth_height)

      var _e = _.add(path[i], v)
      if(!!(i % 2) == !!odd) {
        points.push(path[i])
        if(true && i) points.push(_e)
      } else  {
        points.push(_e)
        if(true && i) points.push(path[i])
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

function side(port) {
  return [].concat(
    _.translate(toTeeth(chineSpline, 1, true).slice(1), [0, 20])
  ).concat(curve([[240, 5], [80, 3], [0,0]], 40))
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

console.log('<svg viewBox="' +[-10*scale, -10*scale, 250*scale, 250+scale].join(' ')+'" xmlns="http://www.w3.org/2000/svg">')

//show plywood sheets...
console.log('<rect fill="none" stroke="green" x="0" y="0" width="'+scale*240+'" height="'+120*scale+'" />')
console.log('<rect fill="none" stroke="green" x="0" y="'+scale*120+'" width="'+scale*240+'" height="'+scale*120+'" />')



function toPath(points) {
  var s = 'M '+_.mul(points[0], scale).join(',') + ' '
  for(var i = 1; i < points.length; i++)
    s += 'L '+_.mul(points[i], scale).join(',') + ' '
  return s
}


function cut (path, colour) {
  console.log('<path fill="none" stroke="' + (colour || 'red') + '" d="'+toPath(path) + ' Z"/>')
}

function eachEdge(path, iter) {
  for(var i = 0; i +1 < path.length; i += 1) {
    iter(path[i], path[i+1], i)
  }

}

function toHoles (path, odd, space, space2) {
  var output = []
  eachEdge(path, function (a, b, i) {
    console.error(i, i%2, odd)
    if(!(i%2) == odd) {
      var norm = _.normalize(_.sub(b, a))
      var right = _.toVector(_.toAngle(norm)+Math.PI/2)
      output.push(_.add(a, _.add(_.mul(norm, space), _.mul(right, space2))))
      output.push(_.add(b, _.add(_.mul(norm, -space), _.mul(right, space2))))
    }
  })
  return output
}


function drill(holes) {
  holes.forEach(function (e, i) {
    console.log('<circle fill="none" stroke="black" cx="'+e[0]*scale+'" cy="'+e[1]*scale+'" r="'+hole_radius*scale+'" />');
  })
}

function g() {
}

var _keel = keel.slice()

//side


cut(parts[0], "red")
  console.log("<g>")
  g(drill(_.translate(toHoles(chineSpline, true, space, -space2), [0, _.bottom(parts[0]) - _.bottom(chine)])))
  console.log("</g>")

cut(parts[1], "red")
  console.log("<g>")
  g(drill(_.translate(toHoles(flip(chineSpline), false, space, space2), [0, _.top(parts[1]) - _.top(chine)])))
  var b_holes = toHoles(flip(keelSpline), false, space, -space2)
//  g(drill(_.translate(b_holes, [0, _.bottom(parts[1]) - _.bottom(b_holes)])))
  g(drill(_.translate(b_holes, [0, _.bottom(parts[1]) - _.bottom(flip(keel))])))
  console.log("</g>")

cut(parts[2], "red")
  console.log("<g>")
  g(drill(_.translate(toHoles(keelSpline, true, space, space2), [0, _.top(parts[2]) - _.top(keel)])))
  g(drill(_.translate(toHoles(chineSpline, false, space, -space2), [0, _.bottom(parts[2]) - _.bottom(chine)])))
  console.log("</g>")

cut(parts[3], "red")
  console.log("<g>")
  g(drill(_.translate(toHoles(flip(chineSpline), true, space, space2), [0, _.top(parts[3]) - _.top(chine)])))
  console.log("</g>")


console.log('</svg>')


