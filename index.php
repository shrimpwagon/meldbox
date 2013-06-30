<?php

// Get list of saved files
$files = array();
foreach(new DirectoryIterator('saved') as $file) {
	if($file->isFile()) $files[] = $file->getFilename();
}
sort($files);


// Subsections
$panel_controls = '
<div class="panel-controls">
	<i class="icon icon-chevron-sign-left panel-control shift-left-panel"></i> 
	<i class="icon icon-chevron-sign-right panel-control shift-right-panel"></i> 
	<i class="icon icon-chevron-sign-up panel-control shift-up-panel"></i> 
	<i class="icon icon-chevron-sign-down panel-control shift-down-panel"></i> 
	<i class="icon icon-minus-sign panel-control expand-panel"></i>
	<i class="icon icon-remove-sign panel-control remove-panel"></i>
</div>';

// Default file open
$open_file = $_COOKIE['open_file'];
if(!$open_file && is_file('saved/Welcome')) $open_file = 'Welcome';

?>
<!DOCTYPE html>
<html>
<head>
<title>Meldbox - Demo</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<link rel="stylesheet" type="text/css" href="css/jquery.contextMenu.css" />
<link rel="stylesheet" type="text/css" href="css/jquery-pagedesigner.css" />
<link rel="stylesheet" type="text/css" href="css/font-awesome.min.css" />
<link rel="stylesheet" type="text/css" href="css/codemirror.css" />

<script>
var init = function() {
	$.PageDesigner = new PageDesigner();
	$.PageDesigner.openFile('<?php echo $open_file ?>');
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
			<a href="javascript: $.PageDesigner.newDesign()">New</a>
			<a href="javascript: $.PageDesigner.toggleDialog('open', true)">Open</a>
			<a href="javascript: $.PageDesigner.saveDesign()">Save</a>
			<a href="javascript: $.PageDesigner.saveDesign(true)">Save As...</a>
		</div>
	</div>
	<div>
		<a href="javascript: void(0)">Window</a>
		<div>
			<a href="javascript: $.PageDesigner.closeDialogs()" id="menu-closedialogs">Close All Windows</a>
			<div class="seperator"></div>
			<a href="javascript: $.PageDesigner.toggleDialog('about')" id="menu-about"><span class="icon icon-check"></span> About</a>
			<a href="javascript: $.PageDesigner.toggleDialog('style')" id="menu-style"><span class="icon icon-check"></span> CSS Element Style</a>
			<a href="javascript: $.PageDesigner.toggleDialog('distribute')" id="menu-distribute"><span class="icon icon-check-empty"></span> Distribute</a>
			<a href="javascript: $.PageDesigner.toggleDialog('innerhtml')" id="menu-innerhtml"><span class="icon icon-check"></span> Inner HTML</a>
			<a href="javascript: $.PageDesigner.toggleDialog('open')" id="menu-open"><span class="icon icon-check-empty"></span> Open File</a>
			<!-- <a href="javascript: $.PageDesigner.toggleDialog('conversion')" id="menu-conversion"><span class="icon icon-check-empty"></span> UI Conversion</a> -->
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
	<div id="file-title">Untitled</div>
	<br style="clear: both;" />
</div>

<!-- Page -->
<div id="design-area">
	<div id="design-canvas" class="clickable">
		<div id="selection-boxes"></div>
		<div id="container" class="clickable"></div>
	</div>
</div>

<!-- Styles -->
<div id="styles-container">
</div>

<!-- DIALOGS -->
<div id="pd-tool-container-left" class="pd-tool-container">

	<div id="about-panel" data-panel="about" class="pd-tool-panel">
		<h4 class="panel-header">About
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<p style="text-align: center; font-size: 12px">
				Meldbox<br />
				v1.0 (beta)<br /><br />
				Shawn Welch &lt;<a href="mailto:shawn@meldbox.net">shawn@meldbox.net</a>&gt;<br />
				Submit issues: <a href="https://meldbox.fogbugz.com/" target="_blank">meldbox.fogbugz.com</a><br /><br />
			</p>
			<div style="text-align: center; font-size: 12px">
				<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
					<input type="hidden" name="cmd" value="_s-xclick">
					<input type="hidden" name="hosted_button_id" value="MF2WXBZSLGBW8">
					<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
					<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
				</form>
			</div>
		</div>
	</div>

	<div id="innerhtml-panel" data-panel="innerhtml" class="pd-tool-panel">
		<h4 class="panel-header">Inner HTML
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<textarea id="edit-text" class="dialog-text edit-area" data-editarea="html" wrap="off"></textarea>
			<span class="panel-note">Update: (Ctrl + Enter)</span>
			<span style="float: right;"><input type="checkbox" onclick="$.PageDesigner.toggleWrap(this)" data-cm="EditText" /> Wrap text</span>
		</div>
	</div>

	<div id="style-panel" data-panel="style" class="pd-tool-panel">
		<h4 class="panel-header">CSS Element Style
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<textarea id="style-text" class="dialog-text edit-area" data-editarea="css" wrap="off"></textarea>
			<span class="panel-note">Update: (Ctrl + Enter)</span>
			<span style="float: right;"><input type="checkbox" onclick="$.PageDesigner.toggleWrap(this)" data-cm="StyleText" /> Wrap text</span>
		</div>
	</div>

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

	
</div>

<div id="pd-tool-container-right" class="pd-tool-container">
	
	<div id="distribute-panel" data-panel="distribute" class="pd-tool-panel" style="display: none;">
		<h4 class="panel-header">Distribute
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<table cellspacing="0" cellpadding="0">
				<tr>
					<td style="text-align: right; padding-right: 5px">Horizontal:</td>
					<td><input type="text" id="distrib-horz-txt" style="width: 30px; text-align: right;" /> px</td>
				</tr>
				<tr>
					<td style="text-align: right; padding-right: 5px">Vertical:</td>
					<td><input type="text" id="distrib-vert-txt" style="width: 30px; text-align: right;" /> px</td>
				</tr>
			</table>
			<span class="panel-note">Update: (Enter)</span>
		</div>
	</div>

	<div id="open-panel" data-panel="open" class="pd-tool-panel" style="display: none;">
		<h4 class="panel-header">Open File
			<?php echo $panel_controls ?>
		</h4>
		<div>
			<select id="open-file-select" size="10" style="width: 260px">
			<?php
			foreach($files as $file) {
				echo '
				<option value="' . $file . '">' . $file . '</option>';
			}
			?>
			</select><br />
			<button type="button" id="open-file-btn">Open</button>
		</div>
	</div>
	
</div>
<?php @include('../google_analytics.php') ?>
</body>
</html>
