# Archer Extension
## Overview
This extension is intended to aid an investigation in real-time by saving selected pages and entities and sending this collected data to the user's dashboard. For now, the extension is only supported by Chrome, although Firefox extensibility exists.

## Installation & usage
For now, because there is no official release, the extension must be loaded manually, rather than downloaded from the App Store. Simply clone the project from this repo. Navigate to `chrome://extensions` on Chrome and enable “Developer mode” at the top of the page. Then click “Load unpacked extension” and select the extension folder from the cloned project. The extension should appear next to the URL bar, in the top right of the browser (look for a search icon).

In order to start the Flask endpoint, navigate to the root directory of the project and run `python server/upload.py`. This currently starts a Flask endpoint which listens on `localhost:5000`. In order to send the current page to the Archer GCS, use the shortcut `Alt+1`. To save an entity, select the desired text, right-click, and select the 'Save ... as an entity' option. Currently, editing page or entity information in the extension is difficult. The recommended method is to download the Storage Explorer extension. From here, open the Archer extension, right-click the pop-up, and inspect it. In the dev tools pop-up, navigate to the Storage Explorer tab (likely hidden by the >> symbol in the top right), and then the chrome.storage.sync tab. The page and entity information is stored as jsonified lists here and can be modified by clicking the edit button to the right of each entry.

## Next Steps
1. SASS
2. Rewrite backend with node
3. ~~Entity highlighting~~
4. User authentication
5. Context menu -> on-selection card
6. Babel
7. Sort lists by recency
8. Favicons
