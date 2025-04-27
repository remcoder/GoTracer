import { Point } from './point.js';
import { GoTracer } from './gotracer.js';
import { Preview } from './preview.js';

// @ts-ignore
const colorPlot = document.getElementById("colorPlot");
// @ts-ignore
const previewElement = document.getElementById("preview");
// @ts-ignore
const imageUrlInput = document.getElementById("imageUrlInput");
// @ts-ignore
const canvases = document.getElementById("canvases");
// @ts-ignore
const canvas= document.getElementById("image");


let url = ''; // Initialize url as empty
let preview;
let timer = null;
const img = new Image();
const crosshair = new Image();
let goTracer = null; // Initialize later

// Call init when script loads
init();

// Initialize all event listeners
function init() {
  
  preview = new Preview(previewElement);

    // Replace body onload
    document.addEventListener('DOMContentLoaded', function() {
        if (goTracer) {
            goTracer.startScan();
            preview.update(goTracer);
        }
    });

    // Replace form onsubmit
    
    imageUrlInput.form.addEventListener('submit', function(e) {
      e.preventDefault();
      loadImageFromInput();
    });

    // Replace canvas onclick
    previewElement?.addEventListener('click', function(e) {
        e.preventDefault();
        downloadSGF();
    });

    // Replace button onclick
    previewElement?.nextElementSibling.addEventListener('click', function(e) {
        e.preventDefault();
        downloadSGF();
    });

    // Add example button listener
    document.querySelector('.load-example')?.addEventListener('click', function(e) {
        e.preventDefault();
        loadExample();
    });

    // Load initial image if URL parameter exists
    var initialUrl = getQueryParam('image');
    if (initialUrl) {
        imageUrlInput.value = initialUrl;
        url = initialUrl;
        loadImage();
    }
}

// Function to get query parameters
function getQueryParam(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

img.onerror = function() {
  alert("Cannot load image: " + url + "\n\nPlease ensure the URL is correct and the image server allows cross-origin requests (CORS).");
  document.body.style.cursor = "default";
  canvases.style.display = "none";
};

img.onload = function() {
  canvases.style.display = "table";
  document.body.style.cursor = "default";
  // Initialize GoTracer only after image is loaded
  goTracer = new GoTracer(img, canvas, colorPlot, crosshair);
  setCorners(); // Set corners after goTracer is initialized
  // Add event listeners after goTracer is initialized
  canvas.addEventListener("mousedown", handleDown, false);
  canvas.addEventListener("mouseup", handleUp, false);
  canvas.addEventListener("mousemove", handleMove, false);
  canvas.addEventListener("click", function(e) { handleDown(e); handleUp(e)}, false);
  update(); // Initial update
}

crosshair.src = "images/skitch2.png";

// Function to load image from input or query param
function loadImageFromInput() {
    url = imageUrlInput.value;
    if (url) {
        loadImage();
    } else {
        alert("Please enter an image URL.");
    }
}

// Function to load the example image
function loadExample() {
    url = "/images/examples/goban1.jpg";
    imageUrlInput.value = url;
    loadImage();
}

// Function to actually load the image
function loadImage() {
    if (!url) return;
    document.body.style.cursor = "wait";
    canvases.style.display = "none"; // Hide while loading new image
    // Try direct loading (might fail due to CORS)
    img.crossOrigin = "Anonymous"; // Attempt to request CORS permissions
    img.src = url;
}

// Load image on page load if URL parameter is present
var initialUrl = getQueryParam('image');
if (initialUrl) {
    imageUrlInput.value = initialUrl;
    url = initialUrl;
    loadImage();
}


function getCoords(e)
{
  var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; // Added documentElement scroll
  var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; // Added documentElement scroll

  var screenx = x;
  var screeny = y;

  for (var el = canvas; el; el = el.offsetParent)
  {
    x -= el.offsetLeft;
    y -= el.offsetTop;
  }

  // Adjust for canvas scaling if CSS width/height differs from canvas width/height
  var rect = canvas.getBoundingClientRect();
  x = (x / rect.width) * canvas.width;
  y = (y / rect.height) * canvas.height;


  return {
    x: x,
    y: y
  }
}

var currentCorner = null;
function handleDown(e)
{
  if (!goTracer) return; // Ensure goTracer is initialized
  var p = getCoords(e);
  currentCorner = goTracer.getNearestCorner(p.x, p.y);
  handleMove(e);
}

function handleMove(e)
{
  if (!currentCorner || !goTracer) // Ensure goTracer is initialized
    return;

  var p = getCoords(e);
  currentCorner.x = p.x;
  currentCorner.y = p.y;

  window.clearTimeout(timer);
  timer = window.setTimeout(update, 20);
}

function update()
{
  if (!goTracer) return; // Ensure goTracer is initialized
  goTracer.startScan();
  preview.update(goTracer);
  // Update hash only if corners are valid numbers
  var hashCorners = goTracer.corners.map(c => (isNaN(c.x) || isNaN(c.y) ? '' : c.toString())).join(',');
  if (hashCorners.split(',').length === 8 && !hashCorners.includes('NaN') && !hashCorners.includes('undefined')) {
      location.hash = hashCorners;
  }
  // displayMatch(Math.round(goTracer.getMatch())); // Match display logic removed/commented
}

function handleUp(e)
{
  currentCorner = null;
}

function downloadSGF()
{
  if (!goTracer) {
      alert("Please load an image first.");
      return;
  }
  var sgfContent = goTracer.getSGF();
  if (!sgfContent) {
      alert("Could not generate SGF. Ensure corners are positioned correctly.");
      return;
  }

  var blob = new Blob([sgfContent], { type: 'application/x-go-sgf;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'game.sgf';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // Clean up
}

// init the corners either to those supplied in the url hash or default
function setCorners()
{
  if (!goTracer) return; // Ensure goTracer is initialized

  var coords = [];
  var hash = document.location.hash.substr(1);

  if (hash) {
      coords = hash.split(",");
  }

  // Validate hash coordinates
  if (coords.length == 8 && coords.every(c => !isNaN(parseFloat(c))))
  {
    coords = coords.map( function(c) { return parseFloat(c); }) // Use parseFloat

    goTracer.corners = [
      new Point(coords[0], coords[1]),
      new Point(coords[2], coords[3]),
      new Point(coords[4], coords[5]),
      new Point(coords[6], coords[7])
    ];
  } else { // No change needed here, the error was likely cascading from line 244
      // Set default corners if hash is invalid or not present
      // These defaults might need adjustment based on typical image sizes
      var w = canvas.width;
      var h = canvas.height;
      goTracer.corners = [
          new Point(w * 0.1, h * 0.1),
          new Point(w * 0.9, h * 0.1),
          new Point(w * 0.9, h * 0.9),
          new Point(w * 0.1, h * 0.9)
      ];
      console.log("Using default corners.");
  }
}
