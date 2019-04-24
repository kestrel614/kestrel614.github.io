function Pie_Visualization() {return function(controller, Zoomdata) {
/*
 * Copyright (C) Zoomdata, Inc. 2012-2014. All rights reserved.
 */
(function() {
	var CanvablePath = function(e) {
		e = e.replace(/,/gm, " ");
		e = e.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2");
		e = e.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2");
		e = e.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, "$1 $2");
		e = e.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2");
		e = e.replace(/([0-9])([+\-])/gm, "$1 $2");
		e = e.replace(/(\.[0-9]*)(\.)/gm, "$1 $2");
		e = e.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, "$1 $3 $4 ");
		e = CanvablePath.compressSpaces(e);
		e = CanvablePath.trim(e);
		this.PathParser = new function(e) {
			this.tokens = e.split(" ");
			this.reset = function() {
				this.i = -1;
				this.command = "";
				this.previousCommand = "";
				this.start = new CanvablePath.Point(0, 0);
				this.control = new CanvablePath.Point(0, 0);
				this.current = new CanvablePath.Point(0, 0);
				this.points = [];
				this.angles = []
			};
			this.isEnd = function() {
				return this.i >= this.tokens.length - 1
			};
			this.isCommandOrEnd = function() {
				if (this.isEnd()) return true;
				return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null
			};
			this.isRelativeCommand = function() {
				switch (this.command) {
					case "m":
					case "l":
					case "h":
					case "v":
					case "c":
					case "s":
					case "q":
					case "t":
					case "a":
					case "z":
						return true;
						break
				}
				return false
			};
			this.getToken = function() {
				this.i++;
				return this.tokens[this.i]
			};
			this.getScalar = function() {
				return parseFloat(this.getToken())
			};
			this.nextCommand = function() {
				this.previousCommand = this.command;
				this.command = this.getToken()
			};
			this.getPoint = function() {
				var e = new CanvablePath.Point(this.getScalar(), this.getScalar());
				return this.makeAbsolute(e)
			};
			this.getAsControlPoint = function() {
				var e = this.getPoint();
				this.control = e;
				return e
			};
			this.getAsCurrentPoint = function() {
				var e = this.getPoint();
				this.current = e;
				return e
			};
			this.getReflectedControlPoint = function() {
				if (this.previousCommand.toLowerCase() != "c" && this.previousCommand.toLowerCase() != "s" && this.previousCommand.toLowerCase() != "q" && this.previousCommand.toLowerCase() != "t") {
					return this.current
				}
				var e = new CanvablePath.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
				return e
			};
			this.makeAbsolute = function(e) {
				if (this.isRelativeCommand()) {
					e.x += this.current.x;
					e.y += this.current.y
				}
				return e
			};
			this.addMarker = function(e, t, n) {
				if (n != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
					this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(n)
				}
				this.addMarkerAngle(e, t == null ? null : t.angleTo(e))
			};
			this.addMarkerAngle = function(e, t) {
				this.points.push(e);
				this.angles.push(t)
			};
			this.getMarkerPoints = function() {
				return this.points
			};
			this.getMarkerAngles = function() {
				for (var e = 0; e < this.angles.length; e++) {
					if (this.angles[e] == null) {
						for (var t = e + 1; t < this.angles.length; t++) {
							if (this.angles[t] != null) {
								this.angles[e] = this.angles[t];
								break
							}
						}
					}
				}
				return this.angles
			}
		}(e);
		
		this.bounds = function() {
			return this.draw(null)
		};
		this.draw = function(e) {
			var t = this.PathParser;
			t.reset();
			var n = new CanvablePath.BoundingBox;
			if (e != null) e.beginPath();
			while (!t.isEnd()) {
				t.nextCommand();
				switch (t.command) {
					case "M":
					case "m":
						var r = t.getAsCurrentPoint();
						t.addMarker(r);
						n.addPoint(r.x, r.y);
						if (e != null) e.moveTo(r.x, r.y);
						t.start = t.current;
						while (!t.isCommandOrEnd()) {
							var r = t.getAsCurrentPoint();
							t.addMarker(r, t.start);
							n.addPoint(r.x, r.y);
							if (e != null) e.lineTo(r.x, r.y)
						}
						break;
					case "L":
					case "l":
						while (!t.isCommandOrEnd()) {
							var i = t.current;
							var r = t.getAsCurrentPoint();
							t.addMarker(r, i);
							n.addPoint(r.x, r.y);
							if (e != null) e.lineTo(r.x, r.y)
						}
						break;
					case "H":
					case "h":
						while (!t.isCommandOrEnd()) {
							var s = new CanvablePath.Point((t.isRelativeCommand() ? t.current.x : 0) + t.getScalar(), t.current.y);
							t.addMarker(s, t.current);
							t.current = s;
							n.addPoint(t.current.x, t.current.y);
							if (e != null) e.lineTo(t.current.x, t.current.y)
						}
						break;
					case "V":
					case "v":
						while (!t.isCommandOrEnd()) {
							var s = new CanvablePath.Point(t.current.x, (t.isRelativeCommand() ? t.current.y : 0) + t.getScalar());
							t.addMarker(s, t.current);
							t.current = s;
							n.addPoint(t.current.x, t.current.y);
							if (e != null) e.lineTo(t.current.x, t.current.y)
						}
						break;
					case "C":
					case "c":
						while (!t.isCommandOrEnd()) {
							var o = t.current;
							var u = t.getPoint();
							var a = t.getAsControlPoint();
							var f = t.getAsCurrentPoint();
							t.addMarker(f, a, u);
							n.addBezierCurve(o.x, o.y, u.x, u.y, a.x, a.y, f.x, f.y);
							if (e != null) e.bezierCurveTo(u.x, u.y, a.x, a.y, f.x, f.y)
						}
						break;
					case "S":
					case "s":
						while (!t.isCommandOrEnd()) {
							var o = t.current;
							var u = t.getReflectedControlPoint();
							var a = t.getAsControlPoint();
							var f = t.getAsCurrentPoint();
							t.addMarker(f, a, u);
							n.addBezierCurve(o.x, o.y, u.x, u.y, a.x, a.y, f.x, f.y);
							if (e != null) e.bezierCurveTo(u.x, u.y, a.x, a.y, f.x, f.y)
						}
						break;
					case "Q":
					case "q":
						while (!t.isCommandOrEnd()) {
							var o = t.current;
							var a = t.getAsControlPoint();
							var f = t.getAsCurrentPoint();
							t.addMarker(f, a, a);
							n.addQuadraticCurve(o.x, o.y, a.x, a.y, f.x, f.y);
							if (e != null) e.quadraticCurveTo(a.x, a.y, f.x, f.y)
						}
						break;
					case "T":
					case "t":
						while (!t.isCommandOrEnd()) {
							var o = t.current;
							var a = t.getReflectedControlPoint();
							t.control = a;
							var f = t.getAsCurrentPoint();
							t.addMarker(f, a, a);
							n.addQuadraticCurve(o.x, o.y, a.x, a.y, f.x, f.y);
							if (e != null) e.quadraticCurveTo(a.x, a.y, f.x, f.y)
						}
						break;
					case "A":
					case "a":
						while (!t.isCommandOrEnd()) {
							var o = t.current;
							var l = t.getScalar();
							var c = t.getScalar();
							var h = t.getScalar() * (Math.PI / 180);
							var p = t.getScalar();
							var d = t.getScalar();
							var f = t.getAsCurrentPoint();
							var v = new CanvablePath.Point(Math.cos(h) * (o.x - f.x) / 2 + Math.sin(h) * (o.y - f.y) / 2, -Math.sin(h) * (o.x - f.x) / 2 + Math.cos(h) * (o.y - f.y) / 2);
							var m = Math.pow(v.x, 2) / Math.pow(l, 2) + Math.pow(v.y, 2) / Math.pow(c, 2);
							if (m > 1) {
								l *= Math.sqrt(m);
								c *= Math.sqrt(m)
							}
							var g = (p == d ? -1 : 1) * Math.sqrt((Math.pow(l, 2) * Math.pow(c, 2) - Math.pow(l, 2) * Math.pow(v.y, 2) - Math.pow(c, 2) * Math.pow(v.x, 2)) / (Math.pow(l, 2) * Math.pow(v.y, 2) + Math.pow(c, 2) * Math.pow(v.x, 2)));
							if (isNaN(g)) g = 0;
							var y = new CanvablePath.Point(g * l * v.y / c, g * -c * v.x / l);
							var b = new CanvablePath.Point((o.x + f.x) / 2 + Math.cos(h) * y.x - Math.sin(h) * y.y, (o.y + f.y) / 2 + Math.sin(h) * y.x + Math.cos(h) * y.y);
							var w = function(e) {
								return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2))
							};
							var E = function(e, t) {
								return (e[0] * t[0] + e[1] * t[1]) / (w(e) * w(t))
							};
							var S = function(e, t) {
								return (e[0] * t[1] < e[1] * t[0] ? -1 : 1) * Math.acos(E(e, t))
							};
							var x = S([1, 0], [(v.x - y.x) / l, (v.y - y.y) / c]);
							var T = [(v.x - y.x) / l, (v.y - y.y) / c];
							var N = [(-v.x - y.x) / l, (-v.y - y.y) / c];
							var C = S(T, N);
							if (E(T, N) <= -1) C = Math.PI;
							if (E(T, N) >= 1) C = 0;
							var k = 1 - d ? 1 : -1;
							var L = x + k * (C / 2);
							var A = new CanvablePath.Point(b.x + l * Math.cos(L), b.y + c * Math.sin(L));
							t.addMarkerAngle(A, L - k * Math.PI / 2);
							t.addMarkerAngle(f, L - k * Math.PI);
							n.addPoint(f.x, f.y);
							if (e != null) {
								var E = l > c ? l : c;
								var O = l > c ? 1 : l / c;
								var M = l > c ? c / l : 1;
								e.translate(b.x, b.y);
								e.rotate(h);
								e.scale(O, M);
								e.arc(0, 0, E, x, x + C, 1 - d);
								e.scale(1 / O, 1 / M);
								e.rotate(-h);
								e.translate(-b.x, -b.y)
							}
						}
						break;
					case "Z":
					case "z":
						if (e != null) e.closePath();
						t.current = t.start
				}
			}
			return n
		};
		
		this.getMarkers = function() {
			var e = this.PathParser.getMarkerPoints();
			var t = this.PathParser.getMarkerAngles();
			var n = [];
			for (var r = 0; r < e.length; r++) {
				n.push([e[r], t[r]])
			}
			return n
		}
	};
	
	
	CanvablePath.trim = function(e) {
		return e.replace(/^\s+|\s+$/g, "")
	};

	CanvablePath.compressSpaces = function(e) {
		return e.replace(/[\s\r\t\n]+/gm, " ")
	};

	CanvablePath.Point = function(e, t) {
		this.x = e;
		this.y = t
	};

	CanvablePath.Point.prototype.angleTo = function(e) {
		return Math.atan2(e.y - this.y, e.x - this.x)
	};

	CanvablePath.Point.prototype.applyTransform = function(e) {
		var t = this.x * e[0] + this.y * e[2] + e[4];
		var n = this.x * e[1] + this.y * e[3] + e[5];
		this.x = t;
		this.y = n
	};

	CanvablePath.BoundingBox = function(e, t, n, r) {
		this.x1 = Number.NaN;
		this.y1 = Number.NaN;
		this.x2 = Number.NaN;
		this.y2 = Number.NaN;
		this.x = function() {
			return this.x1
		};
		this.y = function() {
			return this.y1
		};
		this.width = function() {
			return this.x2 - this.x1
		};
		this.height = function() {
			return this.y2 - this.y1
		};
		this.addPoint = function(e, t) {
			if (e != null) {
				if (isNaN(this.x1) || isNaN(this.x2)) {
					this.x1 = e;
					this.x2 = e
				}
				if (e < this.x1) this.x1 = e;
				if (e > this.x2) this.x2 = e
			}
			if (t != null) {
				if (isNaN(this.y1) || isNaN(this.y2)) {
					this.y1 = t;
					this.y2 = t
				}
				if (t < this.y1) this.y1 = t;
				if (t > this.y2) this.y2 = t
			}
		};
		this.addX = function(e) {
			this.addPoint(e, null)
		};
		this.addY = function(e) {
			this.addPoint(null, e)
		};
		this.addBoundingBox = function(e) {
			this.addPoint(e.x1, e.y1);
			this.addPoint(e.x2, e.y2)
		};
		this.addQuadraticCurve = function(e, t, n, r, i, s) {
			var o = e + 2 / 3 * (n - e);
			var u = t + 2 / 3 * (r - t);
			var a = o + 1 / 3 * (i - e);
			var f = u + 1 / 3 * (s - t);
			this.addBezierCurve(e, t, o, a, u, f, i, s)
		};
		this.addBezierCurve = function(e, t, n, r, s, o, u, a) {
			var f = [e, t],
				l = [n, r],
				c = [s, o],
				h = [u, a];
			this.addPoint(f[0], f[1]);
			this.addPoint(h[0], h[1]);
			for (i = 0; i <= 1; i++) {
				var p = function(e) {
					return Math.pow(1 - e, 3) * f[i] + 3 * Math.pow(1 - e, 2) * e * l[i] + 3 * (1 - e) * Math.pow(e, 2) * c[i] + Math.pow(e, 3) * h[i]
				};
				var d = 6 * f[i] - 12 * l[i] + 6 * c[i];
				var v = -3 * f[i] + 9 * l[i] - 9 * c[i] + 3 * h[i];
				var m = 3 * l[i] - 3 * f[i];
				if (v == 0) {
					if (d == 0) continue;
					var g = -m / d;
					if (0 < g && g < 1) {
						if (i == 0) this.addX(p(g));
						if (i == 1) this.addY(p(g))
					}
					continue
				}
				var y = Math.pow(d, 2) - 4 * m * v;
				if (y < 0) continue;
				var b = (-d + Math.sqrt(y)) / (2 * v);
				if (0 < b && b < 1) {
					if (i == 0) this.addX(p(b));
					if (i == 1) this.addY(p(b))
				}
				var w = (-d - Math.sqrt(y)) / (2 * v);
				if (0 < w && w < 1) {
					if (i == 0) this.addX(p(w));
					if (i == 1) this.addY(p(w))
				}
			}
		};
		this.isPointInBox = function(e, t) {
			return this.x1 <= e && e <= this.x2 && this.y1 <= t && t <= this.y2
		};
		this.addPoint(e, t);
		this.addPoint(n, r)
	}

	var width = $(controller.element).width(),
		height = $(controller.element).height(),
		container = $(controller.element),
		radius = Math.min(width, height) / 2 - 40,
		margin = {top: 0, right: 0, bottom: 0, left: 0},
		pixelRatio = window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI,
		animationDuration = 900,
		stopAnimation = false,
		animationTimeoutID,
		labelDistance = 0.8,
		vendorPrefix = getVendorPrefix(),
		maxLimit = 15,
		detachedContainer = null,
		dataContainer = null,
		labelDataContainer = [], // Create variable for the label data
		layout = null,		   // Labels container
		canv = null,			 // Canvas
		con = null,			  // Context
		listenersArr = [],	   // Manage canvas listeners
		isRendered = false,	  // Check if canvas already rendered
		isTouch = isTouchDevice();
		
	initLabels();

	var pie = new PieChart();
	var renderer = new LabelsRenderer();

	function isInt(n) {
		return n % 1 === 0;
	}

	function PieChart() {
		var self = this,
			pie = d3.layout.pie()
				.value(function(d) { return Math.abs(controller.metrics["Size"].raw(d.original)); })
				.sort(null),
			arc = d3.svg.arc()
				.innerRadius(0)
				.outerRadius(radius * 0.7),
			colorScale = d3.scale.ordinal(),
			path;

		this.drawGraphics = function(data) {
			// Draw canvas element
			if (d3.select(controller.element).select("canvas").empty()) {
				canv = d3.select(controller.element).append("canvas")
					.attr("width", width * pixelRatio + "px")
					.attr("height", height * pixelRatio + "px")
					.style("position", "absolute")
					.style("left", margin.left + "px")
					.style("top", margin.top + "px");

			} else {
				canv = d3.select(controller.element).select("canvas");
			}

			canv = canv.node();

			// To prevent canvas redrawing (and visualisation blinking in safary) we shouldn't
			// redefine canvas width and height here
			/*canv.width = width * pixelRatio;
			 canv.height = height * pixelRatio;
			 canv.style.width = width + 'px';
			 canv.style.height = height + 'px';*/

			// Create an in memory only element of type 'custom'
			if (detachedContainer === null) {
				detachedContainer = document.createElement("svg");
			}

			// Create a d3 selection for the detached container. We won't
			// actually be attaching it to the DOM.
			dataContainer = d3.select(detachedContainer);

			if (con === null) {
				//Need to invoke only once 
				con = canv.getContext('2d');

				// Translate to center pie.
				con.translate(canv.width / (2 * pixelRatio), canv.height / (2 * pixelRatio));
			}

			if (canv !== null && !isRendered) {
				canv.width = width * pixelRatio;
				canv.height = height * pixelRatio;
				canv.style.width = width + 'px';
				canv.style.height = height + 'px';

				con.scale(pixelRatio, pixelRatio);
				con.translate(canv.width / (2 * pixelRatio), canv.height / (2 * pixelRatio));
				isRendered = true;
			}

			path = dataContainer
				.datum(data)
				.selectAll("path.path")
				.data(pie);

			path.enter().append("path")
				.classed("path", true)
				.attr("d", "")
				.attr('fill', function(d) { return colorScale(d.data.group); })
				.each(function(d) {
					this._current = {
						startAngle: d.startAngle,
						//set endAngle to startAngle for transition
						endAngle: d.startAngle
					};
				});

			path.exit()
				.transition()
				.remove();

			path
				.transition()
				.duration(animationDuration)
				.attr('fill', function(d) { return colorScale(d.data.group); })
				.attrTween('d', this.arcTween);

			stopAnimationAfterDelay(animationDuration * 1.1);

		}

		this.getPath = function() {
			return path;
		}

		// Store the displayed angles in _current.
		// Then, interpolate from _current to the new angles.
		// During the transition, _current is updated in-place by d3.interpolate.
		this.arcTween = function(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
				return arc(i(t));
			};
		}

		this.setColorScale = function(domain, range) {
			if (arguments.length > 1) {
				colorScale
					.domain(domain)
					.range(range);
			}
		}

		this.setArc = function(radius) {
			if (arguments.length > 0) {
				arc.innerRadius(0)
					.outerRadius(radius * 0.7);
			}
		}

		this.getColorScale = function() {
			return colorScale;
		}

		this.getArc = function() {
			return arc;
		}
	}

	function LabelsRenderer() {
		var self = this;

		this.arcs = null;		   // Pass set of arcs
		this.arc = null;			// Pass arc function
		this.geometry = [];		 // Pass geometry data
		this.outerRadius = 0;	   // Outer circle radius
		this.labelsArr = [];		// Array of formatted labels
		this.detachedLabels = null; // Abstract DOM element
		this.lContainer = null;	 // Container of path elements in abstract DOM element
		this.showCircle = false;	// Flag that show or hide small circles between line and pie
		this.isOverlapp = false;	// Flag that allow or disable prevent labels overlapping algorithm
		this.labelsLimit = controller.state.get("limit"); // Labels limit
		this.minAngle = 0.1;		// Minimum angle of arc from wich label should be shown
		this.limits = { top: 0,	 // Maximum sizes of labels
			bottom: 0,
			left: 0,
			right: 0
		};

		// Geometry variables
		this.nominalLength = 20;	// Nominal length of line between circle and label
		this.fontSize = 14;
		this.distanceCoef = 20;
		this.circleRadius = 5;

		function arcsData() {
			if (self.arcs !== null && self.arc !== null) {
				self.geometry = [];
				self.labelsArr = [];

				// Filter arcs by minimum angle for which labels should displays
				arcsLimit();

				self.arcs.each(function(d) {
					var beginPoint = lineCoordinates(d, self.outerRadius),					  // Begin point of line
						endPoint = lineCoordinates(d, self.outerRadius + self.nominalLength),   // End point of line
						label = labelsContainer(d.data),										// Labels for current data
						underline = underlineLength(label),									 // Label length for underlying line
						idealAngle = (d.startAngle + d.endAngle) / 2,						   // Middle angle
						alignment = function() {												// Side where label placed
							var obj = {};

							idealAngle > Math.PI ? obj.horizontal = "left" : obj.horizontal = "right";
							idealAngle > Math.PI/2 && idealAngle < (3/2) * Math.PI ? obj.vertical = "bottom" : obj.vertical = "top";
							return obj;
						};

					var x2u; // Second x coordinate of underlined line

					idealAngle > Math.PI ? x2u = endPoint.x - underline : x2u = endPoint.x + underline;

					var geoObj = {
						x1: beginPoint.x,
						y1: beginPoint.y,
						x2: endPoint.x,
						y2: endPoint.y,
						x2u: x2u,
						alignment: alignment(),
						group: d.data.group,
						idealAngle: idealAngle,
						underline: underline
					};

					self.geometry.push(geoObj);
					d.geometry = geoObj;
					d.dataLabels = label;

				});
			}
			//return self;
		};

		function arcsLimit() {
			var showEach;
			if (self.labelsLimit !== controller.state.get("limit")) {
				showEach = Math.ceil(self.arcs.size() / self.labelsLimit);
			} else {
				showEach = 1;
			}
			self.arcs = self.arcs.filter(function(d, i) { showEach === 0 ? showEach = 1 : showEach; return (d.endAngle - d.startAngle > self.minAngle) && (i%showEach === 0); });
		}

		// Recalculate lines length to prevent overlaying
		function noOverlapp() {
			var splittedData = {topLeft: [], bottomLeft: [], topRight: [], bottomRight: []},
				mergedData = [];

			function splitData(object) {
				if (object.alignment.horizontal === "left" && object.alignment.vertical === "top") {
					splittedData.topLeft.push(object)
				} else if ( object.alignment.horizontal === "left" && object.alignment.vertical === "bottom" ) {
					splittedData.bottomLeft.push(object)
				} else if ( object.alignment.horizontal === "right" && object.alignment.vertical === "top" ) {
					splittedData.topRight.push(object)
				} else if ( object.alignment.horizontal === "right" && object.alignment.vertical === "bottom" ) {
					splittedData.bottomRight.push(object)
				}
			}

			function compare(a,b) {
				if (a.x2 > b.x2) {
					return 1
				} else if (a.x2 < b.x2) {
					return -1;
				} else {
					return 0;
				}
			}

			self.geometry.filter(splitData);

			// Process data
			for (var key in splittedData) {
				// Sort data
				splittedData[key].sort(compare);
				if ( key === "topRight" || key === "bottomRight" ) {
					splittedData[key].reverse();
				}

				// Recalculate coordinates
				for (var i = 0; i < splittedData[key].length - 1; i++) {
					var dif, distance, next = splittedData[key][i+1];

					if (key === "topLeft" || key === "topRight") {
						dif = splittedData[key][i].y2 - splittedData[key][i+1].y2;
						distance = self.distanceCoef - dif;
						if (dif < self.distanceCoef ) {
							next.y2 -= distance;
						}
					}
					if (key === "bottomLeft" || key === "bottomRight") {
						dif = splittedData[key][i+1].y2 - splittedData[key][i].y2;
						distance = self.distanceCoef - dif;
						if (dif < self.distanceCoef ) {
							next.y2 += distance;
						}
					}
				}

				for (var j = 0; j < splittedData[key].length; j++) {
					mergedData.push(splittedData[key][j]);
				}
			}

			self.geometry = [];
			self.arcs.each(function(d, i) {
				$.each(mergedData, function(index, object) {
					if (d.data.group === object.group) {
						d.geometry = object;
					}
				});
				self.geometry.push(d.geometry);
			});

			//return self;
		}

		function defineLimits() {
			Array.limitsY = function (array, prop) {
				var values = array.map(function (el) {
					return el[prop];
				});
				return [Math.max.apply(Math, values), Math.min.apply(Math, values)];
			};

			self.limits.bottom = Array.limitsY(self.geometry, 'y2')[0];
			self.limits.top = Array.limitsY(self.geometry, 'y2')[1];
			self.limits.right = Array.limitsY(self.geometry, 'x2u')[0];
			self.limits.left = Array.limitsY(self.geometry, 'x2u')[1];

			//console.log(self.limits);
		}

		// Calculate coordinates of new line based on D3 arc centroid
		function lineCoordinates(data, distance) {
			var arcCenter = self.arc.centroid(data),
				length = Math.sqrt(arcCenter[0]*arcCenter[0] + arcCenter[1]*arcCenter[1]), // Length from center to middle point
				simCoef = distance/length,
				center = [width/2, height/2],
				x = arcCenter[0] * simCoef + center[0],
				y = arcCenter[1] * simCoef + center[1];

			return {x: x, y: y};
		}

		// Generate a list of formatted labels
		function labelsContainer(data) {
			var dataLabel = data.group,
				dataValue = function() {
					var metricData = controller.metrics["Size"].raw(data.original),
						metric = controller.metrics["Size"],
						metricType = metric.get('type'),
						axisFormatter = d3.format("s"),
						formattedValue;

					if (!isInt(metricData)) {
						axisFormatter = d3.format(",.2f");
						formattedValue = axisFormatter(metricData);
					}
					else if(metricType === "MONEY") {
						axisFormatter = d3.format("$s");
						formattedValue = axisFormatter(metricData);
					} else {
						formattedValue = axisFormatter(metricData);
					}

					formattedValue = formattedValue.replace('G', 'B');

					return formattedValue;
				},
				dataObj;

			dataObj = {
				label: dataLabel,
				value: dataValue()
			}

			self.labelsArr.push(dataObj);
			return dataObj;
		}

		function underlineLength(labels) {
			var dataText = labels.label + ": " + labels.value,
				length;

			var container = d3.select(controller.element).append("div")
				.attr("class", "label-length")
				.style("opacity", 0)
				.style("display", "inline-block")
				.style("font-size", self.fontSize + "px")
				.text(dataText);

			length = $(container.node()).width();
			container.remove();

			return length;
		}

		this.renderer = function() {
			arcsData();
			this.isOverlapp ? noOverlapp() : null;
			defineLimits();

			// Create an in memory only element of type 'custom'
			if (this.detachedLabels === null) {
				this.detachedLabels = document.createElement("svg");
			}

			// Create a d3 selection for the detached container. We won't
			// actually be attaching it to the DOM.
			this.lContainer = d3.select(this.detachedLabels);

			var labelsContainer = this.lContainer
				.datum(this.arcs.data())
				.selectAll("g.label-container")
				.data(this.arcs.data(), function(d) { return d.data.group; });

			var labels = labelsContainer.enter().append("g")
				.classed("label-container", true)

			// Render lines
			labels.append("path")
				.attr("class", "labels")
				.attr("d", "")
				.style("stroke", "#006600")
				.style("stroke-width", "1px")
				.style("fill", "none");

			labels.append("text")
				.attr("class", "label-text")
				.attr("font", this.fontSize)
				.attr("x", 0)
				.attr("y", 0)
				.attr("color", function(d) {
					/*var scale = pie.getColorScale();
					 return scale(d.data.group);*/
					return "#000";
				})
				.text(function(d, i) {
					return d.dataLabels.label + ": " + d.dataLabels.value;
				});

			labels.append("circle")
				.attr("class", "label-circle")
				.attr("cx", function(d) {
					return d.geometry.x1 - width/2;
				})
				.attr("cy", function(d) {
					return d.geometry.y1 - height/2;
				})
				.attr("r", 0)
				.attr("fill", function(d) {
					var scale = pie.getColorScale();
					return scale(d.data.group);
				});

			// Render text
			labelsContainer.select("path")
				.transition()
				.duration(animationDuration)
				.attr('d', function(d) {
					return "M" + (d.geometry.x1 - width/2) + "," + (d.geometry.y1 - height/2) + "L" +(d.geometry.x2 - width/2) + "," + (d.geometry.y2 - height/2) + "L" + (d.geometry.x2u - width/2) + "," + (d.geometry.y2 - height/2);
				});

			labelsContainer.select("text")
				.transition()
				.duration(animationDuration)
				.attr("font", this.fontSize)
				.attr("x", function(d) {
					if ( (d.startAngle + d.endAngle) / 2 > Math.PI) {
						return d.geometry.x2u - width / 2;
					} else {
						return d.geometry.x2 - width / 2;
					}
				})
				.attr("y", function(d) {
					return d.geometry.y2 - height/2 - 5;
				})
				.text(function(d, i) {
					return d.dataLabels.label + ": " + d.dataLabels.value;
				});

			labelsContainer.select("circle")
				.transition()
				.duration(animationDuration)
				.attr("cx", function(d) {
					return d.geometry.x1 - width/2;
				})
				.attr("cy", function(d) {
					return d.geometry.y1 - height/2;
				})
				.attr("r", function() {
					if (self.showCircle) {
						return self.circleRadius;
					} else {
						return 0;
					}
				})
				.attr("fill", function(d) {
					var scale = pie.getColorScale();
					return scale(d.data.group);
				});

			labelsContainer.exit()
				.transition()
				.remove();
		};

		this.showCircles = function(flag) {
			flag ? this.showCircle = true : this.showCircle = false;

			return self;
		};

		this.setArcs = function(newArcs) {
			this.arcs = newArcs;

			return self;
		};

		this.setArc = function(newArc) {
			this.arc = newArc;

			return self;
		};

		this.setOuterRadius = function(newOuterRadius) {
			this.outerRadius = newOuterRadius;

			return self;
		};

		this.setLabelsLimit = function(newLabelsLimit) {
			this.labelsLimit = newLabelsLimit;
		};

		this.getLContainer = function() {
			return this.lContainer;
		};

		this.getLimits = function() {
			return this.limits;
		};

		this.getLabels = function() {
			return this.labelsArr;
		};

		this.preventOverlapp = function(flag) {
			this.isOverlapp = flag;

			return self;
		};

		this.setGeometry = function(nLength, font, distance, radius) {
			this.nominalLength = nLength;
			this.fontSize = font;
			this.distanceCoef = distance;
			this.circleRadius = radius;
		}
	}

	function getCoords(e) {
		var x = 0,
			y = 0;

		if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
			x = e.layerX;
			y = e.layerY;
		} else {
			var target = e.target || e.srcElement,
				rect = target.getBoundingClientRect(),
				offsetX = e.clientX - rect.left,
				offsetY = e.clientY - rect.top;

			x = e.offsetX || offsetX;
			y = e.offsetY || offsetY;
		}

		return {x: x, y: y};
	}

	function addClick(e) {
		var event = null;

		if(e && e.changedTouches){
			event = e.changedTouches[0];
		} else {
			event = e;
		}
		var coords = getCoords(event),
			x = coords.x,
			y = coords.y;

		// select our dummy nodes and draw the data to canvas.
		var elements = dataContainer.selectAll("path.path");
		elements.each(function(d) {
			var node = d3.select(this),
				path = new CanvablePath(node.attr("d"));

			path.draw(con);
			// x * pixelRatio, y * pixelRatio
			if(con.isPointInPath(x * pixelRatio, y * pixelRatio)){
				controller.menu.show({
					event: event,
					data: function(){
						return d.data.original;
					}
				});
			}
		});
	}

	function addMove(e) {
		var coords = getCoords(e),
			x = coords.x,
			y = coords.y;

		// select our dummy nodes and draw the data to canvas.
		var elements = dataContainer.selectAll("path.path"),
			tooltipShown = false;
		elements.each(function(d) {
			var node = d3.select(this),
				path = new CanvablePath(node.attr("d"));

			path.draw(con);
			// x * pixelRatio, y * pixelRatio
			if(con.isPointInPath(x * pixelRatio, y * pixelRatio)){
				tooltipShown = true;

				controller.tooltip.show({
					event: e,
					data: function(){
						return node.data()[0].data.original;
					},
					color: function() {
						var scale = pie.getColorScale();
						return scale(d.data.group);
					}
				});
			}
		});

		if(!tooltipShown) {
			controller.tooltip.hide();
		}
	}

	function addListeners(element, listenersArr) {
		if (element !== null) {
			if (controller.isInteractive() && listenersArr.indexOf('click') === -1 && listenersArr.indexOf('touchend') === -1) {
				if(isTouch) {
					element.addEventListener("touchend", addClick, false);
					listenersArr.push("touchend");
				} else {
					element.addEventListener("click", addClick, false);
					listenersArr.push("click");
				}
			}
			if (listenersArr.indexOf('mousemove') === -1) {
				element.addEventListener("mousemove", addMove, false);
				listenersArr.push("mousemove");
			}
		}
	}

	function removeListeners(element) {
		if (element !== null) {
			if(isTouch) {
				element.removeEventListener("touchend", addClick);
			} else {
				element.removeEventListener("click", addClick);
			}
			element.removeEventListener("mousemove", addMove);
			listenersArr = [];
		}
	}

	function fitToLimits() {
		var limits = renderer.getLimits(),
			minRadius = 20,
			newRadiuses = [];

		if (limits.top - 15 < 0) {
			newRadiuses.push(Math.min(width, height) / 2 - 40 - Math.abs(limits.top));
		}
		if (limits.bottom >  height - 40) {
			//newRadiuses.push(Math.min(width, height) / 2 - 40 - Math.abs(width - limits.bottom));
		}
		if (limits.left < 0) {
			newRadiuses.push(Math.min(width, height) / 2 - 40 - Math.abs(limits.left));
		}
		if (newRadiuses.length > 0) {
			var newRadius = Math.min.apply(Math, newRadiuses);
			newRadius < minRadius ? newRadius = minRadius : newRadius;
			radius = newRadius;
			pie.setArc(radius);
		}

	}

	// Dynamically change figure and label sizes
	function makeResponsive() {
		var minDim = [291, 72],
			coef = 1.5;
		if (width <= minDim[0] && height <= minDim[1]) {
			renderer.setGeometry(9, 7, 10, 2);
			renderer.setLabelsLimit(10);
		} else if ( width <= minDim[0] * coef && height <= minDim[1] * coef ) {
			renderer.setGeometry(10, 8, 12, 3);
			renderer.setLabelsLimit(10);
		} else if ( width <= minDim[0] * 2 * coef && height <= minDim[1] * 2 * coef ) {
			renderer.setGeometry(11, 9, 14, 4);
			renderer.setLabelsLimit(20);
		} else if ( width <= minDim[0] * 3 * coef && height <= minDim[1] * 3 * coef ) {
			renderer.setGeometry(12, 10, 15, 4);
			renderer.setLabelsLimit(controller.state.get("limit"));
		} else {
			renderer.setGeometry(20, 14, 17, 5);
			renderer.setLabelsLimit(controller.state.get("limit"));
		}
	}

	controller.update = function(data, progress) {
		if (data.length > 0) {
			var domain = controller.state.colorDataObj.domain(),
				range = controller.state.colorDataObj.colorRange();

			pie.setColorScale(domain, range);

			// Hardcoded limit. Temporary commented out. Do not remove!
			/*if (data.length > maxLimit) {
				data.splice(maxLimit, data.length - 1);
			}*/

			var dataValues = [];
			data.forEach(function(item) {
				dataValues.push({
					group: item.group,
					value: item.current.count,
					original: item
				});
			});

			if(stopAnimation) {
				stopAnimation = false;
			}

			if (canv !== null && !isRendered) {
				//canv.width = width * pixelRatio;
				//canv.height = height * pixelRatio;

				canv.width = width * pixelRatio;
				canv.height = height * pixelRatio;
				canv.style.width = width + 'px';
				canv.style.height = height + 'px';

				con.scale(pixelRatio, pixelRatio);
				con.translate(canv.width / (2 * pixelRatio), canv.height / (2 * pixelRatio));
				isRendered = true;
			}

			makeResponsive();
			fitToLimits();

			d3.timer(drawCanvas);

			pie.drawGraphics(dataValues);

			addListeners(canv, listenersArr);

			renderer
				.setArcs(pie.getPath())
				.setArc(pie.getArc())
				.setOuterRadius(radius*0.7)
				.showCircles(true)
				.preventOverlapp(true)
				.renderer();
		}
	};

	controller.resize = function(newWidth, newHeight, size) {
		width = newWidth;
		height = newHeight;

		radius = Math.min(width, height) / 2;
		pie.setArc(radius);

		if (dataContainer !== null) {
			var data = dataContainer[0][0].__data__;

			if(stopAnimation) {
				stopAnimation = false;
			}

			d3.timer(drawCanvas);
			//drawCanvas();

			pie.drawGraphics(data);
		}

		if (canv !== null) {
			canv.width = width * pixelRatio;
			canv.height = height * pixelRatio;
			canv.style.width = width + 'px';
			canv.style.height = height + 'px';

			con.scale(pixelRatio, pixelRatio);
			con.translate(canv.width / (2 * pixelRatio), canv.height / (2 * pixelRatio));
			//con.translate(canv.width / 2, canv.height / 2);

			fitToLimits();
			makeResponsive();

			renderer
				.setArcs(pie.getPath())
				.setArc(pie.getArc())
				.setOuterRadius(radius*0.7)
				.showCircles(true)
				.preventOverlapp(true)
				.renderer();

			drawCanvas();
		}
	};

	controller.clear = function() {
		function clear() {
			// clear canvas, make sure to compensate for translation with negative offset.
			con.clearRect(canv.width / 2 * -1, canv.height / 2 * -1, canv.width, canv.height);
		}
		removeListeners(canv);
		// Delay need to be done to make sure that D3.timer stop it's work
		setTimeout(clear, 500);
	};

	function drawCanvas() {
		// clear canvas, make sure to compensate for translation with negative offset.
		con.clearRect(canv.width / 2 * -1, canv.height / 2 * -1, canv.width, canv.height);

		// select our dummy nodes and draw the data to canvas.
		var elements = dataContainer.selectAll("path.path");
		var labelElements = renderer.getLContainer().selectAll("path.labels");
		var labelText = renderer.getLContainer().selectAll("text.label-text");
		var labelCircle = renderer.getLContainer().selectAll("circle.label-circle");

		elements.each(function(d) {
			var node = d3.select(this),
				fill = node.attr('fill'),
				path = new CanvablePath(node.attr("d"));
			con.fillStyle = fill;
			path.draw(con);
			con.fill();

		});

		labelElements.each(function(d) {
			var node = d3.select(this),
				path = new CanvablePath(node.attr("d"));

			//con.fillStyle = fill;
			path.draw(con);
			//con.fill();
			con.strokeStyle = "#006600";
			con.stroke();

		});

		labelText.each(function(d) {
			var node = d3.select(this);

			con.font = node.attr("font") + "px source-sans-pro, sans-serif";
			con.fillStyle = node.attr("color");
			con.fillText(node[0][0].textContent,node.attr("x"),node.attr("y"));
		});

		labelCircle.each(function(d) {
			var node = d3.select(this);

			con.beginPath();
			con.arc(node.attr("cx"), node.attr("cy"), node.attr("r"), 0, 2 * Math.PI, false);
			con.fillStyle = node.attr("fill");
			con.fill();
			//con.lineWidth = 5;
			con.strokeStyle = '#ffffff';
			con.stroke();
			con.closePath();
		});

		return stopAnimation;
	}

	function stopAnimationAfterDelay(delay) {
		if(animationTimeoutID) {
			window.clearTimeout(animationTimeoutID);
		}

		animationTimeoutID = setTimeout(function() {
			stopAnimation = true;
		}, delay);
	}

	//Get browser prefix
	function getVendorPrefix() {
		var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice
				.call(styles)
				.join('')
				.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
			)[1];
		return '-' + pre + '-';
	}

	function initLabels(){
		controller.createAxisLabel({
			picks: 'Group By',
			orientation: 'horizontal',
			position: 'bottom',
			popoverTitle: 'Group'
		});

		controller.createAxisLabel({
			picks: 'Size',
			orientation: 'horizontal',
			position: 'bottom',
			popoverTitle: 'Arc Metric'
		});
	}
	
	function isTouchDevice() {
		var bool;
		var prefixes = window.prefixes || null;
		if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
			bool = true;
		} else {
			if(prefixes){
				var query = ['@media (',prefixes.join('touch-enabled),('),'heartz',')','{#modernizr{top:9px;position:absolute}}'].join('');
				testStyles(query, function( node ) {
					bool = node.offsetTop === 9;
				});
			} else {
				bool = false;
			}
		}
		return bool;
	}
})();
};}
	/*<![CDATA[*/
		window.onload = function() {
			var
				Zoomdata = window.Zoomdata,
				pageData = {
					root: document.body,
					user: {"name":"demo","roles":["custom","ROLE_MANAGE_SOME_SOURCES","ROLE_MANAGE_SOME_SOURCES"],"id":"542c07f6a272524c122e56ac","accountId":"51db7ad3e4b04caf9ab346c5","groupRoles":["ROLE_MANAGE_SOME_SOURCES"],"account":"company","isNew":true},
					csrfToken: '1e5bfc5d-5218-4134-bd33-1aa9c2979d41',
					csrfHeaderName: 'X-CSRF-TOKEN',
					csrfParameterName: '_csrf',
					xWwwAuthHeaderName: 'X-WWW-Authenticate',
					xWwwAuth: true,
					branding: {"title":"Zoomdata","url":"","customMessage":"","copyright":"On","terms":"","favicon":"","headerLogo":"","loginLogo":"","background":"","customCss":false,"defaultLogo":true,"zdContactLink":"true","zdSupportLink":"true","zdQuickstartLink":"true","zdContactVal":"Contact us with a question","zdSupportVal":"Support Site","zdQuickstartVal":"Show Quickstart Tutorials"},
					systemVariables: {"vis-HEAT_MAP":"false","connector-SPARK_SQL":"false","demo-mode":"true","iframes":"true"},
					version: {"git":"c6268f09993f0857970e8ea89e27743f98aa8de6","ipad":"1.1.4","version":"1.5.0","revision":"02191614"},
					userPreferences: [{"id":"54b9bc65d11ca47eab4d7d4a","userId":"542c07f6a272524c122e56ac","key":"showQuickstart","value":"false","accountId":"51db7ad3e4b04caf9ab346c5","description":null,"label":null}, {"id":"537b9f659d998568dcfcd3c3","userId":"0","key":"dashboardLayout","value":"unset","accountId":"51db7ad3e4b04caf9ab346c5","description":null,"label":null}],
					screenshotsEnabled: true
				};
			var allow_frames = pageData.systemVariables.iframes || false;
			if((!allow_frames || allow_frames === 'false') && (self !== top)){
				top.location = self.location;
			} else {
				new Zoomdata(pageData);
			}

		};
	/*]]>*/
	(function (){
			window.clean__ = 'true';
		})();
