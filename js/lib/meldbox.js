/*

Meldbox
Version: 1.5

Author:
	Shawn Welch <shawn@meldbox.net>
	
Web:
	https://github.com/shrimpwagon/meldbox
	http://meldbox.net
		
License:
	GPL v3 http://www.gnu.org/licenses/gpl.html

Meldbox is an open source, in-browser web page and app designer for developers
Copyright (C) 2013 by Shawn Welch <shawn@meldbox.net>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

function Meldbox() {


	/***********************
	 * Backbonejs - Selectbox
	 ***********************/
	var SelectboxCollection = Backbone.Collection.extend({
		// "Private" vars
		_mouseDown: undefined,
		_dragReleased: false,
		_startDrag: false,
		_updateHistory: false,
	
		// Construct
		initialize: function() {
			this
				.on('add', function(selectbox_model) {
					_$selection_boxes.prepend(selectbox_model.view.$el);
				})
				.on('reset', function() {
					_$selection_boxes.empty();
					_set_edit_text('');
					_set_style_text('');
				})
				.on('remove', function(selectbox_model) {
					selectbox_model.view.$el.remove();
				});
		},
		
		// Public methods
		findByObject: function($object) {
			return _.findWhere(this.models, {'id': $object.attr('id')});
		},
		
		removeByObject: function($object) {
			var found_sm = this.findByObject($object);
			
			if(found_sm) {
				this.remove(found_sm);
				return true;
			}
			
			return false;
		},
		
		getObject: function(index) {
			return this.at(index).attributes.$object;
		},
		
		startDrag: function(mouse_down_event) {
			this._mouseDown = mouse_down_event;
			this._dragReleased = false;
			this._startDrag = true;
		},
		
		moveSelection: function(e) {
			if(!this._startDrag) return;
		
			if(e.shiftKey) {
				if(_mouse_distance(this._mouseDown, e) > 30) {
					this._dragReleased = true;
					var x_distance = Math.abs(this._mouseDown.pageX - e.pageX);
					var y_distance = Math.abs(this._mouseDown.pageY - e.pageY);
					if(x_distance >= y_distance) {
						this.setPositionDelta({
							'top': 0,
							'left': (e.pageX - this._mouseDown.pageX)
						});
						
					} else if(y_distance > x_distance) {
						this.setPositionDelta({
							'top': (e.pageY - this._mouseDown.pageY),
							'left': 0
						});
					}
					
				} else {
					this.setPositionDelta({
						'top': 0,
						'left': 0
					});
				}
				
			} else {
				// Must move at least 2px before drag happens
				if(this._dragReleased || _mouse_distance(this._mouseDown, e) > 4) {
					this._dragReleased = true;
					this.setPositionDelta({
						'top': (e.pageY - this._mouseDown.pageY),
						'left': (e.pageX - this._mouseDown.pageX)
					});
				}
			}
		},
		
		dropSelection: function(mouse_up_event) {
			if(!this._startDrag) return;
			this._startDrag = false;
		
			_.each(this.models, function(sm) {
				sm.setOrigs();
			});
			
			if(this._dragReleased) {
				_set_style_text();
				_update_history();
				this.updateHistory = false;
			}
		},
		
		setZIndexDelta: function(delta_zindex) {
			if(!this.length) return;
			var $object;
			_.each(this.models, function(sm) {
				$object = sm.getObject();
				var zindex = parseInt($object.css('z-index'));
				if(isNaN(zindex)) zindex = 0;
				zindex += delta_zindex;
				$object.css('z-index', zindex);
			});
			_set_style_text();
			this.updateHistory = true;
		},
		
		setPositionDelta: function(position, set_orig) {
			_.each(this.models, function(sm) {
				sm.setPositionDelta(position);
				if(set_orig) sm.setOrigs();
			});
			this.updateHistory = true;
		},
		
		setSizeDelta: function(size) {
			_.each(this.models, function(sm) {
				sm.setSizeDelta(size);
			});
			this.updateHistory = true;
		},
		
		keyUp: function(keyup_event) {
			if(this.updateHistory) {
				_update_history();
				this.updateHistory = false;
			}
		},
		
		copyToClipboard: function() {
			_$clipboard = new Array();
			_.each(this.models, function(sm) {
				_$clipboard.push(sm.getObject());
			});
		},
		
		deleteSelected: function() {
			if(!this.length) return;
			this.each(function(sm) {
				sm.getObject().remove();
			});
			this.reset();
			_update_history();
		},
		
		distributeSelected: function(prop) {
			if(!this.length) return;
			var sm_array = new Array();
			var i;
			this.each(function(sm, index) {
				for(i = 0; i < sm_array.length; i++) {
					if(prop == 'top') {
						if(sm.origTop <= sm_array[i]) break;
						
					} else {
						if(sm.origLeft <= sm_array[i]) break;
					}
				}
				
				sm_array.splice(i, 0, sm);
			});
			
			var increment = (prop == 'top') ? parseInt(_$distrib_vert_txt.val()) : parseInt(_$distrib_horz_txt.val());
			var $object, sm;
			var most = (prop == 'top') ? sm_array[0].origTop : sm_array[0].origLeft;
			_.each(sm_array, function(sm) {
				$object = sm.getObject();
				$object.css(prop, most + 'px');
				sm.initCSS();
				most += increment;
			});
			
			_update_history();
		},
		
		intersectionCSS: function() {
			var css = new Array();
			
			if(this.length) {
				var css = _get_css_array(this.getObject(0));
				for(var i = 1; i < this.length; i++) {
					css = _.intersection(css, _get_css_array(this.getObject(i)));
					if(css.length == 0) break;
				}
			}
			
			return css;
		},
		
		updateCSS: function(css) {
			this.each(function(sm) {
				sm.getObject().css(css);
				sm.initCSS();
			});
			_set_style_text();
			_update_history();
		},
		
		updateStyle: function(style) {
			style = style.trim().replace(/;[\ \n\t\r]+/g, "; ");
			if(style.charAt(style.length - 1) != ';') style += ';';
			
			if(this.length == 1) {
				this.at(0).getObject().attr('style', style);
				this.at(0).initCSS();
			}
			
			else if(this.length > 1) {
				var	css_array = new Array();
				var $object;
				var intersection_css = this.intersectionCSS();
				
				this.each(function(sm) {
					$object = sm.getObject();
					
					// Reject the props that the selected objects have in common as this should be in style. Will also determine delete props that are shared.
					css_array = _.difference(_get_css_array($object), intersection_css);
					
					// Remove props that are defined explicitly from style as they may have changed or will be added
					css_array = _.reject(css_array, function(prop) {
						prop = prop.substring(0, prop.indexOf(':') + 1);
						return (style.indexOf(prop) != -1);
					});
					
					// Update shared style with any unique props
					$object.attr('style', style + css_array.join('; '));
					sm.initCSS();
				});
			}
			
			_update_history();
		},
		
		updateHTML: function(html) {
			this.each(function(sm) {
				$('> span', sm.getObject()).html(html);
				sm.initCSS();
			});
			_update_history();
		}
	});
	
	var SelectboxModel = Backbone.Model.extend({
		initialize: function() {
			this.id = this.attributes.$object.attr('id');
		
			this.view = new SelectboxView({
				'model': this,
				'id':  this.id + '-sb'
			});
			
			this.initCSS();
		},
		
		initCSS: function() {
			this.updatePosition();
			this.updateSize();
			this.setOrigs();
			this.trigger('change');
		},
		
		setOrigs: function() {
			// Remember original positions
			this.origTop = parseInt(this.top);
			this.origLeft = parseInt(this.left);
		},
		
		updatePosition: function() {
			this.top = this.attributes.$object.css('top');
			this.left = this.attributes.$object.css('left');
		},
		
		updateSize: function() {
			this.width = this.attributes.$object.outerWidth() - 2;
			this.height = this.attributes.$object.outerHeight() - 2;
		},
		
		getObject: function() {
			return this.attributes.$object;
		},
		
		setPositionDelta: function(position) {
			if(position.top !== undefined) {
				this.getObject()[0].style.top = (this.origTop + position.top) + 'px';
			}
			
			if(position.left !== undefined) {
				this.getObject()[0].style.left = (this.origLeft + position.left) + 'px';
			}
			
			if(position.left !== undefined || position.top !== undefined) {
				this.updatePosition();
				this.trigger('change');
			}
		},
		
		setSizeDelta: function(size) {
			if(size.width !== undefined) {
				var width = this.getObject().width() + size.width;
				this.getObject().css('width', width + 'px');
			}
			
			if(size.height !== undefined) {
				var height = this.getObject().height() + size.height;
				this.getObject().css('height', height + 'px');
			}
			
			if(size.width !== undefined || size.height !== undefined) {
				this.updateSize();
				this.trigger('change');
			}
		}
	});
	
	var SelectboxView = Backbone.View.extend({
	
		tagName: "div",
		
		className: "selection-box",
		
		render: function() {
			this.$el.css({
				'top': this.model.top,
				'left': this.model.left,
				'width': this.model.width,
				'height': this.model.height
			});
		},
	
		initialize: function() {
			this.model = this.options.model;
		
			this.listenTo(this.model, "change", this.render);
			
			var _self = this;
		
			// Selection box selection animation
			var _selection_box_animation_counter = 1;
			var _animate_selection_box = function() {
				switch(_selection_box_animation_counter) {
					case 1:
						_self.$el.css({
							'border-top': '1px dashed #000',
							'border-right': '1px dashed #444',
							'border-bottom': '1px dashed #999',
							'border-left': '1px dashed #EEE'
						});
					break;
			
					case 2:
						_self.$el.css({
							'border-top': '1px dashed #EEE',
							'border-right': '1px dashed #000',
							'border-bottom': '1px dashed #444',
							'border-left': '1px dashed #999'
						});
					break;
			
					case 3:
						_self.$el.css({
							'border-top': '1px dashed #999',
							'border-right': '1px dashed #EEE',
							'border-bottom': '1px dashed #000',
							'border-left': '1px dashed #444'
						});
					break;
			
					case 4:
						_self.$el.css({
							'border-top': '1px dashed #444',
							'border-right': '1px dashed #999',
							'border-bottom': '1px dashed #EEE',
							'border-left': '1px dashed #000'
						});
						_selection_box_animation_counter = 0;
					break;
				}
		
				_selection_box_animation_counter++;
		
				setTimeout(_animate_selection_box, 300);
			}
			
			_animate_selection_box();
		},
	});
	
	
	/***********************
	 * Backbonejs - Control Panels
	 ***********************/
	var ControlPanelCollection = Backbone.Collection.extend({
		initialize: function() {
			this.add(new CanvasControlPanel());
		},
		
		resetPanels: function() {
			_.each(this.models, function(cpm) {
				cpm.attributes.resetPanel();
			});
		}
	});
	
	var ControlPanelModel = Backbone.Collection.extend({
		initialize: function(options) {},
		
		resetPanel: function() {}
	});
	
	var ControlPanelView = Backbone.View.extend({
		events: {
			"click .shift-up-panel"		: "moveUp",
			"click .shift-down-panel"	: "moveDown",
			"click .expand-panel"		: "expand",
			"click .remove-panel"		: "remove"
		},
		
		// @TODO: Move the control panel buttons here
		moveUp: function() {
		},
		
		moveDown: function() {
		},
		
		expand: function() {
		},
		
		remove: function() {
		}
	});
	
	
	/*************************
	 * Backbonejs - Canvas Control Panel
	 *************************/
	var CanvasControlPanel = ControlPanelModel.extend({
		initialize: function(options) {
			this.view = new CanvasControlPanelView();
		},
		
		resetPanel: function() {
			this.view.resetPanel();
		}
	});
	
	var CanvasControlPanelView = ControlPanelView.extend({
		el: '#canvas-panel',
	
		initialize: function() {
			// Panel inputs jQuery cache
			this.$canvas_alignment = $('#canvas-alignment');
			this.$canvas_resize_origin = $('#canvas-resize-origin');
			this.$canvas_resize_width = $('#canvas-resize-width');
			this.$canvas_resize_height = $('#canvas-resize-height');
		
			// Panel input methods
			this.events = $.extend({}, this.events, {
				"change #canvas-alignment"		: "alignCanvas",
				"keyup #canvas-resize-width"	: "resizeCanvas",
				"keyup #canvas-resize-height"	: "resizeCanvas"
			});
		},
		
		resizeCanvas: function(e) {
			if(e.keyCode == 13) {
				var new_width = parseInt(this.$canvas_resize_width.val());
				var new_height = parseInt(this.$canvas_resize_height.val());
				if(isNaN(new_width) || isNaN(new_height)) return false;
				
				var origin = this.$canvas_resize_origin.val().split('-');
				var x_anchor = origin[1];
				var y_anchor = origin[0];
				var canvas_width = _$design_canvas.width();
				var canvas_height = _$design_canvas.height();
				
				var offset_x_right = new_width - canvas_width;
				var offset_y_bottom = new_height - canvas_height;
				var offset_x_center = Math.round(offset_x_right / 2);
				var offset_y_middle = Math.round(offset_y_bottom / 2);
				
				// Iterate over elements and move
				$('.box').each(function(i, elem) {
					var $elem = $(elem);
					var position = $elem.position();
					var top = position.top;
					var left = position.left;
					
					if(x_anchor == 'right') left += offset_x_right;
					else if(x_anchor == 'center') left += offset_x_center;
					
					if(y_anchor == 'bottom') top += offset_y_bottom;
					else if(y_anchor == 'middle') top += offset_y_middle;
					$elem.css({'top': top + 'px', 'left': left + 'px'});
				});
				
			
				// Add resize style tag to container
				$('#canvas-resize-style').remove();
				_$container.append('<style id="canvas-resize-style"> #design-canvas { width: ' + new_width + 'px; height: ' + new_height + 'px; } </style>');
				
				// Reposition canvas (will also update history)
				this.alignCanvas();
				
			} else if(e.keyCode == 27) {
				document.activeElement.blur();
			}
		},
		
		resetPanel: function() {
			var float = _$design_area.css('float');
			this.$canvas_alignment.val(float);
			
			var canvas_width = _$design_canvas.width();
			var canvas_height = _$design_canvas.height();
			
			this.$canvas_resize_width.val(canvas_width);
			this.$canvas_resize_height.val(canvas_height);
		},
		
		alignCanvas: function() {
			var float = this.$canvas_alignment.val();
			var canvas_width = _$design_canvas.width();
			var canvas_height = _$design_canvas.height();
			var canvas_left;
			
			switch(float) {
				case 'left':
					canvas_left = -1;
				break;
				
				case 'none':
					canvas_left = Math.round(canvas_width / 2) * -1;
				break;
				
				case 'right':
					canvas_left = (canvas_width - 1) * -1;
				break;
			}
			
			$('#canvas-alignment-style').remove();
			_$container.append('<style id="canvas-alignment-style"> #design-area { float: ' + float + '; height: ' + (canvas_height + 100) + 'px; } #design-canvas { left: ' + canvas_left + 'px; } </style>');
			_update_history();
		}
	});
	
	
	/*************************
	 * Backbonejs - Multi Select
	 *************************/
	var MultiSelect	= Backbone.Model.extend({
		// "Private" vars
		_enabled: false,
	
		initialize: function(options) {
			this.view = new MultiSelectView({
				'model': this
			});
		},
		
		mouseDown: function(mouse_event, force) {
			// Cancel if in preview mode
			if(_preview_mode_flag) return;
		
			// Only init if selecting from body, canvas or already selected elem
			if(!$(mouse_event.target).is('body, #design-canvas') && !force) return;
		
			// Set flag
			this._enabled = true;
			
			// Reset selected items if not pressing shift
			if(!mouse_event.shiftKey) _selectbox_collection.reset();
		
			this.container_offset = _$container.offset();
			
			var pageX = mouse_event.pageX - this.container_offset.left;
			var pageY = mouse_event.pageY - this.container_offset.top;
			
			this.set({
				'top': pageY,
				'left': pageX,
				'origTop': pageY,
				'origLeft': pageX,
				'width': 0,
				'height': 0
			});
		},
		
		mouseMove: function(mouse_event) {
			if(!this._enabled) return false;
		
			var pageX = mouse_event.pageX - this.container_offset.left;
			var pageY = mouse_event.pageY - this.container_offset.top;
			var attr = this.attributes;
			var top = (pageY < attr.origTop) ? pageY : attr.origTop;
			var left = (pageX < attr.origLeft) ? pageX : attr.origLeft;
			var width = Math.abs(pageX - attr.origLeft);
			var height = Math.abs(pageY - attr.origTop);
			
			this.set({
				'top': top,
				'left': left,
				'width': width,
				'height': height
			});
		},
		
		mouseUp: function(event) {
			if(!this._enabled) return false;
		
			// Turn off
			this._enabled = false;
		
			/*
			
			Get coords of select box and elements
			
			x1, y1 o----------------------o x2, y1
			       |                      |
			       |                      |
			       |                      |
			       |                      |
			       |                      |
			       |                      |
			       |                      |
			       |                      |
			x1, y2 o----------------------o x2, y2
			
			ms = multi select box
			el = meldbox element
			   
			*/
			
			var attr = this.attributes;
			var ms_x1 = attr.left;
			var ms_x2 = attr.left + attr.width;
			var ms_y1 = attr.top;
			var ms_y2 = attr.top + attr.height;
			
			// The multi select box needs to be at least 4 x 4 pixels because of deslecting elements with shift down
			if(attr.width > 3 && attr.height > 3) {
			
				// Iterate over all elements and determine if they are within the multi select box
				$('.box').each(function(i, elem) {
				
					var $object = $(elem);
				
					// Do not select if 'pointer-events: none;' as this menas it's a locked element
					if($object.css('pointer-events') == 'none') return;
				
					var selected = new Array();	
					var position = $object.position();
					var width = $object.width();
					var height = $object.height();
				
					var el_x1 = position.left;
					var el_x2 = position.left + width;
					var el_y1 = position.top;
					var el_y2 = position.top + height;
				
					// Determine if rectangles (elements) intersect
					if((ms_x1 < el_x2) && (ms_x2 > el_x1) && (ms_y1 < el_y2) && (ms_y2 > el_y1)) {
				
						if(event.shiftKey) {
							// Find if clicking again and remove
							if(!_selectbox_collection.removeByObject($object))
								_selectbox_collection.add([new SelectboxModel({'$object': $object})]);
			
						} else {
							_selectbox_collection.add([new SelectboxModel({'$object': $object})]);
						}
					}
				});
			
				// Do not continue if nothing was selected
				if(_selectbox_collection.length > 0) {
	
					// Set text box
					_set_edit_text();

					// Set style box
					_set_style_text();

					// Blur any focused element
					$(document.activeElement).blur();
				}
			}
			
			// Remove selection box
			this.reset();
		},
		
		reset: function() {
			this.set({
				'top': 0,
				'left': 0,
				'width': 0,
				'height': 0
			});
		}
	});
	
	var MultiSelectView = Backbone.View.extend({
		el: '#mb-multi-select',
	
		initialize: function() {
			this.model = this.options.model;
			this.listenTo(this.model, "change", this.render);
		},
		
		render: function() {
			var attr = this.model.attributes;
			this.$el.css({
				'top': attr.top + 'px',
				'left': attr.left + 'px',
				'width': attr.width + 'px',
				'height': attr.height + 'px'
			});
		}
	});
	
	
	/***********************
	 * Private vars
	 ***********************/
	var _obj_id = 0;
	var _mouse_move_event;
	var _mouse_click = undefined;
	var _mouse_down = undefined;
	var _mouse_up = undefined;
	var _preview_mode_flag = false;
	var _key_down_event;
	var _grab_object = false;
	var _$design_area = $('#design-area');
	var _$design_canvas = $('#design-canvas');
	var _$container = $('#container');
	var _$clipboard = new Array();
	var _$focused = undefined;
	var _$edit_text = $('#edit-text');
	var _$style_text = $('#style-text');
	var _saved_flag = true;
	var _$file_title = $('#file-title');
	var _$selection_boxes = $('#selection-boxes');
	var _this = this;
	var _selectbox_collection = new SelectboxCollection();
	var _control_panel_collection = new ControlPanelCollection();
	var _$distrib_horz_txt = $('#distrib-horz-txt');
	var _$distrib_vert_txt = $('#distrib-vert-txt');
	var _$css_libraries = $('#css-libraries');
	var _multi_select = new MultiSelect();
	var _history = new Array();
	var _history_index = 0;
	
	
	/*************************
	 * Private functions
	 *************************/
	var _insert_object = function(content, paste, css) {
		var obj_id = 'obj-' + (++_obj_id);
		var $object = $(content).attr('id', obj_id);
		
		if(!paste) {
			var offset = _$container.offset();
			var left = 0;
			var top = 0;
			if(_mouse_move_event) {
				var left = Math.round(_mouse_move_event.pageX - offset.left);
				var top = Math.round(_mouse_move_event.pageY - offset.top);
			}
			var css = $.extend({}, {'top': top + 'px', 'left': left + 'px'}, (css || {}));
			$object.css(css);
		}
		
		_$container.append($object);
		_bind_object($object);
		_focus($object, undefined, paste);
		_update_history();
		return $object;
	}
	
	var _bind_object = function($object) {
		$object.bind('mousedown', function(e) {
			var $elem = $(this);
			_focus($elem, e);
		});
	}
	
	var _mouse_distance = function(mouse1, mouse2) {
		var x1 = mouse1.pageX;
		var y1 = mouse1.pageY;
		var x2 = mouse2.pageX;
		var y2 = mouse2.pageY;
		
		return Math.round( Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) ) );
	}
	
	var _set_edit_text = function(html) {
		if(_selectbox_collection.length && html === undefined) {
			var innerhtml = html = $('span', _selectbox_collection.getObject(0)).html();
			for(var i = 1; i < _selectbox_collection.length; i++) {
				innerhtml = $('span', _selectbox_collection.getObject(i)).html();
				if(innerhtml != html) {
					html = '';
					break;
				}
			}
		}
		
		cmEditText.setValue(html);
		var totalLines = cmEditText.lineCount();
		var totalChars = cmEditText.getValue().length;
		cmEditText.autoFormatRange({line:0, ch:0}, {line:totalLines - 1, ch:totalChars});
	}
	
	var _set_style_text = function(css) {
		if(_selectbox_collection.length && css === undefined) {
			css = _selectbox_collection.intersectionCSS();			
			css = css.join('; ');
			if(css.length) css += ';';
		}
		
		
		cmStyleText.setValue(css.replace(/; /g, ";\n"));
	}
	
	var _get_css_array = function($object) {
		// Get a consistent style string
		var style = $object[0].style.cssText;
		
		// Remove trailing semi-colon
		style = style.substring(0, style.length - 1);
		
		// Split
		return style.split("; ");
	}
	
	var _select_all = function() {
		// Cancel if in preview mode
		if(_preview_mode_flag) return;
	
		// Iterate through all mBox elements
		$('.box').each(function(i, elem) {
			var $object = $(elem);
			if($object.css('pointer-events') == 'none') return;
			if(!_selectbox_collection.findByObject($object)) _selectbox_collection.add([new SelectboxModel({'$object': $object})]);
		});
		
		// Stop if nothing is selected
		if(_selectbox_collection.length == 0) return;
			
		// Set text box
		_set_edit_text();
		
		// Set style box
		_set_style_text();
		
		// Blur any focused element
		$(document.activeElement).blur();
	}
	
	var _focus = function($object, event, paste) {
		// Return if in preview mode
		if(_preview_mode_flag) return false;
	
		if((event && event.shiftKey) || paste) {
		
			// Find if clicking again and remove
			if(_selectbox_collection.removeByObject($object)) {
				//If clicking an already selected element init the multi select tool
				_multi_select.mouseDown(event, true);
			}
			
			else {
				_selectbox_collection.add([new SelectboxModel({'$object': $object})]);
				
				// Init drag if this isn't a paste operation
				if(!paste) _selectbox_collection.startDrag(event);
			}
			
				
		} else {
			// Don't do anything if element is already selected and not pressing shift
			if(_selectbox_collection.findByObject($object)) {
				_selectbox_collection.startDrag(event);
				return false;
			
			// Select element and reset selections is not pressing shift	
			} else {
				_selectbox_collection.reset().add([new SelectboxModel({'$object': $object})]);
				
				// Init drag if this isn't a new element
				if(event) _selectbox_collection.startDrag(event);
			}
		}
		
		// Stop if nothing is selected
		if(_selectbox_collection.length == 0) return;
			
		// Set text box
		_set_edit_text();
		
		// Set style box
		_set_style_text();
		
		// Blur any focused element
		$(document.activeElement).blur();
	}
	
	var _blur = function($object) {
		// Remove selection boxes
		_selectbox_collection.reset();
	}
	
	var _save_html = function(save_as) {
		var file_name = _$file_title.html();
		if(file_name == 'Untitled*') {
			save_as = true;
			file_name = '';
		}
		
		file_name = file_name.replace('*', '');
		var pattern = /^[A-Za-z0-9_\ \-]+$/;
		if(save_as) {
			var is_valid = false;
			while((file_name != null && is_valid == false) || file_name == 'Untitled') {
				file_name = prompt('File name:', file_name);
				is_valid = pattern.test(file_name);
			}
			if(file_name == null) return;
		}
		file_name = file_name.trim();
			
		if(save_as) {
			$.ajax({
				'data': {
					'file_name': file_name,
					'action': 'check'
				},
				'type': 'POST',
				'url': 'save.php',
				'dataType': 'text',
				'success': function(found) {
					found = parseInt(found);
					var overwrite = false;
					if(found && save_as) {
						var overwrite = confirm('File already exists!\n\nOverwrite?');
						if(!overwrite) return;
					}
					
					_save_file(file_name);
					
					// Add to available files to open
					if(save_as && !found) $('#open-file-select').append('<option value="' + file_name + '">' + file_name + '</option>');
				}
			});
			
		} else {
			_save_file(file_name);
		}
	}
	
	var _save_file = function(file_name) {
		var $html = _$container.clone();
		$('ul.context-menu-list', $html).remove();
		var data = Base64.toBase64($html.html());
		$.ajax({
			'data': {
				'data': data,
				'file_name': file_name,
				'action': 'save'
			},
			'type': 'POST',
			'url': 'save.php',
			'success': function() {
				_saved_flag = true;
				_set_file_title(file_name);
				_set_cookie('open_file', file_name, 735);
			}
		});
	}
	
	var _set_file_title = function(file_title) {
		_$file_title.html(file_title);
	}
	
	var _update_history = function() {
		_set_unsaved();
		_set_history();
	}
	
	var _set_history = function(reset) {
		if(reset) _history_index = 0;
	
		// Slice history using the current history index pointer
		_history = _history.slice(0, _history_index);
		var html = _$container.html();
		var lzw = LZW.compress(html);
		_history.push(lzw);
		_history_index++;
	}
		
	var _set_unsaved = function() {
		if(_saved_flag == true) {
			_$file_title.html(_$file_title.html() + '*');
			_saved_flag = false;
		}
	}
	
	var _undo = function(event) {
		_blur();
		if(_history_index - 1 > 0) {
			var html = LZW.decompress(_history[--_history_index - 1]);
			_load_html(html);
			_set_unsaved();
		}
	}
	
	var _redo = function(event) {
		_blur();
		if(_history_index < _history.length) {
			var html = LZW.decompress(_history[_history_index++]);
			_load_html(html);
			_set_unsaved();
		}
	}
	
	var _new_design = function() {
		_selectbox_collection.reset();
		$('.box', _$container).remove();
		_set_file_title('Untitled');
		_saved_flag = true;
		_obj_id = 0;
		_set_history(true);
	}
	
	var _import_css = function(file) {
		if(!file) return false;
		var id = md5(file);
		 $.ajax('css/lib/' + file, {
		 	'dataType': 'text',
		 	'success': function(data) {
				_$container.append('<style id="' + id + '-css-lib-data" data-desc="' + file + '" type="text/plain" class="css-lib" scoped="scoped">' + data + '</style>');
				_update_history();
				_append_css_lib(id, file);
		 	}
		 });
	}
	
	var _append_css_lib = function(id, desc) {
		var checkbox_id = id + '-css-lib-checkbox';
		var remove_id = id + '-css-lib-remove';
		if($('#' + checkbox_id).length) return false;
		_$css_libraries.append('<div id="' + id + '-css-lib-div" class="css-lib-div">' + desc + '<br /><input type="checkbox" value="' + id + '" id="' + checkbox_id + '" /> Apply <button id="' + remove_id + '">Remove</button></div>');
		$('#' + checkbox_id).on('click', function() {
			var $this = $(this);
			var css_lib_id = $this.val();
			if($this.is(':checked')) {
				_apply_css_style(css_lib_id);
				_update_history();
				
			} else {
				_remove_css_style(css_lib_id);
				_update_history();
			}
		});
		$('#' + remove_id).on('click', function() {
			$('#' + id + '-css-lib-data').remove();
			$('#' + id + '-css-lib-div').remove();
			_update_history();
		});
	}
	
	var _apply_css_style = function(css_lib_id) {
		var $css_lib_data = $('#' + css_lib_id + '-css-lib-data');
		$css_lib_data.attr('type', 'text/css');
	}
	
	var _remove_css_style = function(css_lib_id) {
		var css_lib_data = $('#' + css_lib_id + '-css-lib-data');
		css_lib_data.attr('type', 'text/plain');
	}
	
	var _open_file = function(file, force) {
		// Required
		if(!file) return;
		
		// Needs to be either command from panel, from method or in preview mode
		if(!force && !_preview_mode_flag) return;
	
		_blur();
	
		$.ajax('saved/' + encodeURIComponent(file) + '?' + _random_string(), {
			'dataType': 'html',
			
			'statusCode': {
				200: function(html) {
					_set_cookie('open_file', file, 735);
					_set_file_title(file);
					_saved_flag = true;
					_load_html(html);
					_set_history(true);
				}
			}
		});
	}
	
	// Used for opening files and undo/redo
	var _load_html = function(html) {
		_$container.html(html);
	
		// Iterate through each Meldbox element, get the largest object id and bind the click events
		$('.box').each(function() {
			var $object = $(this);
			var obj_id = parseInt($object.attr('id').split('-')[1]);
			if(obj_id > _obj_id) _obj_id = obj_id;
			
			_bind_object($object);
		});

		// Reset CSS library
		_$css_libraries.empty();

		// Add CSS data libraries
		$('.css-lib').each(function(i, elem) {
			var $data = $(elem);
			var css_lib_id = $data.attr('id').split('-')[0];
			var file = $data.attr('data-desc');
			var type = $data.attr('type');
	
			// Add CSS data library to list
			_append_css_lib(css_lib_id, file);
	
			// Apply style and check box
			if(type == 'text/css') {
				$('#' + css_lib_id + '-css-lib-checkbox').attr('checked', true);
			}
		});

		// Reset panels
		_control_panel_collection.resetPanels();
	}
	
	var _copy = function() {
		_selectbox_collection.copyToClipboard();
	}
	
	var _cut_selected = function() {
		_copy();
		_delete_selected();
	}
	
	var _paste = function() {
		_blur();
		_.each(_$clipboard, function($paste) {
			_insert_object($paste.clone(), true);
		});
	}
	
	var _fit_to_content = function() {
		_selectbox_collection.updateCSS({'width': 'auto', 'height': 'auto'});
	}
	
	var _lock_selected = function() {
		_selectbox_collection.updateCSS({'pointer-events': 'none'});
		_blur();
	}
	
	var _unlock_all = function() {
		var count = 0;
		$('.box').each(function(i, elem) {
			var $object = $(elem);
			if($object.css('pointer-events') == 'none') {
				$object.css('pointer-events', '');
				count++;
			}
		});
		
		if(count) _update_history();
		alert('Elements unlocked: ' + count);
	}
	
	var _delete_selected = function() {
		_selectbox_collection.deleteSelected();
	}
	
	var _update_edit_text = function() {
		_selectbox_collection.updateHTML(cmEditText.getValue());
	}
	
	var _update_style_text = function() {
		_selectbox_collection.updateStyle(cmStyleText.getValue());
	}
	
	var _preview_mode = function(on) {
		if(on) {
			// Let them know how to get back
			alert("Press 'Esc' to exit preview mode");
		
			_blur();
			_preview_mode_flag = true;
			
			// Hide the menu
			$('#menu').hide('slow');
			
			// Hide the tool containters
			$('.pd-tool-container').hide('slow');
			
			// Get rid of margins on the canvas
			_$design_area.css({'margin': '0px auto'});
			
			
		} else {
			_preview_mode_flag = false;
			
			// Hide the menu
			$('#menu').show('slow');
			
			// Hide the tool containters
			$('.pd-tool-container').show('slow');
			
			// Get rid of margins on the canvas
			_$design_area.css({'margin': '40px auto'});
		}
	}
	
	var _insert_meldbox = function(css) {
		_insert_object('<div class="box clickable"><span></span></div>', false, css);
	}
	
	
	/**************************************
	 * Capture document events
	 **************************************/
	$(document).click(function(e) {
		_mouse_click = e;
	});
	
	$(document).mousedown(function(e) {
		_mouse_down = e;
		
		// Global Listeners
		_multi_select.mouseDown(e);
	});
	
	$(document).mousemove(function(e) {
		_mouse_move_event = e;
		e.preventDefault();
		
		// Global Listeners
		_selectbox_collection.moveSelection(e);
		_multi_select.mouseMove(e);
	});
	
	$(document).mouseup(function(e) {
		_mouse_up = e;
		_mouse_down = undefined;
		_mouse_move_event = undefined;
		
		// Global Listeners
		_selectbox_collection.dropSelection(e);
		_multi_select.mouseUp(e);
	});
	
	$(document).keydown(function(e) {
	
		// Focused objects only
		if($(e.target).is('body')) {
		
			// Holding control
			if(e.ctrlKey) {
			
				// Holding Alt
				if(e.altKey) {
					// Ctrl + Alt + L - Lock
					if(e.which == 76) {
						_lock_selected();
					}
				}
				
				else {
					// Ctrl + A - Select All
					if(e.which == 65) {
						e.preventDefault();
						_select_all();
					}
			
					// Ctrl + C - Copy
					else if(e.which == 67) _copy();
					
					// Ctrl + D - Deselect
					else if(e.which == 68) {
						e.preventDefault();
						_blur();
					}
				
					// Ctrl + V - Paste
					else if(e.which == 86) _paste();
				
					// Ctrl + X - Cut
					else if(e.which == 88) _cut_selected();
				
					// Ctrl + Y - Redo
					else if(e.which == 89) _redo();
				
					// Ctrl + Z - Undo
					else if(e.which == 90) _undo();
				}
			}
		
			// Blur or exit preview mode (esc)
			else if(e.keyCode == 27) {
				if(_preview_mode_flag) _preview_mode(false);		
				else _blur();
			}
		
			// Delete or Backspace
			else if(e.keyCode == 46 || e.keyCode == 8) {
				_delete_selected();
			}
		}
		
		// Global listeners
		if(e.ctrlKey) {
			if(e.which == 83) { // Ctrl + S - Save
				e.preventDefault();
				_save_html();
			}
		}
	});
	
	$(document).keyup(function(e) {
		// Focused objects only
		if($(e.target).is('body')) {
		}
		
		// Global listeners
		_selectbox_collection.keyUp(e);
	});
	
	$(document).keypress(function(e) {
		var default_action = true;
		
		// Focused objects only
		if($(e.target).is('body')) {
		
			// Move
			if(e.keyCode >= 37 && e.keyCode <= 40 && !e.ctrlKey) {
				if(e.keyCode == 37) { // Left
					_selectbox_collection.setPositionDelta({
						'top': 0,
						'left': -1
					}, true);
				} else if(e.keyCode == 38) { // Up
					_selectbox_collection.setPositionDelta({
						'top': -1,
						'left': 0
					}, true);
				} else if(e.keyCode == 39) { // Right
					_selectbox_collection.setPositionDelta({
						'top': 0,
						'left': 1
					}, true);
				} else if(e.keyCode == 40) { // Down
					_selectbox_collection.setPositionDelta({
						'top': 1,
						'left': 0
					}, true);
				}
			
				default_action = false;
			
				_set_style_text();
			}
		
			// Resize
			else if(e.keyCode >= 37 && e.keyCode <= 40 && e.ctrlKey) {
				if(e.keyCode == 37) { // Left
					_selectbox_collection.setSizeDelta({
						'width': -1
					});
				} else if(e.keyCode == 38) { // Up
					_selectbox_collection.setSizeDelta({
						'height': -1
					});
				} else if(e.keyCode == 39) { // Right
					_selectbox_collection.setSizeDelta({
						'width': 1
					});
				} else if(e.keyCode == 40) { // Down
					_selectbox_collection.setSizeDelta({
						'height': 1
					});
				}
				
				default_action = false;
			
				_set_style_text();
			}
		
			// Move up/down z-index
			else if(e.charCode == 46) {
				_selectbox_collection.setZIndexDelta(1);
			}
			
			else if(e.charCode == 44) {
				_selectbox_collection.setZIndexDelta(-1);
			}
		}
		
		// Global listeners
		
		return default_action;
	});
	
	
	/**************************
	 * Context Menu
	 **************************/
	$.contextMenu({
		selector: '.clickable',
		zIndex: 2147483646,
		events: {
			show: function(options) {
				//$('input, select', options.$trigger.parent()).css({'backgroundColor': '#FF7'});
			},
			hide: function(options) {
				//$('input, select', options.$trigger.parent()).css({'backgroundColor': 'transparent'});
			}
		},
		callback: function(key, options) {
			
			switch(key) {
				case 'add_box':
					_insert_meldbox();
				break;
				
				case 'copy':
					_copy();
				break;
				
				case 'cut':
					_cut_selected();
				break;
				
				case 'lock':
					_lock_selected();
				break;
				
				case 'paste':
					_paste();
				break;
				
				case 'delete':
					_delete_selected();
				break;
				
				case 'fit_to_content':
					_fit_to_content();
				break;
			}
		},
		items: {
			"add_box": {name: "Add a MeldBox"},
			"sep1": "-------",
			"copy": {
				name: 'Copy <span style="float: right">Ctrl + C</span>'
			},
			"cut": {
				name: 'Cut <span style="float: right">Ctrl + X</span>'
			},
			"lock": {
				name: 'Lock <span style="float: right">Ctrl + Alt + L</span>'
			},
			"paste": {
				name: 'Paste <span style="float: right">Ctrl + V</span>'
			},
			"delete": {
				name: "Delete"
			},
			"fit_to_content": {
				name: "Fit to content"
			}
		}
	});
	
	
	/***************************
	 * Panel buttons
	 ***************************/
	$('#open-file-btn').bind('click', function() {
		var conf = true;
		if(!_saved_flag)
			conf = confirm('File has not been saved!\n\nAre you sure you want to load file?');
		if(conf) {
			_open_file($('#open-file-select').val(), true);
		}
	});
	
	$('#import-css-btn').bind('click', function() {
		_import_css($('#css-file-select').val());
	});
	
	
	/***************************
	 * Panel inputs and selects
	 ***************************/
	_$distrib_horz_txt.on('keypress', function(e) {
		if(e.keyCode == 13) _selectbox_collection.distributeSelected('left');
		else if(e.keyCode == 27) {
			document.activeElement.blur();
		}
	});
	
	_$distrib_vert_txt.on('keypress', function(e) {
		if(e.keyCode == 13) _selectbox_collection.distributeSelected('top');
		else if(e.keyCode == 27) {
			document.activeElement.blur();
		}
	});
	
	
	/**************************
	 * Public methods
	 **************************/
	this.toggleDialog = function(panel, open) {
		var $panel = $('#' + panel + '-panel');
		var $check = $('#menu-' + panel + ' span');
		if($panel.is(':visible') && !open) {
			$panel.hide();
			$check.removeClass('icon-check').addClass('icon-check-empty');
			
		} else {
			$panel.show();
			$check.removeClass('icon-check-empty').addClass('icon-check');
		}
	}
	
	this.closeDialogs = function() {
		$('.pd-tool-panel').each(function(i, elem) {
			var $panel = $(elem);
			if($panel.is(':visible')) _this.toggleDialog($panel.attr('data-panel'));
		});
	}
	
	this.newDesign = function() {
		var conf = true;
		if(!_saved_flag)
			conf = confirm('File has not been saved!\n\nAre you sure you want a new design?');
		if(conf) {
			_new_design();
		}
	}
	
	this.saveDesign = function(save_as) {
		_save_html(save_as);
	}
	
	this.openFile = function(file, force) {
		_open_file(file, force);
	}
	
	this.toggleWrap = function(checkbox) {
		var $checkbox = $(checkbox);
		var cm = $checkbox.attr('data-cm');
		switch(cm) {
			case 'EditText':
				cm = cmEditText;
			break;
			
			case 'StyleText':
				cm = cmStyleText;
			break;
		}
		var lineWrapping = !cm.getOption('lineWrapping');
		cm.setOption('lineWrapping', lineWrapping);
	}
	
	this.previewMode = function(on) {
		_preview_mode(on);
	}
	
	this.undo = function() {
		_undo();
	}
	
	this.redo = function() {
		_redo();
	}
	
	this.cut = function() {
		_cut_selected();
	}
	
	this.copy = function() {
		_copy();
	}
	
	this.paste = function() {
		_paste();
	}
	
	this.clear = function() {
		_delete_selected();
	}
	
	this.insertMeldbox = function(css) {
		_insert_meldbox(css);
	}
	
	this.selectAll = function() {
		_select_all();
	}
	
	this.deselect = function() {
		_blur();
	}
	
	this.lockSelection = function() {
		_lock_selected();
	}
	
	this.unlockAll = function() {
		_unlock_all();
	}
	
	
	/**************************
	 * Stop default browser drag
	 **************************/
	$(document).bind("dragstart", function(e) {
		return false;
	});
	
	
	/**************************
	 * Panel controls
	 **************************/
	$('.expand-panel').on('click', function(event) {
		var $this = $(this);
		var $panel_div = $('> div', $this.parent().parent().parent());
		if($this.hasClass('icon-plus-sign')) {
			$panel_div.show();
			$this.removeClass('icon-plus-sign').addClass('icon-minus-sign');
			
		} else {
			$panel_div.hide();
			$this.removeClass('icon-minus-sign').addClass('icon-plus-sign');
		}
	});
	
	$('.remove-panel').on('click', function(event) {
		var $this = $(this);
		var $this_panel = $this.parent().parent().parent();
		_this.toggleDialog($this_panel.attr('data-panel'));
	});
	
	
	$('.shift-up-panel').on('click', function(event) {
		var $this = $(this);
		var $this_panel = $this.parent().parent().parent();
		var $prev_panel = $this_panel.prev();
		if($prev_panel.hasClass('pd-tool-panel')) $this_panel.insertBefore($prev_panel);
	});
	
	$('.shift-down-panel').on('click', function(event) {
		var $this = $(this);
		var $this_panel = $this.parent().parent().parent();
		var $next_panel = $this_panel.next();
		if($next_panel.hasClass('pd-tool-panel')) $this_panel.insertAfter($next_panel);
	});
	
	$('.shift-right-panel').on('click', function(event) {
		var $this = $(this);
		var $this_panel = $this.parent().parent().parent();
		var $this_container = $this_panel.parent();
		if($this_container.attr('id') != 'pd-tool-container-right') $('#pd-tool-container-right').prepend($this_panel);
	});
	
	$('.shift-left-panel').on('click', function(event) {
		var $this = $(this);
		var $this_panel = $this.parent().parent().parent();
		var $this_container = $this_panel.parent();
		if($this_container.attr('id') != 'pd-tool-container-left') $('#pd-tool-container-left').prepend($this_panel);
	});
	
	
	/********************************
	 * Init codemirror
	 ********************************/
	var cmEditText = CodeMirror.fromTextArea(_$edit_text[0], {mode:"htmlmixed"});
	cmEditText.on('keypress', function(instance, event) {
		if(event.ctrlKey && event.keyCode == 13) _update_edit_text();
		else if(event.keyCode == 27) {
			document.activeElement.blur();
		}
	});
	cmEditText.setSize('100%', 120);
	
	var cmStyleText = CodeMirror.fromTextArea(_$style_text[0], {mode:"css"});
	cmStyleText.on('keypress', function(instance, event) {
		if(event.ctrlKey && event.keyCode == 13) _update_style_text();
		else if(event.keyCode == 27) {
			document.activeElement.blur();
		}
	});
	cmStyleText.setSize('100%', 120);
	
	
	/*********************************
	 * Utility functions
	 *********************************/
	var _set_cookie = function(c_name, value, exdays) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
	}
	
	var _random_string = function(string_length) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		if(!string_length) string_length = 8;
		var randomstring = '';
		for (var i = 0; i < string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	}
	
	//LZW Compression/Decompression for Strings
	var LZW = {
	
		compress: function(s) {
			var dict = {};
			var data = (s + "").split("");
			var out = [];
			var currChar;
			var phrase = data[0];
			var code = 256;
			for (var i=1; i<data.length; i++) {
				currChar=data[i];
				if (dict[phrase + currChar] != null) {
				    phrase += currChar;
				}
				else {
				    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
				    dict[phrase + currChar] = code;
				    code++;
				    phrase=currChar;
				}
			}
			out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
			for (var i=0; i<out.length; i++) {
				out[i] = String.fromCharCode(out[i]);
			}
			return out.join("");
		},
		
		decompress: function(s) {
			var dict = {};
			var data = (s + "").split("");
			var currChar = data[0];
			var oldPhrase = currChar;
			var out = [currChar];
			var code = 256;
			var phrase;
			for (var i=1; i<data.length; i++) {
				var currCode = data[i].charCodeAt(0);
				if (currCode < 256) {
				    phrase = data[i];
				}
				else {
				   phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
				}
				out.push(phrase);
				currChar = phrase.charAt(0);
				dict[code] = oldPhrase + currChar;
				code++;
				oldPhrase = phrase;
			}
			return out.join("");
		}
	}
}

