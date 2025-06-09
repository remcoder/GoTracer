import { Point } from './point.js';
import { GoTracer } from './gotracer.js';
import { Preview } from './preview.js';

class App {
  // @ts-ignore
  colorPlot = document.getElementById("colorPlot");
  // @ts-ignore
  previewElement = document.getElementById("preview");
  // @ts-ignore
  imageUrlInput = document.getElementById("imageUrlInput");
  // @ts-ignore
  canvases = document.getElementById("canvases");
  // @ts-ignore
  canvas = document.getElementById("image");

  url = ''; // Initialize url as empty
  preview;
  timer = null;
  img = new Image();
  goTracer = null; // Initialize later
  currentCorner = null;

  constructor() {
    this.preview = new Preview(this.previewElement);

    // Replace body onload
    document.addEventListener('DOMContentLoaded', () => {
      if (this.goTracer) {
        this.goTracer.startScan();
        this.preview.update(this.goTracer);
      }
    });

    // Replace form onsubmit
    this.imageUrlInput.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.loadImageFromInput();
    });

    // Replace canvas onclick
    this.previewElement?.addEventListener('click', (e) => {
      e.preventDefault();
      this.downloadSGF();
    });

    // Replace button onclick
    this.previewElement?.nextElementSibling.addEventListener('click', (e) => {
      e.preventDefault();
      this.downloadSGF();
    });

    // Add example button listener
    document.querySelector('.load-example')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadExample();
    });

    // Load initial image if URL parameter exists
    var initialUrl = this.getQueryParam('image');
    if (initialUrl) {
      this.imageUrlInput.value = initialUrl;
      this.url = initialUrl;
      this.loadImage();
    }

    this.img.onerror = () => {
      alert("Cannot load image: " + this.url + "\n\nPlease ensure the URL is correct and the image server allows cross-origin requests (CORS).");
      document.body.style.cursor = "default";
      this.canvases.style.display = "none";
    };

    this.img.onload = () => {
      this.canvases.style.display = "table";
      document.body.style.cursor = "default";
      // Initialize GoTracer only after image is loaded
      this.goTracer = new GoTracer(this.img, this.canvas, this.colorPlot);
      this.setCorners(); // Set corners after goTracer is initialized
      // Add event listeners after goTracer is initialized
      this.canvas.addEventListener("mousedown", this.handleDown, false);
      this.canvas.addEventListener("mouseup", this.handleUp, false);
      this.canvas.addEventListener("mousemove", this.handleMove, false);
      this.canvas.addEventListener("click", (e) => { this.handleDown(e); this.handleUp(e) }, false);
      this.update(); // Initial update
    };

    // Load image on page load if URL parameter is present
    var initialUrlOnLoad = this.getQueryParam('image');
    if (initialUrlOnLoad) {
        this.imageUrlInput.value = initialUrlOnLoad;
        this.url = initialUrlOnLoad;
        this.loadImage();
    }
  }

  // Function to get query parameters
  getQueryParam(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // Function to load image from input or query param
  loadImageFromInput() {
    this.url = this.imageUrlInput.value;
    if (this.url) {
      this.loadImage();
    } else {
      alert("Please enter an image URL.");
    }
  }

  // Function to load the example image
  loadExample() {
    this.url = "/images/examples/goban1.jpg";
    this.imageUrlInput.value = this.url;
    this.loadImage();
  }

  // Function to actually load the image
  loadImage() {
    if (!this.url) return;
    document.body.style.cursor = "wait";
    this.canvases.style.display = "none"; // Hide while loading new image
    // Try direct loading (might fail due to CORS)
    this.img.crossOrigin = "Anonymous"; // Attempt to request CORS permissions
    this.img.src = this.url;
  }

  getCoords = (e) => {
    var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; // Added documentElement scroll
    var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; // Added documentElement scroll

    var screenx = x;
    var screeny = y;

    for (var el = this.canvas; el; el = el.offsetParent) {
      x -= el.offsetLeft;
      y -= el.offsetTop;
    }

    // Adjust for canvas scaling if CSS width/height differs from canvas width/height
    var rect = this.canvas.getBoundingClientRect();
    x = (x / rect.width) * this.canvas.width;
    y = (y / rect.height) * this.canvas.height;

    return {
      x: x,
      y: y
    }
  }

  handleDown = (e) => {
    if (!this.goTracer) return; // Ensure goTracer is initialized
    var p = this.getCoords(e);
    this.currentCorner = this.goTracer.getNearestCorner(p.x, p.y);
    this.handleMove(e);
  }

  handleMove = (e) => {
    if (!this.currentCorner || !this.goTracer) // Ensure goTracer is initialized
      return;

    var p = this.getCoords(e);
    this.currentCorner.x = p.x;
    this.currentCorner.y = p.y;

    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(this.update, 20);
  }

  update = () => {
    if (!this.goTracer) return; // Ensure goTracer is initialized
    this.goTracer.startScan();
    this.preview.update(this.goTracer);
    // Update hash only if corners are valid numbers
    var hashCorners = this.goTracer.corners.map(c => (isNaN(c.x) || isNaN(c.y) ? '' : c.toString())).join(',');
    if (hashCorners.split(',').length === 8 && !hashCorners.includes('NaN') && !hashCorners.includes('undefined')) {
      location.hash = hashCorners;
    }
    // displayMatch(Math.round(goTracer.getMatch())); // Match display logic removed/commented
  }

  handleUp = (e) => {
    this.currentCorner = null;
  }

  downloadSGF = () => {
    if (!this.goTracer) {
      alert("Please load an image first.");
      return;
    }
    var sgfContent = this.goTracer.getSGF();
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
  setCorners = () => {
    if (!this.goTracer) return; // Ensure goTracer is initialized

    var coords = [];
    var hash = document.location.hash.substr(1);

    if (hash) {
      coords = hash.split(",");
    }

    // Validate hash coordinates
    if (coords.length == 8 && coords.every(c => !isNaN(parseFloat(c)))) {
      coords = coords.map(function(c) { return parseFloat(c); }) // Use parseFloat

      this.goTracer.corners = [
        new Point(coords[0], coords[1]),
        new Point(coords[2], coords[3]),
        new Point(coords[4], coords[5]),
        new Point(coords[6], coords[7])
      ];
    } else { // No change needed here, the error was likely cascading from line 244
      // Set default corners if hash is invalid or not present
      // These defaults might need adjustment based on typical image sizes
      var w = this.canvas.width;
      var h = this.canvas.height;
      this.goTracer.corners = [
        new Point(w * 0.1, h * 0.1),
        new Point(w * 0.9, h * 0.1),
        new Point(w * 0.9, h * 0.9),
        new Point(w * 0.1, h * 0.9)
      ];
      console.log("Using default corners.");
    }
  }
}

// Instantiate the App class when the script loads
new App();
