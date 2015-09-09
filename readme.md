
# To run
    npm install
    bower install
    grunt

# General comments
* Most of the room data would ideally come from JSON file, which would be injected into a template. For timesaving, I've put it all into one HTML file.
* I've moved the call to action button above the apartment blurb  - beter UX, get people taking action quicker.
* For the breadcrumbs menu, I've gone for showing off the triangle style breadcrumbs rather than it looking perfect on mobile. Would be more tidy with a bit more time.
* The room types menu is collapsible on mobile like you asked, but this isn't the most accessible way - if a user has javascript disabled on a phone or is on a device that doesn't support CSS3 transitions then the menu won't work.
* Can make the cover image respnsive - see Cover.scss - but left out to save time.

# Tech
* Browserify - enables clean, reusable modules
* Susy grids - CSS grids rather than poluting html with grid classes
* Grunt for build
* SASS