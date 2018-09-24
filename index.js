var cardinal = require('cardinal-spline-js/src/curve_calc').getCurvePoints
//module.exports = function () {
  var points = []
  var _points = cardinal([[0, 30], [120, 60], [240, 45]].reduce(function (a, b) {
    return a.concat(b)
  }), 0.5, 22/2)
  for(var i = 0; i < _points.length; i += 2)
    points.push([_points[i], _points[i+1]])
//}

function toPath(points) {
  var s = 'M '+points[0].join(',') + ' '
  for(var i = 1; i < points.length; i++)
    s += 'L '+points[i].join(',') + ' '
  return s
}

console.log('<svg viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg">')
console.log('<path fill="none" stroke="blue" d="' +toPath(points) + ' Z"/>')
//console.log('<box
for(var i = 0; i < points.length; i++) {
  console.log('<rect x="'+points[i][0]+'" y="'+points[i][1]+'" width="1" height="1"/>')
}
  console.error(points)
//console.log('<path fill="none" stroke="blue" d="' +toPath(points) + ' Z"/>')
for(var i = 1; i < points.length; i++) {
  var v = mult(toVector(toAngle(sub(points[i], points[i-1])) - (Math.PI/2)), 2)

  var e = add(points[i], v)
  console.log('<rect x="'+e[0]+'" y="'+e[1]+'" width="1" height="1"/>')
}

function assertNumber(n) {
//  if(isNaN(n)) throw new Error('NaN')
  return n
}
//function toVector(a, b) {
//  console.error('toVector', a, b)
//  return [assertNumber(b[0]-a[0]), assertNumber(b[1] - a[1])]
//}

function toAngle (v) {
  console.error(v)
  return Math.atan(v[1]/v[0])
}

function toVector (a) {
//  assertNumber(a)
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

console.log('</svg>')











