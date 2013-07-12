Project page: http://meldbox.net

View demo: http://meldbox.net/demo

[Donate via PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MF2WXBZSLGBW8)

# Meldbox
*Why design it in a graphics program only to redesign for a browser???*

Meldbox is an open source, in-browser, web page and app designer for prototyping and mocking up web sites and web applications for desktops, laptops and mobile devices. Meldbox utilizes the already built-in capabilities of modern browser HTML and CSS implementations to produce web design elements. Meldbox is not intended for the general computer user to make web pages and web apps. It is also not a web site creator, app creator or web page creator. It is a tool to aid the intermediate to advanced web and app developer to quickly prototype and mock up a web page, web site or web application for any screen resolution whether large format or mobile device format.

Meldbox is intended to work and act much like an Adobe design program like Photoshop or Fireworks. In fact it is modeled directly after Fireworks as far as ease of use and functionality although many functions are still missing. It is inteded to fill the need of a web design program such as Dreamweaver but make it available to all OS'es such as Linux, Mac and Windows. It also cuts down development time by already having much of the needed CSS and HTML required to build the live web page or web app.

## Important

#### DO NOT USE `<a>` TAGS WITH A LINK IN THE `src` ATTRIBUTE.

During designing this will cause the browser to naturally navigate to that link when clicked. In the value of the `src` attribute use `javascript: void(0)` or for preview mode (mockups) use `javascript: $.Meldbox.openFile('My Meldbox Design')` instead.


#### SAVE OFTEN

Things are still buggy and crashes may occur. Create backups often. If you actually give Meldbox a try you might start doing some serious design work.

#### NOT PROGRAMMED WITH SECURITY IN MIND

Meldbox is intended for an individual web developer or a group of developers to work on web and app designs. Be careful to not put Meldbox on a server that just anyone can access.

## Requirements

At a minimum some HTML and CSS knowledge is required to properly use Meldbox. No jQuery or Javascript coding is required except for adding functionality to working mockups. Currently, Meldbox needs to be installed on a server that is running PHP to save working files and utilize cookies. The need to use PHP will change in a future version that will utilize HTML5's local storage abilities. As of the current release Meldbox only works properly on a recently updated Mozilla compatible browser like Firefox or Iceweasel. Support for Chrome and Safari will come asap. There are no plans to support IE whatsoever. Meldbox works well on a non-mobile device at a resolution of at least 1200 pixels wide.

## Installation

Installation is extremely simple. There is no configuration file and it takes no Javascript options. Simply unzip the project directly into a hosted web server directory and access it from the browser. Make sure to give write permissions to the web server on the `/saved` folder.

## Usage Instructions

### Basic Designing

- Right-click to add a Meldbox
- Click a Meldbox element and style it using the CSS editor
- Add inner HTML to insert content using the HTML editor
- While dragging, hold `Shift` to move along the x and y axis of the origin

### Global Keys

- Press `Ctrl + S` to save design
- Press `Esc` while in a text input or text editor to return focus back to selected elements

### Keys While Elements Are Selected

- `Esc` to deselect
- Use the arrow keys to move 1px at a time
- While holding `Ctrl`, using the arrow keys will resize 1px at a time
- `,` to decrease z-index by 1
- `.`  to increase z-index by 1
- `Delete` to remove elements
- `Ctrl + Z` to undo
- `Ctrl + Y` to redo

### Adding CSS stylesheets

CSS library files are added by putting CSS files in the `/css/libs` directory. Once there, refresh the browser, view the CSS Library panel, click the file to import and click the Import button. This will add the stylesheet to the project file. Then toggle the Apply checkbox to turn the stylesheet on and off. The CSS stylesheets are scoped within the container of the design area. It is not possible to set a property on the body tag to apply a design wide property such as `color` or `font-family`. Use the * (asterisk) rule to apply a common property amongst all of the Meldbox elements. For example, save a file in `/css/libs` called mystyle.css with the following content:

    * {
        font-family: Verdana;
        color: #55F;
     }
	
Save the current design, refresh the project screen, view the CSS Library panel, click the mystyle.css file, click the Import button then click the Apply checkbox. This will apply the above style to all of the Meldbox elements. Changing the CSS file externally will not effect the imported file in the project. To modify the imported stylesheet, click the Remove button below the stylesheet and reimport the newly modified .css file.

### Multi-Select Elements

Hold `Shift` to select multiple Meldboxes. As multiple elements are selected the mBox CSS Style will only show what properties are the same amongst all selected elements. Changing, adding or removing properties will be applied to all selected elements. This has a lot of design advantages. For example if you want to align all the elements. Simply set the `top` or `left` property and all the selected elements will recieve the same property thus aligning them. Being able to group the selected elements will come in a future version.

### Preview Mode and Mockups

To give navigation to elements while in preview mode simply set the `src` attribute of an `<a>` tag to `javascript: $.Meldbox.openFile('filename-to-open')` or set an elements' onclick value to `$.Meldbox.openFile('filename-to-open')`. While designing, Meldbox knows not to load these files when clicked except when in preview mode. To enter preview mode simply click the link labeled Preview in the menu. A URI query can be appended to the location of the Meldbox installation folder to send a visitor directly to a design in preview mode by supplying the following label value pairs: `?open_file=my-saved-design&preview_mode=true`.
