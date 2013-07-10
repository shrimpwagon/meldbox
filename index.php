<?php

/*

Meldbox
Version: 1.4

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

// Get list of saved files
$files = array();
foreach(new DirectoryIterator('saved') as $file) {
	if($file->isFile()) $files[] = $file->getFilename();
}
sort($files);

// Get available CSS libs
$css_libs = array();
foreach(new DirectoryIterator('css/lib') as $css_lib) {
	if($css_lib->isFile()) $css_libs[] = $css_lib->getFilename();
}
sort($css_libs);


// Panel control buttons
/* Add these later
<i class="icon icon-chevron-sign-left panel-control shift-left-panel"></i> 
<i class="icon icon-chevron-sign-right panel-control shift-right-panel"></i> 
*/
$panel_controls = '
<div class="panel-controls">
	<i class="icon icon-chevron-sign-up panel-control shift-up-panel"></i> 
	<i class="icon icon-chevron-sign-down panel-control shift-down-panel"></i> 
	<i class="icon icon-minus-sign panel-control expand-panel"></i>
	<i class="icon icon-remove-sign panel-control remove-panel"></i>
</div>';

// Default file open
$open_file = ($_GET['open_file']) ? $_GET['open_file'] : $_COOKIE['open_file'];
if($open_file && !is_file('saved/' . $open_file)) $open_file = '';
if(!$open_file && is_file('saved/Welcome')) $open_file = 'Welcome';

// Open in preiview mode
$preview_mode = $_GET['preview_mode'];

?>
<!DOCTYPE html>
<html>
<head>
<title>Meldbox - Demo</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<link rel="stylesheet" type="text/css" href="css/jquery.contextMenu.css" />
<link rel="stylesheet" type="text/css" href="css/meldbox.css" />
<link rel="stylesheet" type="text/css" href="css/font-awesome.min.css" />
<link rel="stylesheet" type="text/css" href="css/codemirror.css" />

<script>
var init = function() {
	$.Meldbox = new Meldbox();
	$.Meldbox.openFile('<?php echo $open_file ?>', true);
	<?php if($preview_mode) { ?>$.Meldbox.previewMode(true); <?php } ?>
}
</script>
<script data-main="js/app" src="js/lib/require.js"></script>

</head>
<body>

<!-- Menu -->
<div id="menu">
	<a href="http://meldbox.net" target="_blank" style="float: left; display: block;"><img src="img/logo-small.png" /></a>
	<div style="margin-left: 20px;">
		<a href="javascript: void(0)">File</a>
		<div>
			<a href="javascript: $.Meldbox.newDesign()">New</a>
			<a href="javascript: $.Meldbox.toggleDialog('open', true)">Open</a>
			<a href="javascript: $.Meldbox.saveDesign()">Save</a>
			<a href="javascript: $.Meldbox.saveDesign(true)">Save As...</a>
		</div>
	</div>
	<div>
		<a href="javascript: void(0)">View</a>
		<div>
			<a href="javascript: $.Meldbox.closeDialogs()" id="menu-closedialogs">Close All</a>
			<div class="seperator"></div>
			<a href="javascript: $.Meldbox.toggleDialog('about')" id="menu-about"><span class="icon icon-check"></span> About</a>
			<a href="javascript: $.Meldbox.toggleDialog('canvas')" id="menu-canvas"><span class="icon icon-check-empty"></span> Canvas</a>
			<a href="javascript: $.Meldbox.toggleDialog('style')" id="menu-style"><span class="icon icon-check"></span> CSS Element Style</a>
			<a href="javascript: $.Meldbox.toggleDialog('css')" id="menu-css"><span class="icon icon-check-empty"></span> CSS Library</a>
			<a href="javascript: $.Meldbox.toggleDialog('distribute')" id="menu-distribute"><span class="icon icon-check-empty"></span> Distribute</a>
			<a href="javascript: $.Meldbox.toggleDialog('innerhtml')" id="menu-innerhtml"><span class="icon icon-check"></span> Inner HTML</a>
			<a href="javascript: $.Meldbox.toggleDialog('open')" id="menu-open"><span class="icon icon-check-empty"></span> Open File</a>
			<!-- <a href="javascript: $.Meldbox.toggleDialog('conversion')" id="menu-conversion"><span class="icon icon-check-empty"></span> UI Conversion</a> -->
		</div>
	</div>
	<div>
		<a href="javascript: void(0)">Help</a>
		<div>
			<a href="http://css3gen.com/box-shadow/" target="_blank">Box Shadows</a>
			<a href="http://www.html5rocks.com/en/tutorials/masking/adobe/" target="_blank">Clipping &amp; Masking</a>
			<a href="http://www.colorzilla.com/gradient-editor/" target="_blank">Gradient Generator</a>
			<a href="http://davidwalsh.name/css-transform-rotate" target="_blank">Rotation</a>
			<a href="http://svg-edit.googlecode.com/svn/branches/2.6/editor/svg-editor.html" target="_blank">SVG Editor</a>
			<a href="http://css3gen.com/text-shadow/" target="_blank">Text Shadows</a>
		</div>
	</div>
	<div>
		<a href="javascript: $.Meldbox.previewMode(true)">Preview</a>
	</div>
	<div id="file-title">Untitled</div>
	<br style="clear: both;" />
</div>

<!-- Page -->
<div id="design-area">
	<div id="design-canvas" class="clickable">
		<div id="mb-multi-select"></div>
		<div id="selection-boxes"></div>
		<div id="container" class="clickable"></div>
	</div>
</div>

<!-- DIALOGS -->
<div id="pd-tool-container-left" class="pd-tool-container">

	<!--
	<div id="conversion-panel" data-panel="conversion" class="pd-tool-panel" style="display: none;">
		<h4 class="panel-header">UI Conversion
			<?php echo $panel_controls ?>
		</h4>
		<div style="display: none;">
			<iframe src="/ui-converter.php" style="width: 305px; height: 360px; border: 0;" seamleass="seamless" scrolling="no"></iframe>
		</div>
	</div>
	-->

	
	<div id="css-panel" data-panel="css" class="pd-tool-panel" style="display: none;">
		<h4 class="panel-header">CSS Library
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<select id="css-file-select" size="5" style="width: 100%;">
			<?php
			foreach($css_libs as $css_lib) {
				echo '
				<option value="' . $css_lib . '">' . $css_lib . '</option>';
			}
			?>
			</select><br />
			<button type="button" id="import-css-btn">Import</button><br /><br />
			<div id="css-libraries"></div><br />
			
		</div>
	</div>

	<div id="open-panel" data-panel="open" class="pd-tool-panel" style="display: none;">
		<h4 class="panel-header">Open File
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<select id="open-file-select" size="10" style="width: 100%;">
			<?php
			foreach($files as $file) {
				echo '
				<option value="' . $file . '">' . $file . '</option>';
			}
			?>
			</select><br /><br />
			<button type="button" id="open-file-btn">Open</button>
		</div>
	</div>
	
	<div id="canvas-panel" data-panel="canvas" class="pd-tool-panel" style="display: none;">
		<h4 class="panel-header">Canvas
			<?php echo $panel_controls ?>
		</h4>
		<div>
			Alignment: 
			<select id="canvas-alignment">
				<option value="left">Left</option>
				<option value="none">Center</option>
				<option value="right">Right</option>
			</select>
			<br /><br />
			<table cellspacing="0" cellpadding="0">
				<tr>
					<td class="panel-field-label">Resize Origin:</td>
					<td>
						<select id="canvas-resize-origin">
							<option value="top-left">Top, Left</option>
							<option value="top-center">Top, Center</option>
							<option value="top-right">Top, Right</option>
							<option value="middle-left">Middle, Left</option>
							<option value="middle-center">Middle, Center</option>
							<option value="middle-right">Middle, Right</option>
							<option value="bottom-left">Bottom, Left</option>
							<option value="bottom-center">Bottom, Center</option>
							<option value="bottom-right">Bottom, Right</option>
						</select>
					</td>
				</tr>
				<tr>
					<td class="panel-field-label">Resize Width:</td>
					<td><input type="text" class="panel-px-input" id="canvas-resize-width" /> px</td>
				</tr>
				<tr>
					<td class="panel-field-label">Resize Height:</td>
					<td><input type="text" class="panel-px-input" id="canvas-resize-height" /> px</td>
				</tr>
			</table>
			<span class="panel-note">Update: (Enter)</span>
		</div>
	</div>
	
	<div id="distribute-panel" data-panel="distribute" class="pd-tool-panel" style="display: none;">
		<h4 class="panel-header">Distribute
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<table cellspacing="0" cellpadding="0">
				<tr>
					<td>Horizontal:</td>
					<td><input type="text" id="distrib-horz-txt" class="panel-px-input" /> px</td>
				</tr>
				<tr>
					<td class="panel-field-label">Vertical:</td>
					<td><input type="text" id="distrib-vert-txt" class="panel-px-input" /> px</td>
				</tr>
			</table>
			<span class="panel-note">Update: (Enter)</span>
		</div>
	</div>

	<div id="about-panel" data-panel="about" class="pd-tool-panel">
		<h4 class="panel-header">About
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<p style="text-align: center; font-size: 12px">
				Meldbox v1.3<br /><br />
				Author:<br />
				Shawn Welch &lt;<a href="mailto:shawn@meldbox.net">shawn@meldbox.net</a>&gt;<br /><br />
				Source and Issues:<br /><a href="https://github.com/shrimpwagon/meldbox" target="_blank">github.com/shrimpwagon/meldbox</a><br /><br />
			</p>
			<!--
			<div style="text-align: center; font-size: 12px">
				<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
					<input type="hidden" name="cmd" value="_s-xclick">
					<input type="hidden" name="hosted_button_id" value="MF2WXBZSLGBW8">
					<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
					<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
				</form>
			</div>
			-->
		</div>
	</div>

	<div id="innerhtml-panel" data-panel="innerhtml" class="pd-tool-panel">
		<h4 class="panel-header">mBox Inner HTML
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<textarea id="edit-text" class="dialog-text edit-area" data-editarea="html" wrap="off"></textarea>
			<span class="panel-note">Update: (Ctrl + Enter)</span>
			<span style="float: right;"><input type="checkbox" onclick="$.Meldbox.toggleWrap(this)" data-cm="EditText" /> Wrap text</span>
		</div>
	</div>

	<div id="style-panel" data-panel="style" class="pd-tool-panel">
		<h4 class="panel-header">mBox CSS Style
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<textarea id="style-text" class="dialog-text edit-area" data-editarea="css" wrap="off"></textarea>
			<span class="panel-note">Update: (Ctrl + Enter)</span>
			<span style="float: right;"><input type="checkbox" onclick="$.Meldbox.toggleWrap(this)" data-cm="StyleText" /> Wrap text</span>
		</div>
	</div>
	
</div>

<!--
<div id="pd-tool-container-right" class="pd-tool-container"></div>
-->

<?php @include('../google_analytics.php') ?>
</body>
</html>
