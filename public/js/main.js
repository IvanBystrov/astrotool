var mapTypes = {};

function getCurrentLocale() {
    return $('html').attr('lang') || 'en';
}
 
// set up the map types
mapTypes['sky'] = {
  getTileUrl: function(coord, zoom) {
    return getHorizontallyRepeatingTileUrl(coord, zoom, function(coord, zoom) {
      return "http://mw1.google.com/mw-planetary/sky/skytiles_v1/" +
             coord.x + "_" + coord.y + '_' + zoom + '.jpg';

    });
  },
  tileSize: new google.maps.Size(256, 256),
  isPng: false,
  maxZoom: 13,
  radius: 57.2957763671875,
  name: 'Sky',
  credit: 'Image Credit: SDSS, DSS Consortium, NASA/ESA/STScI'
};


// Normalizes the tile URL so that tiles repeat across the x axis (horizontally) like the
// standard Google map tiles.
function getHorizontallyRepeatingTileUrl(coord, zoom, urlfunc) {
  var y = coord.y;
  var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = (x % tileRange + tileRange) % tileRange;
  }

  return urlfunc({x:x,y:y}, zoom)
}


var map;
var mapTypeIds = [];

// Setup a copyright/credit line, emulating the standard Google style
var creditNode = document.createElement('div');
creditNode.id = 'credit-control';
creditNode.style.fontSize = '11px';
creditNode.style.fontFamily = 'Arial, sans-serif';
creditNode.style.margin = '0 2px 2px 0';
creditNode.style.whitespace = 'nowrap';
creditNode.index = 0;

var coordinatesNode = document.createElement('div');
coordinatesNode.id = 'coordinates-control';
coordinatesNode.style.fontSize = '14px';
coordinatesNode.style.color = '#176586';
coordinatesNode.style.textShadow = 'blue 1px 1px 1px';
coordinatesNode.style.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
coordinatesNode.style.margin = '24px 24px 24px 24px';
coordinatesNode.style.whitespace = 'nowrap';
creditNode.index = 0;


function setCredit(credit) {
  creditNode.innerHTML = credit + ' -';
}

function ra2lon(ra){
  var lon = 180 - ra;
  return lon;
}

function ra2lonHumanReadable(ra) {
    return leftThreeSignsAfterComma(ra2lon(ra));
}

function leftThreeSignsAfterComma(num) {
    return Math.round(num * 1000) / 1000;
}



function lon2ra(lon){
  var ra = 180 - lon;
  return ra;
}

function writeCenter(map){
  coordinatesNode.innerHTML = "RA: " + ra2lonHumanReadable(map.getCenter().lng()) + " DEC: " + leftThreeSignsAfterComma(map.getCenter().lat());
}

function initialize() {

  // push all mapType keys in to a mapTypeId array to set in the mapTypeControlOptions
  for (var key in mapTypes) {
    mapTypeIds.push(key);
  }

  var mapOptions = {
    zoom: 3,
    center: new google.maps.LatLng(0, 0),
    mapTypeControlOptions: {
      mapTypeIds: mapTypeIds,
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    }
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

  // push the credit/copyright custom control
  map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditNode);
  
  // push coordinates line custom control
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(coordinatesNode);

  // add the new map types to map.mapTypes
  for (key in mapTypes) {
    map.mapTypes.set(key, new google.maps.ImageMapType(mapTypes[key]));
  }

  // handle maptypeid_changed event to set the credit line
  google.maps.event.addListener(map, 'maptypeid_changed', function() {
    setCredit(mapTypes[map.getMapTypeId()].credit);
  });
  
  google.maps.event.addListener(map, 'center_changed', function () {
      writeCenter(map);
  });
  
  google.maps.event.addListener(map, 'click', function(e) {
      
      var ra = ra2lon(e.latLng.lng());
      var dec = e.latLng.lat();
      
      // show dropdown with loader
      
      // call server proxy script to load details from wikimapia
      $.ajax({
          url: '/sky_objects/search',
          data: {
              'ra': ra,
              'de': dec
          },
          dataType: 'json',
          success: function (response) {
              console.log(response);
              
              // put information into the dropdown
              
          },
          error: function () {
              // say that there are no any info for this object
              
          },
          
          complete: function () {
              // hide loader
          }
      });
      
      
  });

  // start with the moon map type
  map.setMapTypeId('sky');
  writeCenter(map);
}

if ($('#map_canvas').length) {
    initialize();
}

