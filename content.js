//content.js
//THIS IS THE MAIN CODE
// Global variable to track scanning status (always true now)
let isScanning = true;

// Function to extract all the URLs on the page
function getUrlsFromPage() {
  let urls = [];
  
  // Access the DOM to get all anchor tags (<a>) on the page
  let links = document.querySelectorAll('a');

  // Iterate through each link and extract the 'href' attribute (URL)
  links.forEach(link => {
    if (link.href) {
      urls.push(link.href);
    }
  });

  // Also check for buttons or elements with click events and data attributes containing URLs
  let elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    if (element.getAttribute('onclick')) {
      const match = element.getAttribute('onclick').match(/https?:\/\/[^"'\s]+/);
      if (match) {
        urls.push(match[0]);
      }
    }
    if (element.dataset.href) {
      urls.push(element.dataset.href);
    }
    if (element.dataset.url) {
      urls.push(element.dataset.url);
    }
  });

  return urls;
}

// Function to scan for URLs on the page and send them for checking
function scanForUrls() {
  // Get all URLs from the page using `getUrlsFromPage`
  const urls = getUrlsFromPage();

  // Send URLs to the background script for checking
  if (urls.length > 0) {
    chrome.runtime.sendMessage({
      action: 'checkUrls',
      urls: urls
    });
  }

  // Highlight all URLs
  //highlightAllUrls();
}

// Function to highlight a specific URL element
function highlightUrl(element) {
  element.style.backgroundColor = '#ffff00';
  element.style.textDecoration = 'underline wavy red';
}

// Function to highlight all URLs on the screen with neon yellow
/*function highlightAllUrls() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.backgroundColor = 'neonyellow';
    link.style.color = 'yellow';
    link.style.border = '1px solid black';
    link.style.padding = '2px';
  });

  const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    element.style.backgroundColor = 'neonyellow';
    element.style.color = 'yellow';
    element.style.border = '1px solid black';
    element.style.padding = '2px';
  });
}*/

// Function to remove all highlights
function removeHighlights() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.removeProperty('background-color');
    link.style.removeProperty('color');
    link.style.removeProperty('border');
    link.style.removeProperty('padding');
  });

  const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    element.style.removeProperty('background-color');
    element.style.removeProperty('color');
    element.style.removeProperty('border');
    element.style.removeProperty('padding');
  });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightPhishingUrl') {
    const links = document.getElementsByTagName('a');
    for (let link of links) {
      if (link.href === request.url) {
        highlightUrl(link);
        
        // Add a click event listener to show a warning page
        link.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.runtime.sendMessage({
            action: 'openWarningPage',
            url: link.href
          });
        });
      }
    }
  }
});

// Start initial scan when the page loads
scanForUrls();

// Set up periodic scanning
//setInterval(scanForUrls, 5000); // Scan every 5 seconds changed this to try for better cpu usage 
let lastScanTime = 0;
document.addEventListener('scroll', () => {
    let now = Date.now();
    if (now - lastScanTime > 30000) { // Scan every 30 seconds max
        scanForUrls();
        lastScanTime = now;
    }
});

//hello





