/*!
 * Meldbox is an in-browser web page and app designer for web prototyping and HTML mock ups using advanced CSS3.
 *
 * Version: git-master
 *
 * Authors: Shawn Welch <shawn@meldbox.net>
 * Web: https://github.com/shrimpwagon/meldbox
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

function PageDesigner() {


	/***********************
	 * Classes
	 ***********************/
	var SelectboxCollection = Backbone.Collection.extend({
		initialize: function() {
			this
				.on('add', function(selectbox_model) {
					_$selection_boxes.prepend(selectbox_model.view.$el);
				})
				.on('reset', function() {
					_$selection_boxes.empty();
				})
				.on('remove', function(selectbox_model) {
					selectbox_model.view.$el.remove();
				});
				
			// Throttled methods ??
			this.moveSelection = _.throttle(this.moveSelectionThrottled, 100);
		},
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
		dropSelection: function() {
			_.each(this.models, function(sm) {
				sm.setOrigs();
			});
		},
		moveSelectionThrottled: function(e) {
			if(e.shiftKey) {
				if(_mouse_distance(_mouse_down, e) > 30) {
					var x_distance = Math.abs(_mouse_down.pageX - e.pageX);
					var y_distance = Math.abs(_mouse_down.pageY - e.pageY);
					if(x_distance >= y_distance) {
						this.setPositionDelta({
							'top': 0,
							'left': (e.pageX - _mouse_down.pageX)
						});
						
					} else if(y_distance > x_distance) {
						this.setPositionDelta({
							'top': (e.pageY - _mouse_down.pageY),
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
				this.setPositionDelta({
					'top': (e.pageY - _mouse_down.pageY),
					'left': (e.pageX - _mouse_down.pageX)
				});
			}
			
			_set_style_text();
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
			_update_history();
		},
		setPositionDelta: function(position, set_orig) {
			_.each(this.models, function(sm) {
				sm.setPositionDelta(position);
				if(set_orig) sm.setOrigs();
			});
			_update_history();
		},
		setSizeDelta: function(size) {
			_.each(this.models, function(sm) {
				sm.setSizeDelta(size);
			});
			_update_history();
		},
		copyToClipboard: function() {
			_$clipboard = new Array();
			_.each(this.models, function(sm) {
				_$clipboard.push(sm.getObject());
			});
		},
		deleteSelected: function() {
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
	 * Private vars
	 ***********************/
	var _obj_id = 0;
	var _mouse_move_event;
	var _mouse_click;
	var _mouse_down;
	var _mouse_up;
	var _shift_down_flag = false;
	var _key_down_event;
	var _grab_object = false;
	var _$container = $('#container');
	var _$clipboard = new Array();
	var _$focused = undefined;
	var _orig_position;
	var _orig_shadow;
	var _$edit_text = $('#edit-text');
	var _$style_text = $('#style-text');
	var _saved_flag = true;
	var _$file_title = $('#file-title');
	var _$selection_box = $('');
	var _$selection_boxes = $('#selection-boxes');
	var _this = this;
	var _selectbox_collection = new SelectboxCollection;
	var _$distrib_horz_txt = $('#distrib-horz-txt');
	var _$distrib_vert_txt = $('#distrib-vert-txt');
	
	
	// Private functions
	var _insert_object = function(content, paste) {
		console.log(content);
		var obj_id = 'obj-' + (++_obj_id);
		var $object = $(content).attr('id', obj_id);
		
		if(!paste) {
			var offset = _$container.offset();
			var left = Math.round(_mouse_move_event.pageX - offset.left);
			var top = Math.round(_mouse_move_event.pageY - offset.top);
			$object.css({'top': top, 'left': left});
		}
		
		_$container.append($object);
		_bind_object($object);
		_focus($object, undefined, paste);
		_update_history();
		return $object;
	}
	
	var _bind_object = function($object) {
		$object.bind('mousedown', function(e) {
			_focus($(this), e);
			_grab_object = true;
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
	
	var _focus = function($object, event, paste) {
		if((event && event.shiftKey && !event.ctrlKey) || paste) {
		
			// Find if clicking again and remove
			if(!_selectbox_collection.removeByObject($object))
				_selectbox_collection.add([new SelectboxModel({'$object': $object})]);
				
		} else {
			if(_selectbox_collection.findByObject($object)) {
				return false;
				
			} else {
				_selectbox_collection.reset().add([new SelectboxModel({'$object': $object})]);
			}
		}
		
		// Stop if nothing is selected
		if(_selectbox_collection.length == 0) return;
			
		// Set text box
		_set_edit_text();
		
		// Set style box
		_set_style_text();
		
		// Set the original position needed for dragging ui
		_orig_position = $object.position();
		
		// Blur any focused element
		$(document.activeElement).blur();
	}
	
	var _blur = function($object) {
		// Remove (hide) selection box
		_selectbox_collection.reset();
		
		// Remove anything from text boxes
		_set_edit_text('');
		_set_style_text('');
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
		if(_saved_flag == true) {
			_$file_title.html(_$file_title.html() + '*');
			_saved_flag = false;
		}
	}
	
	var _new_design = function() {
		_selectbox_collection.reset();
		_set_style_text('');
		_set_edit_text('');
		_$container.empty();
		_set_file_title('Untitled');
		_saved_flag = true;
		_obj_id = 0;
	}
	
	var _open_file = function(file) {
		if(!file) return;
	
		_blur();
	
		_$container.load('saved/' + encodeURIComponent(file), function(responseText, textStatus, XMLHttpRequest) {
			if(XMLHttpRequest.status != 200) return;
			
			_set_cookie('open_file', file, 735);
			
			_set_file_title(file);
			_saved_flag = true;
		
			$('> *', _$container).each(function() {
				var $object = $(this);
				var obj_id = parseInt($object.attr('id').split('-')[1]);
				if(obj_id > _obj_id) _obj_id = obj_id;
				
				_bind_object($object);
			});
		});
	}
	
	var _copy = function() {
		_selectbox_collection.copyToClipboard();
	}
	
	var _paste = function() {
		_blur();
		_.each(_$clipboard, function($paste) {
			_insert_object($paste.clone(), true);
		});
	}
	
	var _update_edit_text = function() {
		_selectbox_collection.updateHTML(cmEditText.getValue());
	}
	
	var _update_style_text = function() {
		_selectbox_collection.updateStyle(cmStyleText.getValue());
	}
	
	
	/**************************************
	 * Capture document events
	 **************************************/
	$(document).click(function(e) {
		_mouse_click = e;
	});
	
	$(document).mousedown(function(e) {
		_mouse_down = e;
	});
	
	$(document).mouseup(function(e) {
		_mouse_up = e;
		_grab_object = false;
		_selectbox_collection.dropSelection();
	});
	
	$(document).mousemove(function(e) {
		_mouse_move_event = e;
		
		e.preventDefault();
		
		// Move grabbed object
		if(_grab_object && e.ctrlKey) {
			_selectbox_collection.moveSelection(e);
		}
	});
	
	$(document).keydown(function(e) {
		// Focused objects only
		if($(e.target).is('body')) {
			if(e.ctrlKey) {
				if(e.which == 67) _copy(); // Ctrl + C - Copy
				else if(e.which == 86) _paste(); // Ctrl + V - Paste
				
			} else {
				if(e.keyCode == 16) { // Hold down shift
					_shift_down_flag = true;
				}
				
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
		if(e.keyCode == 16) { // Release shift
			_shift_down_flag = false;
		}
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
		
			// Blur (esc)
			else if(e.keyCode == 27) {
				_blur();
			}
		
			// Delete
			else if(e.keyCode == 46) {
				_selectbox_collection.deleteSelected();
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
					_insert_object('<div class="box clickable"><span></span></div>');
				break;
				
				case 'copy':
					_copy();
				break;
				
				case 'cut':
					_copy();
					_selectbox_collection.deleteSelected();
				break;
				
				case 'paste':
					_paste();
				break;
				
				case 'delete':
					_selectbox_collection.deleteSelected();
				break;
				
				case 'fit_to_text':
					_selectbox_collection.updateCSS({'width': 'auto', 'height': 'auto'});
				break;
			}
		},
		items: {
			"add_box": {name: "Add a MeldBox"},
			"sep1": "-------",
			"copy": {
				name: "Copy",
				disabled: function(key, options) {
					if(options.$trigger.is('#container')) return true;
					else return false;
				}
			},
			"cut": {
				name: "Cut",
				disabled: function(key, options) {
					if(options.$trigger.is('#container')) return true;
					else return false;
				}
			},
			"paste": {
				name: "Paste",
				disabled: function(key, options) {
					if(!_$clipboard) return true;
					else return false;
				}
			},
			"delete": {
				name: "Delete",
				disabled: function(key, options) {
					if(options.$trigger.is('#container')) return true;
					else return false;
				}
			},
			"fit_to_text": {
				name: "Fit to content",
				disabled: function(key, options) {
					if(options.$trigger.is('#container')) return true;
					else return false;
				}
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
			_open_file($('#open-file-select').val());
		}
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
	
	// Menu functions
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
	
	this.openFile = function(file) {
		_open_file(file);
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
	
	// Stop default browser drag
	$(document).bind("dragstart", function(e) {
		if(!$(e.target).hasClass('ui-dialog')) return false;
	});
	
	// Panel controls
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
	
	var cmStyleText = CodeMirror.fromTextArea(_$style_text[0], {mode:"css"});
	cmStyleText.on('keypress', function(instance, event) {
		if(event.ctrlKey && event.keyCode == 13) _update_style_text();
		else if(event.keyCode == 27) {
			document.activeElement.blur();
		}
	});
	
	
	/*********************************
	 * Utility functions
	 *********************************/
	var _set_cookie = function(c_name, value, exdays) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
	}
}
