/*
Program       esci-distributions.js
Author        Gordon Moore
Date          25 July 2020
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
  let tooltipson = false;                                   //toggle the tooltips on or off

  const pdfdisplay = document.querySelector('#pdfdisplay'); //display of pdf area


  let realHeight = 100;                                     //the real world height for the pdf display area
  let margin = {top: 0, right: 10, bottom: 0, left: 70};    //margins for pdf display area
  let width;
  let height;                                               //the true width of the pdf display area in pixels
  let heightP;                                               //the true width of the pdf display area in pixels

  let xt, xb, y;                                            //scale functions

  let svgTopAxis;                                           //svg reference to the top axis
  let svgBottomAxis;                                        //svg reference to the bottom axis
  let svgP;                                                 //the svg reference to pdfdisplay


  let mu, sigma, df;                                        //the population mean, standard deviation and degrees of freedom
  let zmu, zsd;                                             //parametrs of normal distribution

  let normalpdf = [];                                       //the array holding the normal distribution
  let tpdf = [];                                            //the array holding the student t distribution

  let functionHeight;                                       //get max height of pdf function
  let dfrom, dto;                                           //frequency density (height) on pdf

  let $zslider;                                              //reference to slider
  let zfrom, zto;                                            //the current from to values on the slider

  //cache jquery properties (faster)
  $mu    = $('#muval');
  $sigma = $('#sigmaval');

  const $leftnudgebackward  = $('#leftnudgebackward')
  const $leftnudgeforward  =  $('#leftnudgeforward');
  const $rightnudgebackward = $('#rightnudgebackward')
  const $rightnudgeforward =  $('#rightnudgeforward');

  //api for getting width, height of element - only gets element, not entire DOM
  // https://www.digitalocean.com/community/tutorials/js-resize-observer
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    });
  });

  //#endregion

  initialise();

  function initialise() {

    //initialvalues - pick these up from textboxes/sliders or dropdowns
    mu     = 100;
    sigma  = 15;

    zmu    = 0;
    zsd    = 1;
    df     = 1000;

    setupSliders()

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

    resize();

  }

  function setupSliders() {

    $('#muslider').ionRangeSlider({
      skin: 'big',
      type: 'single',
      min: 0,
      max: 200,
      from: mu,
      step: 1,
      grid: true,
      grid_num: 10,
      //on slider handles change
      onChange: function (data) {
        mu = data.from;
        $mu.val(mu);
        setTopAxis();
      }
    })

    $('#sigmaslider').ionRangeSlider({
      skin: 'big',
      type: 'single',
      min: 0,
      max: 100,
      from: sigma, 
      step: 1,
      grid: true,
      grid_num: 10,
      //on slider handles change
      onChange: function (data) {
        sigma = data.from;
        $sigma.val(sigma);
        setTopAxis();
      }
    })

    $('.js-range-slider').ionRangeSlider({
      skin: 'big',
      type: 'double',
      min: -5,
      max: 5,
      from: -5,
      to: 5,
      step: 0.01,
      grid: true,
      grid_num: 10,
      //on slider handles change
      onChange: function (data) {
        //want to refer to these values elsewhere
        zfrom = data.from;
        zto   = data.to;
        drawCriticalValueLines(zfrom, zto);
      }
    })

    //get reference to sliders
    $muslider    = $("#muslider").data("ionRangeSlider");
    $sigmaslider = $("#sigmaslider").data("ionRangeSlider");
    $zslider     = $(".js-range-slider").data("ionRangeSlider");

    $mu.val(mu);
    $sigma.val(sigma);
    zfrom = -5;
    zto = 5;
  }

  function drawCriticalValueLines(from, to) {
    removeCriticalTails()

    dfrom = scaleypdf(jStat.normal.pdf(from, zmu, zsd));
    dto =   scaleypdf(jStat.normal.pdf(to, zmu, zsd));

    svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(from)).attr('y1', y(0)).attr('x2', xb(from)).attr('y2', y(dfrom)).attr('stroke', 'black').attr('stroke-width', 2);
    svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(to)).attr('y1', y(0)).attr('x2', xb(to)).attr('y2', y(dto)).attr('stroke', 'black').attr('stroke-width', 2);

    arealefttail = d3.area()
      .x(function(d) { return xb(d.x) })
      .y1(y(0))
      .y0(function(d) { if (d.x < from) return y(d.y); else return y(0); });

    svgP.append('path').attr('class', 'criticalregionlefttail').attr('d', arealefttail(normalpdf));

    arearighttail = d3.area()
      .x(function(d) { return xb(d.x) })
      .y1(y(0))
      .y0(function(d) { if (d.x > to) return y(d.y); else return y(0); });      

    svgP.append('path').attr('class', 'criticalregionrighttail').attr('d', arearighttail(normalpdf));

    drawNormalPDF();
  }

  function removeCriticalTails() {
    svgP.selectAll('.criticalvalueline').remove();
    svgP.selectAll('.criticalregionlefttail').remove();
    svgP.selectAll('.criticalregionrighttail').remove();
  }

  //not used on resize
  function resetCriticalTails() {
    $zslider.update( {
      from: -5,
      to: 5
    })
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

    removeCriticalTails();
    //resetCriticalTails();
    removeNormalPDF();
    drawNormalPDF();
    drawCriticalValueLines(zfrom, zto)

  }

  function setupDisplay() {

    //the height is 0 - 100 in real world coords
    y = d3.scaleLinear().domain([0, realHeight]).range([heightP, 0]);

    setTopAxis();
    setBottomAxis();

  }
  
  function setTopAxis() {
    //clear axes
    d3.selectAll('.topaxis').remove();
    
    let left  = mu-5*sigma
    let right = mu+5*sigma

    xt = d3.scaleLinear().domain([left, right]).range([margin.left, width]);

    //top horizontal axis
    let xAxisA = d3.axisTop(xt);
    svgTopAxis.append('g').attr('class', 'topaxis').attr( 'transform', 'translate(0, 40)' ).call(xAxisA);
    
  }

  function setBottomAxis() {
    //the width is either -5 to +5 or 25 to 175 etc in real world coords
    //clear axes
    d3.selectAll('.bottomaxis').remove();
    xb = d3.scaleLinear().domain([-5, 5]).range([margin.left, width]);

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
    functionHeight = d3.max(normalpdf, function(d) { return d.y});
    normalpdf.forEach(function(v) {
      v.y = scaleypdf(v.y);
    })

  }

  function scaleypdf(y) {
    return y * realHeight / functionHeight * 0.9 + 0.2;
  }

  function drawNormalPDF() {
    removeNormalPDF();
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


  //for some very weird reason the event was triggering three times!!!  https://stackoverflow.com/questions/14969960/jquery-click-events-firing-multiple-times 
  $leftnudgebackward.on('click', function(e) {
    if (zfrom > -5) zfrom -= 0.01;
    $zslider.update( { from: zfrom, })
    drawCriticalValueLines(zfrom, zto);
  })

  $leftnudgeforward.on('click', function(e) {
    if (zfrom < 5) zfrom += 0.01;
    $zslider.update( { from: zfrom, })
    drawCriticalValueLines(zfrom, zto);
  })

  $rightnudgebackward.on('click', function(e) {
    if (zto > -5) zto -= 0.01;
    $zslider.update( { to: zto, })
    drawCriticalValueLines(zfrom, zto);
  })

  $rightnudgeforward.on('click', function(e) {
    if (zto < 5) zto += 0.01;
    $zslider.update( { to: zto, })
    drawCriticalValueLines(zfrom, zto);
  })

  //change to the mu, sigma checkboxes
  $mu.on('change', function() {
    mu = parseFloat($mu.val());
    $muslider.update({
      from: mu
    })
    setTopAxis();
  })

  $sigma.on('change', function() {
    sigma = parseFloat($sigma.val());
    $sigmaslider.update({
      from: sigma
    })
    setTopAxis();
  })

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
  function lg(s) {
    console.log(s);
  }  

})

