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

      
  let margin = {top: 0, right: 10, bottom: 0, left: 10}; 
  let width;
  let height;               //the true width of the pdf display area in pixels
  let heightP;              //the true width of the pdf display area in pixels

  let x, y;                 //scale functions

  let svgP;                 //the svg reference to pdfdisplay


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

    //do this once?
    //set a reference to the displaypdf area
    d3.selectAll('svg > *').remove();  //remove all elements under svgP
    $('svg').remove();                 //remove the all svg elements from the DOM

    svgP = d3.select('#pdfdisplay').append('svg').attr('width', '100%').attr('height', '100%');
    
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
    setupPdfDisplay();
    topHorizonatlAxis();
    bottomHorizontalAxis();
    leftVerticalAxis();
  }

  function setupPdfDisplay() {
 
    scalePdfDrawing();
  }
  


  function scalePdfDrawing() {
    x = d3.scaleLinear().domain([-5, 5]).range([margin.left, width]);
    y = d3.scaleLinear().domain([0, 100]).range([heightP, 0]);
  }

  function topHorizonatlAxis() {

  }

  function bottomHorizontalAxis() {
    let xAxisB = d3.axisBottom(x);
    svgP.append('g').attr('class', 'axisxb').attr( 'transform', `translate(0, +20)` ).call(xAxisB);
  }

  function leftVerticalAxis() {

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

