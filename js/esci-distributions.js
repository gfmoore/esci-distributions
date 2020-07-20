/*
Program       esci-distributions.js
Author        Gordon Moore
Date          14 July 2020
Description   The JavaScript code for esci-distributions
Licence       GNU General Public LIcence Version 3, 29 June 2007
*/

// #region Version history
/*
0.1.0                 Initial version
*/
//#endregion 

let version = '0.0.1';

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working


  //#region for variable definitions (just allows code folding)
  let tooltipson = false;   //toggle the tooltips on or off

  const pdfdisplay = document.querySelector('#pdfdisplay');


  let realHeight = 100;
  let margin = {top: 0, right: 10, bottom: 0, left: 10}; 
  let width;
  let height;               //the true width of the pdf display area in pixels
  let heighttopaxis;
  let heightbottomaxis;
  let heightP;              //the true width of the pdf display area in pixels

  let xt, xb, y;            //scale functions

  let svgTopAxis;           //svg reference to the top axis
  let svgBottomAxis;        //svg reference to the bottom axis
  let svgP;                 //the svg reference to pdfdisplay


  let mu, sigma, df;        //the population mean, standard deviation and degrees of freedom
  let zmu, zsd;          //parametrs of normal distribution

  let normalpdf = [];       //the array holding the normal distribution
  let tpdf = [];            //the array holding the student t distribution

  //#endregion

  //api for getting width, height of element - only gets element, not entire DOM
  // https://www.digitalocean.com/community/tutorials/js-resize-observer
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    });
  });




  initialise();

  function initialise() {
    setTooltips();

    //get initial values for height/width
    width  = $('#pdfdisplay').outerWidth(true);
    height = $('#pdfdisplay').outerHeight(true);

    //these are fixed so do I need to be responsive?
    heighttopaxis    = $('#topaxis').outerHeight(true);
    heightbottomaxis = $('#bottomaxis').outerHeight(true);

    //do this once?
    //set a reference to the displaypdf area
    d3.selectAll('svg > *').remove();  //remove all elements under svgP
    $('svg').remove();                 //remove the all svg elements from the DOM

    //axes
    svgTopAxis = d3.select('#topaxis').append('svg').attr('width', '100%').attr('height', '100%');
    svgBottomAxis = d3.select('#bottomaxis').append('svg').attr('width', '100%').attr('height', '100%');

    //pdf display
    svgP = d3.select('#pdfdisplay').append('svg').attr('width', '100%').attr('height', '100%');


    //initialvalues - pick these up from textboxes/sliders or dropdowns
    mu     = 100;
    sigma  = 15;

    zmu    = 0;
    zsd    = 1;
    df     = 1000;

        
    resize();

  }

  function resize() {
    //have to watch out as the width and height do not always seem presice to pixels
    //browsers apparently do not expose true element width, height.
    //also have to think about box model. outerwidth(true) gets full width, not sure resizeObserver does.

    resizeObserver.observe(pdfdisplay);  //note doesn't get true outer width, height

    width   = width - margin.left - margin.right;  
    heightP = height - margin.top - margin.bottom;

    clear();
  }

  function clear() {
    setupDisplay();

    createNormal();
    createT();

    removeNormalPDF();
    drawNormalPDF();
  }

  function setupDisplay() {

    //the height is 0 - 100 in real world coords
    //the width is either -5 to +5 or 25 to 175 etc in real world coords

    //clear axes
    d3.selectAll('.topaxis').remove();
    d3.selectAll('.bottomaxis').remove();

    xt = d3.scaleLinear().domain([25, 175]).range([margin.left, width]);
    xb = d3.scaleLinear().domain([-5, 5]).range([margin.left, width]);
    y = d3.scaleLinear().domain([0, realHeight]).range([heightP, 0]);

    //top horizontal axis
    let xAxisA = d3.axisTop(xt);
    svgTopAxis.append('g').attr('class', 'topaxis').attr( 'transform', 'translate(0, 40)' ).call(xAxisA);

    //bottom horizontal axis
    let xAxisB = d3.axisBottom(xb);
    svgBottomAxis.append('g').attr('class', 'bottomaxis').attr( 'transform', 'translate(0, 0)' ).call(xAxisB);
  }
  
  function createNormal() {
    normalpdf = [];

    for (let x = -5.0; x <= 5.0; x += 0.005) {
      normalpdf.push({ x: x, y: jStat.normal.pdf(x, zmu, zsd) })
    }

    //scale it to fit in with drawing area
    let functionHeight = d3.max(normalpdf, function(d) { return d.y});
    normalpdf.forEach(function(v) {
      v.y = v.y * realHeight / functionHeight * 0.9 + 0.2;
    })

  }

  function drawNormalPDF() {
    //create a generator
    line = d3.line()
      .x(function(d, i) { return xb(d.x); })
      .y(function(d, i) { return y(d.y); });

    //display the curve
    svgP.append('path').attr('class', 'normalpdf').attr('d', line(normalpdf))

  }

  function removeNormalPDF() {
    d3.selectAll('.normalpdf').remove();
  }

  function showNormalPDF() {
    d3.selectAll('.normalpdf').show();
  }

  function hideNormalPDF() {
    d3.selectAll('.normalpdf').hide();
  }

  
  function createT() {
    tpdf = [];
    for (let x = -5; x < 5; x += 0.1) {
      tpdf.push({ x: x, y: jStat.studentt.pdf(x, df) })
    }

    //scale it to fit in with drawing area
    let functionHeight = d3.max(tpdf, function(d) { return d.y});
    tpdf.forEach(function(v) {
      v.y = v.y * realHeight / functionHeight * sigma;
    })
  }

  /*---------------------------------------------Tooltips on or off-------------------------------------- */

  function setTooltips() {
    Tipped.setDefaultSkin('esci');

    //heading section
    Tipped.create('#logo', 'Version: '+version, { skin: 'red', size: 'xlarge' });
    Tipped.create('#tooltipsonoff', 'Allow tooltips on or off, default is off!', { skin: 'esci', size: 'xlarge' });

    Tipped.create('#mainheading', 'From The New Statistics: ', { skin: 'esci', size: 'xlarge' });
    Tipped.create('#subheading', 'https://thenewstatistics.com', { skin: 'esci', size: 'xlarge' });

    //control section


    
    //footer
    Tipped.create('#footerlink', 'Return to the New Statistics website. ', { skin: 'esci', size: 'xlarge' });

    //display section

    //pdf display

    //slider display


    Tipped.disable('[data-tooltip]');
  }

  $('#tooltipsonoff').on('click', function() {
    if (tooltipson) {
      tooltipson = false;
      $('#tooltipsonoff').css('background-color', 'lightgrey');
    }
    else {
      tooltipson = true;
      $('#tooltipsonoff').css('background-color', 'lightgreen');
      Tipped.enable('[data-tooltip]');
    }
  })


  /*----------------------------------------------------------footer----------------------------------------*/
 
  $('#footer').on('click', function() {
    window.location.href = "https://thenewstatistics.com/";
  })

  /*---------------------------------------------------------  resize event -----------------------------------------------*/
  $(window).bind('resize', function(e){
    window.resizeEvt;
    $(window).resize(function(){
        clearTimeout(window.resizeEvt);
        window.resizeEvt = setTimeout(function(){
          resize();
        }, 500);
    });
  });

  //helper function for testing
  function log(s) {
    console.log(s);
  }  

})

