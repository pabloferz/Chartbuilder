var React = require('react');
var ReactDom = require("react-dom");

var swoopyArrow = require("../swoopyArrows.js").swoopy;

var AnnotationBlurb = React.createClass({

	propTypes: {
		key: React.PropTypes.string,
		index: React.PropTypes.number,
		tout: React.PropTypes.string,
		copy: React.PropTypes.string,
		pos: React.PropTypes.object,
		arrow: React.PropTypes.object,
		onBlurbUpdate: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			index: null,
			tout: "",
			copy: "",
			pos: {x: 0, y: 0},
			x: function(d){return d},
			y: function(d){return d},
			arrow: {
				start: {x: 10, y: 50},
				end: {x: 20, y: 100},
				snapTo: "textEnd",
				clockwise: true
			}
		};
	},

	getInitialState: function() {
		return {
			dragging: false,
			mode: "drag",
			clickOrigin: {x: 0, y: 0},
			tout: this.props.tout,
			target: null,
			copy: this.props.copy,
			pos: this.props.pos,
			arrow: this.props.arrow
		};
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var newProps = (this.props !== nextProps);
		var newDrag = (this.state.dragging !== nextState.dragging);

		return (newProps || newDrag || nextState.dragging);
	},

	componentDidMount: function() {
		this._placeArrow();

		if(this.state.mode == "drag") {
			this._addDragEvents();
		}

		this.forceUpdate();
	},

	_getMousePosition: function(e) {
		// get SVG mouse position accounting for the location of parent
		// see https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg
		// and https://github.com/mbostock/d3/blob/master/src/event/mouse.js
		var parent = this.state.parent;
		var rect = parent.getBoundingClientRect();
		var pos = {
			x: e.clientX - rect.left - parent.clientLeft,
			y: e.clientY - rect.top - parent.clientTop
		};
		return pos;
	},

	_handleMouseDownForDraggableElements: function(e, target) {
		if(e.button !== 0) { return; }

		if(this.state.mode == "drag") {
			this.setState({
				dragging: true,
				target: target,
				clickOrigin: this._getMousePosition(e)
			})


			e.stopPropagation();
			e.preventDefault();
		}
	},

	_handleInterfaceMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "pos")
	},

	_handleArrowEndMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "arrowEnd")
	},

	_handleArrowStartMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "arrowStart")
	},

	_handleMouseMove: function(e) {
		if(!this.state.dragging) { return; }
		var mousePos = this._getMousePosition(e);
		var delta = {
			x: (mousePos.x - this.state.clickOrigin.x),
			y: (mousePos.y - this.state.clickOrigin.y)
		}

		var newPos;
		var stateUpdate = {};
		switch(this.state.target) {
			case "pos":
				propPos = this.props.pos
				this.setState({
					pos: {
						x: propPos.x + delta.x,
						y: propPos.y + delta.y
					}
				})
				break

			case "arrowEnd":
				propPos = this.props.arrow.end
				
				this.setState({
					arrow: {
						end: {
							x: propPos.x + delta.x,
							y: propPos.y + delta.y
						},
						start: this.state.arrow.start
					}
				})
				break

			case "arrowStart":
				propPos = this.props.arrow.start
				this.setState({
					arrow: {
						end: this.state.arrow.end,
						start: {
							x: propPos.x + delta.x,
							y: propPos.y + delta.y
						}
					}
				})

				break

			default:
		}

		e.stopPropagation();
		e.preventDefault();

	},

	_handleMouseUp: function(e) {
		var pos;
		var target = this.state.target;

		this.setState({
			dragging: false,
			target: null
		})

		switch(target) {
			case "pos":
				pos = this.state.pos;
				break
			case "arrowEnd":
				pos = this.state.arrow.end
				break
			case "arrowStart":
				pos = this.state.arrow.start
				break
			default:
		}

		this.props.onBlurbUpdate(this.props.index, pos, target);

		e.stopPropagation();
		e.preventDefault();
	},

	_addDragEvents: function() {
		document.addEventListener("mousemove", this._handleMouseMove);
		document.addEventListener("mouseup", this._handleMouseUp);
	},

	_handleToutKeyDown: function(e) {
		var newText = ReactDom.findDOMNode(e.target).textContent
		this._updateText("tout", newText)
	},

	_handleCopyKeyDown: function(e) {
		var newText = ReactDom.findDOMNode(e.target).textContent
		this._updateText("copy", newText)
	},

	_handleArrowDoubleClick: function(d) {
		this.props.onBlurbUpdate(this.props.index, !this.state.arrow.clockwise, "arrowClockwise");
	},

	_updateText: function(key, newText) {
		var stateUpdate = {}
		stateUpdate[key] = newText;
		this.setState(stateUpdate);
		this._placeArrow();
	},

	_placeArrow: function(){
		var node = ReactDom.findDOMNode(this);
		var endMark = node.querySelector("span.end-mark")

		var nodeBB = node.getBoundingClientRect()
		var endMarkBB = endMark.getBoundingClientRect()
		var parent = node.parentNode;

		var arrow = this.state.arrow;

		// if(this.props.arrow.snapTo == "textEnd") {
			arrow.start = {
				x: endMarkBB.left - this.state.pos.x,
				y: endMarkBB.top - nodeBB.top + 3
			}
		// }

		this.setState({
			node: node,
			parent: parent,
			endMarkBB: endMarkBB,
			arrow: arrow
		})

		this.forceUpdate()
	},

	render: function() {

		console.log(this.props.scales)
		var style = {
			position: "absolute",
			left: this.props.x(this.state.dragging ? this.state.pos.x : this.props.pos.x) ,
			top:  this.props.y(this.state.dragging ? this.state.pos.y : this.props.pos.y) 
		};
		console.log(this.state.arrow)
		var swoopy = swoopyArrow()
		  .angle(Math.PI/3)
		  .clockwise((this.state.arrow.start.x < this.state.arrow.end.x) ? true : false)
		  // .clockwise(this.state.arrow.clockwise)
		  .x(function(d) { return d.x; })
		  .y(function(d) { return d.y; });

		return (
			<div
			 className="blurb"
			 style={style}
			 data-mode={this.state.mode}
			>
				<div
					className="interface"
					onMouseDown={this._handleInterfaceMouseDown}
				 />
				 <div
				 	className="content"
				 >
				 	<p>
				 		<span
				 			contentEditable="true"
				 			onKeyDown={this._handleToutKeyDown}
				 		>
				 			{this.state.tout.trim()}
				 		</span>
				 		<span
				 			contentEditable="true"
				 			onKeyDown={this._handleCopyKeyDown}
				 		>
				 			{(this.state.tout ? " " : "") + this.state.copy.trim()}
				 		</span>
				 		<span className="end-mark" />
				 	</p>

				 </div>
				 <svg>
				 	<circle
				 		cx={this.state.arrow.start.x}
				 		cy={this.state.arrow.start.y}
				 		r="10px"
				 		onMouseDown={this._handleArrowStartMouseDown}
				 		onDoubleClick={this._handleArrowDoubleClick}
				 	/>

				 	<circle
				 		cx={this.state.arrow.end.x}
				 		cy={this.state.arrow.end.y}
				 		r="10px"
				 		onMouseDown={this._handleArrowEndMouseDown}
				 		onDoubleClick={this._handleArrowDoubleClick}
				 	/>
				 	<path
				 		markerEnd="url(#arrowhead)"
				 		d={swoopy([this.state.arrow.start, this.state.arrow.end])}
				 	/>
				 </svg>

			</div>
		);
	}

});

module.exports = AnnotationBlurb;