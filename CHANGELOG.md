# Meldbox Changlog

### Meldbox version 1.5

- Clicking on canvas will deselect
- Multi select works when dragging from canvas
- Removed need to hold Ctrl to drag elements
- Dragging doesn't throw element
- Updated Welcome file
- Added LZW compression function
- Changed the way Backbone objects receive mouse events
- Made selecting elements much more like Fireworks
- Selection bug fixes
- Added undo/redo funtionality
- mBox HTML and CSS select reset fixes
- Select all (Ctrl + A)
- Element locking (Ctrl + Alt + L)
- Added unlock all
- Select box and select all will not select mBox elements with `pointer-events: none`
- DRY'ed some functions
- Backspace key will also delete selected
- Added `Ctrl + X` to cut selected
- Added more public Meldbox methods
- Added menu items for editing, viewing and selecting elements
- Added quick key reference to context menu and drop down menu
- Multi select box is deactive in preview mode
- Added a message alerting if user wants to exit Meldbox

### Meldbox version 1.4

- Added multi selection box when dragging from canvas, outside of canvas or locked elements (coming soon)

### Meldbox version 1.3

- Added preview mode
- Added URI query label value pairs to open file and go into preview mode
- Added preview mode link in menu
- Changed some file names
- Added this changelog
- Changed todo text file to a md file
- Changed design area margin
- Modified Meldbox description in the README file
- Added requirements, installation and instructions to README


### Meldbox version 1.2

- Added canvas panel to update canvas properties
- Added align canvas to browser
- Added canvas resize dimensions
- Added canvas resize from an origin
- Changed CSS to work with new canvas resize feature
- Moved default unopened panels to top of left panel container
- Updated menu to reflect default open and closed panels
- Removed right side panel container
- Created Backbonejs MVC for panels
- Added events for panel controls
- Resized HTML and CSS mBox codemirror areas
- Added a script to the Welcome saved file to alert certain warning messages
- Added 100% width on CSS library and open file select
- Changed loading of saved files from using $.load to $.ajax
- Added a random string creator function


### Meldbox version 1.1

- Changed panel titles
- Changed About panel contents and links
- Added GPLv3 license
- Added the CSS library manager
- Got rid of useless variables
- Added an md5 library
- Added an utf8_encode library
- Included a todo file containing needed fixes and features
- _new_design now removes just box elements from canvas
- Changed radio and checkbox margin to 0px


### Meldbox version 1.0.0

- Initial release
