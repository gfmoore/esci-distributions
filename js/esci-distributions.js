/*
Program       esci-distributions.js
Author        Gordon Moore
Date          21 July 2020
Description   The JavaScript code for esci-distributions
Licence       GNU General Public LIcence Version 3, 29 June 2007
*/

// #region Version history
/*
0.0.1   Initial version
0.1.0   2020-07-25 The first version
0.1.1   2020-07-31  #2 Italics for Roman variable names
0.1.2   2020-07-31  #3 Remove leading zeros
0.1.3   2020-07-31  Allow links to local libraries rather than cdn to allow portability
0.1.4   2020-07-31  #9 Bottom footer link text changed to match with dances
0.1.5   2020-07-31  #4 Extend "cursors" to X axis.
0.1.6   2020-08-01  #3 no leading zeros on t, #5 tick marks on axes, fix vertical rescale bug
0.1.7   2020-08-01  #6 two tail sum of tails probability displayed
0.1.8   2020-08-01  #14 clear on tab change + tidy up code + #6 refix two tail sum + not allow area if no tails
0.1.9   2020-08-01  #8 Centre probability box between two critical lines + Adjusted key caption position for z and t
0.1.10  2020-08-01  #7 Draw X values on critical lines     
0.1.11  2020-08-01  #10 Automatic nudge on mousedown 
0.1.12  2020-08-01  #11 DF slider and textbox fixes     
0.1.13  2020-08-02  #7 Adjust position of X values 
0.1.14  2020-08-02  #10 Enhanced auto nudge to allow delay
0.1.15  2020-08-02  #11, #12 fixes to sliders 
0.1.16  2020-08-03  #6 More tweaks to probabilities and how they are displayed.     
0.1.17  2020-08-03  #18 Palegreen background for panel 4
0.1.18  2020-08-03  #15 Park handle/cursor at left for one tail
0.1.19  2020-08-03  #18 Lighter green for panel 4
0.1.20  2020-08-03  #16 Fix snapping problem, but not synchronous move of handles.
0.1.21  2020-08-03  #16 Added a fix to stop overlaps. Well the cursors can overlap but on release they snap to 0
0.1.22  2020-08-04  #12 Put limits on sliders and textboxes
0.1.23  2020-08-05  #16 Replaced ionslider for z slider with jquery-ui and slider-pips libraries
0.1.24  2020-08-07  #13 Added tooltips
0.1.25  2020-08-07  #16 Had to get down and dirty to get values properly. As someone said: "the documentation is wrong!!"
0.1.26  2020-08-07  #16 Some more tweaking to slider appearance
0.1.27  2020-08-07  #20 Implement breadcrumbs menu
0.1.28  2020-08-08  #13 Italicise X, z t in tooltips
*/
//#endregion 

let version = '0.1.28';

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  //#region for variable definitions (just allows code folding)
  let tooltipson              = false;                                        //toggle the tooltips on or off

  let tab                     = 'Normal';                                     //what tab?

  const pdfdisplay            = document.querySelector('#pdfdisplay');        //display of pdf area

  let realHeight              = 100;                                          //the real world height for the pdf display area
  let margin                  = {top: 0, right: 10, bottom: 0, left: 70};     //margins for pdf display area
  let width;                                                                  //the true width of the pdf display area in pixels
  let heightP;   
  let rwidth;                                                                 //the width returned by resize
  let rheight;                                                                //the height returned by resize
  let xt, xb, y;                                                              //scale functions

  let svgTopAxis;                                                             //svg reference to the top axis
  let svgBottomAxis;                                                          //svg reference to the bottom axis
  let svgP;                                                                   //the svg reference to pdfdisplay

  let mu                      = 100;
  let sigma                   = 15;                                          //the population mean, standard deviation and degrees of freedom
  let zmu                     = 0;                                           //parameters of normal distribution
  let zsd                     = 1;                                           
  let df                      = 10;                                          //degrees of freedom

  const $mu                   = $('#muval');
  const $sigma                = $('#sigmaval');
  const $df                   = $('#dfval');

  //normal tails
  const $notails              = $('#notails');
  const $onetail              = $('#onetail');
  const $twotails             = $('#twotails');

  let notails                 = true;
  let onetail                 = false;
  let twotails                = false;  

  const $showarea             = $('#showarea');
  let showarea                = false;
  
  //student t tails
  const $tnotails             = $('#tnotails');
  const $tonetail             = $('#tonetail');
  const $ttwotails            = $('#ttwotails');

  //use notails, onetail and twotails for same functionality
  let tnotails;
  let tonetail;  
  let ttwotails;

  const $tshowarea            = $('#tshowarea');
  let tshowarea;

  const $showxaxis            = $('#showxaxis');
  let showxaxis               = false;

  const $units                = $('#units');
  let units                   = 'IQ Points';
  $units.val(units);

  const $showmuline           = $('#showmuline');
  let showmuline              = false;
  const $showzline            = $('#showzline');
  let showzline               = false;

  const $tshowmuline          = $('#tshowmuline');
  let tshowmuline             = false;
  const $tshowtzline          = $('#tshowtzline');
  let tshowtzline             = false;

  const $z                    = $('#z');
  let   z                     = true;
  const $t                    = $('#t');
  let   t                     = false;
  const $zandt                = $('#zandt');
  let   zandt                 = false;


  let normalpdf               = [];                                           //the array holding the normal distribution
  let tpdf                    = [];                                           //the array holding the student t distribution
  let functionHeight;                                                         //get max height of pdf function
  let tfunctionHeight;
                  
  const $zslider              = $('#zslider');                                //reference to slider
  let zfrom, zto;                                                             //the current from to values on the slider
  let oldzfrom, oldzto;                                                       //remember old (previous) values to determine whcih slider changed

  let pfromlt;
  let pfromgt;
  let ptolt;
  let ptogt;
  let mid;
  let twotailtotal;

  const $fromnudgebackward    = $('#fromnudgebackward')
  const $fromnudgeforward     = $('#fromnudgeforward');
  const $tonudgebackward      = $('#tonudgebackward')
  const $tonudgeforward       = $('#tonudgeforward');

  const $munudgebackward      = $('#munudgebackward'); 
  const $munudgeforward       = $('#munudgeforward'); 
  const $sigmanudgebackward   = $('#sigmanudgebackward'); 
  const $sigmanudgeforward    = $('#sigmanudgeforward'); 

  const $dfnudgebackward      = $('#dfnudgebackward'); 
  const $dfnudgeforward       = $('#dfnudgeforward'); 

  //api for getting width, height of element - only gets element, not entire DOM
  // https://www.digitalocean.com/community/tutorials/js-resize-observer
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      rwidth = entry.contentRect.width;
      //rHeight = entry.contentRect.height;  //doesn't work
      rheight = $('#pdfdisplay').outerHeight(true);
    });
  });

  let pause = 500;
  let delay = 50;
  let repeatId;
  let pauseId;

  let frommoved = false;
  let tomoved   = false;


  //#endregion

  //breadcrumbs
  $('#homecrumb').on('click', function() {
    window.location.href = "https://www.esci.thenewstatistics.com/";
  })

  initialise();

  function initialise() {
    
    //tabs
    $('#smarttab').smartTab({
      selected: 0, // Initial selected tab, 0 = first tab
      theme: 'round', // theme for the tab, related css need to include for other than default theme
      orientation: 'horizontal', // Nav menu orientation. horizontal/vertical
      justified: true, // Nav menu justification. true/false
      autoAdjustHeight: true, // Automatically adjust content height
      backButtonSupport: true, // Enable the back button support
      enableURLhash: true, // Enable selection of the tab based on url hash
      transition: {
          animation: 'slide-horizontal', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
          speed: '400', // Transion animation speed
          easing:'' // Transition animation easing. Not supported without a jQuery easing plugin
      },
      autoProgress: { // Auto navigate tabs on interval
          enabled: false, // Enable/Disable Auto navigation
          interval: 3500, // Auto navigate Interval (used only if "autoProgress" is set to true)
          stopOnFocus: true, // Stop auto navigation on focus and resume on outfocus
      },
      keyboardSettings: {
          keyNavigation: true, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
          keyLeft: [37], // Left key code
          keyRight: [39] // Right key code
      }
    });

    //goto Normal tab
    $('#smarttab').smartTab("goToTab", 0);
    

    setupSliders()

    setTooltips();

    //get initial values for height/width
    rwidth  = $('#pdfdisplay').outerWidth(true);
    rheight = $('#pdfdisplay').outerHeight(true);

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
      grid_num: 4,
      prettify: prettify0,
      //on slider handles change
      onChange: function (data) {
        mu = data.from;
        $mu.val(mu);
        setTopAxis();
        drawCriticalTails();
      }
    })

    $('#sigmaslider').ionRangeSlider({
      skin: 'big',
      type: 'single',
      min: 0,
      max: 50,
      from: sigma, 
      step: 1,
      grid: true,
      grid_num: 5,
      prettify: prettify0,
      //on slider handles change
      onChange: function (data) {
        sigma = data.from;
        if (sigma < 1) {
          sigma = 1;
          $sigmaslider.update({ from: sigma });
        }
        $sigma.val(sigma);
        setTopAxis();
        drawCriticalTails();
      }
    })

    $('#dfslider').ionRangeSlider({
      skin: 'big',
      type: 'single',
      min: 0,
      max: 100,
      from: df,
      step: 1,
      grid: true,
      grid_num: 5,
      prettify: prettify0,
      //on slider handles change
      onChange: function (data) {
        df = data.from;
        if (df < 1) {
          df = 1;
          $dfslider.update({ from: df });
        }
        $df.val(df);
        createT();
        drawTPDF();
        drawCriticalTails();
      }
    })

    function prettify0(num) {
      return num.toFixed(0);
    }

    function prettify3(num) {
      return num.toFixed(3);
    }

    //get reference to sliders
    $muslider    = $("#muslider").data("ionRangeSlider");
    $sigmaslider = $("#sigmaslider").data("ionRangeSlider");
    $dfslider    = $("#dfslider").data("ionRangeSlider");
    
    $mu.val(mu);
    $sigma.val(sigma);

    $dfslider.update({ from: df });
    $df.val(df);

  }

  /*-------------Replacement zslider uses jquery.ui and jqueryui-slider-pips library----------------*/
    
  function setupzSlider() {
    //jQueryUI slider
    $zslider.slider({
      animate: 'fast',
      min: -5,
      max: 5,
      range: true,
      values: [ -5, 5 ],
      step: 0.001,

      slide: function(e, ui) {
        zfrom = ui.values[0];
        zto   = ui.values[1];
   
        if (notails || onetail) {
          //do nothing
        }
    
        if (twotails) {
          //don't allow to cross
          if (zfrom > 0 || zto < 0) {
            zfrom = 0;
            zto = 0;
          }

          //need to determine if from or to slider moved?
          if (zfrom !== oldzfrom) {
            frommoved = true;
            oldzfrom = zfrom;
          }
          else {
            frommoved = false;
          }
          if (zto !== oldzto) {
            tomoved = true;
            oldzto = zto;
          }
          else {
            tomoved = false;
          }
          if (frommoved) zto   = -zfrom;
          if (tomoved)   zfrom = -zto;
        }

        setzSliders();
      },

      change: function( event, ui ) {
  
      },

      stop: function( event, ui ) {
        setzSliders();
      }
    });

    //jQuery-ui-Slider-Pips
    let zslider = $zslider.slider( 'instance' );
    $zslider.slider().slider('pips', {
      first: 'label',
      pips: true,
      last: 'label',
      rest: 'label',
      step: 100
    }).slider('float', {
      handle: true,
      pips: false
    })

    zfrom = -5.000;
    zto = 5.000;
    oldzfrom = -5.000;
    oldzto   = 5.000;
  }

  function setzSliders() {
    oldzfrom = zfrom;
    oldzto   = zto;
    if (twotails) {
      $('.ui-slider-tip').parent().children().first().text(zfrom);  //fix for display as move
      $('.ui-slider-tip').parent().children().last().text(zto);     //fix for display as move    
    }
    $zslider.slider( "values", [ zfrom, zto ] );

    //see if I can directly change the visual label

    drawCriticalTails();
  }

  function resize() {
    //have to watch out as the width and height do not always seem precise to pixels
    //browsers apparently do not expose true element width, height.
    //also have to think about box model. outerwidth(true) gets full width, not sure resizeObserver does.
    resizeObserver.observe(pdfdisplay);  //note doesn't get true outer width, height

    width   = rwidth - margin.left - margin.right;  
    heightP = rheight - margin.top - margin.bottom;

    //clear(); - clear removes too much
    removemuline();
    removezlines();
    removeCriticalTails();

    removeNormalPDF();  //not sure I need to do this as draNormal does it as well?
    removeTPDF();

    setupAxes();
    //if (showxaxis)  setTopAxis();  //setupAxes should do this

    if (tab === 'Normal')   drawNormalPDF();
    if (tab === 'Studentt') drawTPDF();
    
    if (showmuline) drawmuline();
    if (showzline)  drawzlines();

    drawCriticalTails();
  }

  //change tabs
  $("#smarttab").on("showTab", function(e, anchorObject, tabIndex) {
    if (tabIndex === 0) tab = 'Normal';
    if (tabIndex === 1) tab = 'Studentt';

    clear();
  });

  //set everything to a default state.
  function clear() {
    
    //tab Normal
    $notails.prop('checked', true);
    notails = true;
    $onetail.prop('checked', false);
    onetail = false;
    $twotails.prop('checked', false);
    twotails = false;

    $showarea.prop('checked', false);
    showarea = false;

    $showmuline.prop('checked', false);
    showmuline = false;
    $showzline.prop('checked', false);
    showzline = false;

    $showxaxis.prop('checked', false);
    showxaxis = false

    mu     = 100;
    $muslider.update({ from: mu });
    $mu.val(mu);

    sigma  = 15;
    $sigmaslider.update({ from: sigma });
    $sigma.val(sigma);


    //tab Student t
    $z.prop('checked', true);
    z = true;
    $t.prop('checked', false);
    t = false;
    $zandt.prop('checked', false);
    zandt = false;

    df = 10;
    $dfslider.update({ from: df });
    $df.val(df);


    $tshowmuline.prop('checked', false);
    tshowmuline = false;
    $tshowtzline.prop('checked', false);
    tshowtzline = false;

    $tnotails.prop('checked', true);
    notails = true;
    $tonetail.prop('checked', false);
    onetail = false;
    $ttwotails.prop('checked', false);
    twotails = false;

    $tshowarea.prop('checked', false);
    tshowarea = false;


    //now default the display
    zfrom = -5;
    zto = 5;
    //$zslider.update( { from: zfrom, to: zto } );
    setupzSlider();

    removemuline();
    removezlines();
    removeCriticalTails();

    removeNormalPDF();  //not sure I need to do this as draNormal does it as well?
    removeTPDF();

    setupAxes();  //removes and resets axes

    createNormal();
    createT();

    if (tab === 'Normal')   drawNormalPDF();
    if (tab === 'Studentt') drawTPDF();
    
    //#region TESTING -------------------------------------------------------------------
    // $notails.prop('checked', false);
    // notails = false;
    // $onetail.prop('checked', true);
    // onetail = true;
    // $twotails.prop('checked', true);
    // twotails = true;

    // $showarea.prop('checked', true);
    // showarea = true;
    //#endregion

    drawCriticalTails();
  }

  /*-------------------------------------------Set up axes---------------------------------------------*/


  function setupAxes() {
    //the height is 0 - 100 in real world coords   I'm not sure resize is working for rheight
    heightP = $('#pdfdisplay').outerHeight(true) - margin.top - margin.bottom;
    y = d3.scaleLinear().domain([0, realHeight]).range([heightP, 0]);

    setTopAxis();
    setBottomAxis();
  }
  
  function setTopAxis() {
    //clear axes
    d3.selectAll('.topaxis').remove();
    d3.selectAll('.topaxisminorticks').remove();
    d3.selectAll('.topaxistext').remove();
    d3.selectAll('.topaxisunits').remove();

    if (showxaxis) {
      width   = rwidth - margin.left - margin.right;  
      
      let left  = mu-5*sigma
      let right = mu+5*sigma

      xt = d3.scaleLinear().domain([left, right]).range([margin.left-2, width+4]);

      //top horizontal axis
      let xAxisA = d3.axisTop(xt).tickSizeOuter(0);  //tickSizeOuter gets rid of the start and end ticks
      svgTopAxis.append('g').attr('class', 'topaxis').style("font", "1.8rem sans-serif").attr( 'transform', 'translate(0, 42)' ).call(xAxisA);

      //add some text labels
      svgTopAxis.append('text').text('X').style('font-style', 'italic').attr('class', 'topaxistext').attr('x', width/2 - 20).attr('y', 16).attr('text-anchor', 'start').attr('fill', 'black');
      svgTopAxis.append('text').text(units).attr('class', 'topaxisunits').attr('x', width/2 - 70).attr('y', 70).attr('text-anchor', 'start').attr('fill', 'black');

      //add additional ticks
      //the minor ticks
      let interval = d3.ticks(left-sigma, right+sigma, 10);  //gets an array of where it is putting tick marks

      let minortick;
      let minortickmark;
      for (let i=0; i < interval.length; i += 1) {
        minortick = (interval[i] - interval[i-1]) / 10;
        for (let ticks = 1; ticks <= 10; ticks += 1) {
          minortickmark = interval[i-1] + (minortick * ticks);
          if (minortickmark > left && minortickmark < right) svgTopAxis.append('line').attr('class', 'topaxisminorticks').attr('x1', xt(minortickmark)).attr('y1', 40).attr('x2', xt(minortickmark) ).attr('y2', 35).attr('stroke', 'black').attr('stroke-width', 1);
        }
      }

      //make larger middle tick
      let middle;
      for (let i = 0; i < interval.length; i += 1) {
        middle = (interval[i] + interval[i-1]) / 2;
        svgTopAxis.append('line').attr('class', 'topaxisminorticks').attr('x1', xt(middle)).attr('y1', 40).attr('x2', xt(middle) ).attr('y2', 30).attr('stroke', 'black').attr('stroke-width', 1);
      }
    }
  }

  function setBottomAxis() {
    
    //the width is either -5 to +5 or 25 to 175 etc in real world coords
    //clear axes
    d3.selectAll('.bottomaxis').remove();
    d3.selectAll('.bottomaxisminorticks').remove();
    d3.selectAll('.bottomaxistext').remove();

    xb = d3.scaleLinear().domain([-5.000, 5.000]).range([margin.left-2, width+4]);

    //bottom horizontal axis
    let xAxisB = d3.axisBottom(xb); //.ticks(20); //.tickValues([]);
    svgBottomAxis.append('g').attr('class', 'bottomaxis').style("font", "1.8rem sans-serif").attr( 'transform', 'translate(0, 0)' ).call(xAxisB);

    //add some text labels
    if (tab === 'Normal')   svgBottomAxis.append('text').text('z').attr('class', 'bottomaxistext').attr('x', width/2 + 100).attr('y', 40).attr('text-anchor', 'start').attr('fill', 'black');
    if (tab === 'Studentt') svgBottomAxis.append('text').text('z or t').attr('class', 'bottomaxistext').attr('x', width/2 + 100).attr('y', 40).attr('text-anchor', 'start').attr('fill', 'black');

  //add additional ticks
    //the minor ticks
    let interval = d3.ticks(-5, 5, 10);  //gets an array of where it is putting tick marks

    let minortick;
    let minortickmark;
    for (let i=0; i < interval.length; i += 1) {
      minortick = (interval[i] - interval[i-1]) / 10;
      for (let ticks = 1; ticks <= 10; ticks += 1) {
        minortickmark = interval[i-1] + (minortick * ticks);
        if (minortickmark > -5 && minortickmark < 5) svgBottomAxis.append('line').attr('class', 'bottomaxisminorticks').attr('x1', xb(minortickmark)).attr('y1', 0).attr('x2', xb(minortickmark) ).attr('y2', 5).attr('stroke', 'black').attr('stroke-width', 1);
      }
    }

    //make larger middle tick
    let middle;
    for (let i = 0; i < interval.length; i += 1) {
      middle = (interval[i] + interval[i-1]) / 2;
      svgBottomAxis.append('line').attr('class', 'bottomaxisminorticks').attr('x1', xb(middle)).attr('y1', 0).attr('x2', xb(middle) ).attr('y2', 10).attr('stroke', 'black').attr('stroke-width', 1);
    }

  }

  /*------------------------------------do distributions------------------------------------*/

  function createNormal() {
    normalpdf = [];

    for (let x = -5.000; x <= 5.000; x += 0.005) {
      normalpdf.push({ x: x, y: jStat.normal.pdf(x, zmu, zsd) })
    }

    //scale it to fit in with drawing area
    normalpdf.forEach(function(v) {
      v.y = scaleypdf(v.y);
    })
  }

  function scaleypdf(y) {
    return y * 250;
  }

  function drawNormalPDF() {
    removeNormalPDF();
    //create a generator
    line = d3.line()
      .x(function(d, i) { return xb(d.x); })
      .y(function(d, i) { return y(d.y); });

    //display the curve
    svgP.append('path').attr('class', 'normalpdf').attr('d', line(normalpdf)).attr('stroke', 'blue').attr('stroke-width', 3).attr('fill', 'none');

  }

  function removeNormalPDF() {
    d3.selectAll('.normalpdf').remove();
  }

  function createT() {
    createNormal();  //just in case not done so

    tpdf = [];

    for (let x = -5.000; x < 5.000; x += 0.005) {
      tpdf.push({ x: x, y: jStat.studentt.pdf(x, df) })
    }

    //scale it to fit in with drawing area
    //tfunctionHeight = d3.max(tpdf, function(d) { return d.y});
    tpdf.forEach(function(v) {
      v.y = tscaleypdf(v.y);
    })
  }

  function tscaleypdf(y) {
    return y * 250;
  }

  function drawTPDF() {
    removeTPDF();
    removeNormalPDF();

    //create a generator
    line = d3.line()
      .x(function(d, i) { return xb(d.x); })
      .y(function(d, i) { return y(d.y); });

    //display the curves
    if (t || zandt) svgP.append('path').attr('class', 'tpdf').attr('d', line(tpdf)).attr('stroke', 'red').attr('fill', 'none').attr('stroke-width', 3)
    if (z || zandt) svgP.append('path').attr('class', 'tpdf').attr('d', line(normalpdf)).attr('stroke', 'blue').attr('fill', 'none').attr('stroke-width', 3)

    //add some labels to graph
    if (z || zandt) {
      svgP.append('line').attr('class', 'tpdf').attr('x1', 80).attr('y1', 30).attr('x2', 110).attr('y2', 30).attr('stroke', 'blue' ).attr('stroke-width', 3);
      svgP.append('text').text('Normal').attr('class', 'tpdf').attr('x',120 ).attr('y', 33 ).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
    }
    if (t || zandt) {
      svgP.append('line').attr('class', 'tpdf').attr('x1', 80).attr('y1', 60).attr('x2', 110).attr('y2', 60).attr('stroke', 'red' ).attr('stroke-width', 3);
      svgP.append('text').text('t').attr('class', 'tpdf').attr('x',120 ).attr('y', 63 ).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").style('font-style', 'italic').attr('fill', 'black');
    }
  }

  function removeTPDF() {
    d3.selectAll('.tpdf').remove();
  }


  /*-------------------------------------tails control---------------------------------------*/


  $("input[name='tails']").change(function() {
    notails  = $notails.prop('checked');
    onetail  = $onetail.prop('checked');
    twotails = $twotails.prop('checked'); 
    if (notails) {
      $showarea.prop('checked', false);
      showarea = false;
    }
    if (onetail) {
      //Park left handle to -5
      zfrom = -5;
      setzSliders();
    }
    if (twotails) {
      zfrom = -zto; //had to choose one side
      setzSliders();
    }
    drawCriticalTails();   
  })

  $showarea.on('change', function() {
    showarea = $showarea.prop('checked');
    if (notails) {
      $showarea.prop('checked', false);
      showarea = false;
    }
    
    drawCriticalTails();
  })

  $("input[name='ttails']").change(function() {
    notails  = $tnotails.prop('checked');
    onetail  = $tonetail.prop('checked');
    twotails = $ttwotails.prop('checked'); 
    if (notails) {
      $tshowarea.prop('checked', false);
      showarea = false;
    }
    if (onetail) {
      //Park left handle to -5
      zfrom = -5;
      oldzfrom = -5
      setzSliders();
    }
    if (twotails) {
      zfrom = -zto; //had to choose one side
      setzSliders();
    }
    drawCriticalTails();   
  })

  $tshowarea.on('change', function() {
    showarea = $tshowarea.prop('checked');
    if (notails) {
      $tshowarea.prop('checked', false);
      showarea = false;
    }

    drawCriticalTails();
  })


  /*-----------------------------------draw the critical value areas and values-------------------------*/
 
  function drawCriticalTails() {

    //get the X values
    let leftX, rightX;


    removeCriticalTails();

    if (!notails) {

      if (onetail || twotails) {
        //normal  //I think I can use this in "normal" and "normal and t"
        dfrom = scaleypdf(jStat.normal.pdf(zfrom, zmu, zsd));
        dto =   scaleypdf(jStat.normal.pdf(zto, zmu, zsd));

        //student t
        dtfrom = tscaleypdf(jStat.studentt.pdf(zfrom, df));
        dtto =   tscaleypdf(jStat.studentt.pdf(zto, df));

        //fill the critical regions first
        arealefttail = d3.area()
          .x(function(d) { return xb(d.x) })
          .y1(y(0))
          .y0(function(d) { if (d.x < zfrom) return y(d.y); else return y(0); });

        arearighttail = d3.area()
          .x(function(d) { return xb(d.x) })
          .y1(y(0))
          .y0(function(d) { if (d.x > zto) return y(d.y); else return y(0); });      

        if (tab === 'Normal') {
          svgP.append('path').attr('class', 'criticalregionlefttail').attr('d', arealefttail(normalpdf)).attr('fill', 'lightsteelblue');
          svgP.append('path').attr('class', 'criticalregionrighttail').attr('d', arearighttail(normalpdf)).attr('fill', 'lightsteelblue');
        }

        if (tab === 'Studentt') {
          if (z) {
            svgP.append('path').attr('class', 'criticalregionlefttail').attr('d', arealefttail(normalpdf)).attr('fill', 'lightsteelblue');
            svgP.append('path').attr('class', 'criticalregionrighttail').attr('d', arearighttail(normalpdf)).attr('fill', 'lightsteelblue');  
          }
          if (t || zandt) {
            svgP.append('path').attr('class', 'criticalregionlefttail').attr('d', arealefttail(tpdf)).attr('fill', 'pink');
            svgP.append('path').attr('class', 'criticalregionrighttail').attr('d', arearighttail(tpdf)).attr('fill', 'pink');  
          }
        }

        //now draw the critical lines
        if (tab === 'Normal') {
          svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zfrom)).attr('y1', y(0)).attr('x2', xb(zfrom)).attr('y2', y(realHeight /*dfrom*/)).attr('stroke', 'black').attr('stroke-width', 2);
          //and extend to X axis
          svgTopAxis.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zfrom)).attr('y1', 40).attr('x2', xb(zfrom)).attr('y2', 80).attr('stroke', 'black').attr('stroke-width', 2);

          //label of left X value
          if (showxaxis) {
            leftX = (mu + zfrom*sigma).toFixed(1);
            //create a white borderless rectangle behind so as to cut out that part of the critical line
            //svgP.append('rect').attr('class', 'criticalvalueline').attr('x', xb(zfrom) - 30 ).attr('y', 0).attr('width', 80).attr('height', 20).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            svgP.append('text').text('X=').attr('class', 'criticalvalueline').attr('x', xb(zfrom) - 66).attr('y', 25).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").style('font-style', 'italic').attr('fill', 'black');
            svgP.append('text').text(leftX).attr('class', 'criticalvalueline').attr('x', xb(zfrom) - 45).attr('y', 25).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
          }

          svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zto)).attr('y1', y(0)).attr('x2', xb(zto)).attr('y2', y(realHeight /*dto*/)).attr('stroke', 'black').attr('stroke-width', 2);
          //and extend to X axis
          svgTopAxis.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zto)).attr('y1', 40).attr('x2', xb(zto)).attr('y2', 80).attr('stroke', 'black').attr('stroke-width', 2);

          //label of right  X value
          if (showxaxis) {
            rightX = (mu + zto*sigma).toFixed(1);
            //svgP.append('rect').attr('class', 'criticalvalueline').attr('x', xb(zto) - 30 ).attr('y', 0).attr('width', 80).attr('height', 20).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            if (showxaxis) svgP.append('text').text('X=').attr('class', 'criticalvalueline').attr('x', xb(zto) + 3).attr('y', 25).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").style('font-style', 'italic').attr('fill', 'black');
            if (showxaxis) svgP.append('text').text(rightX).attr('class', 'criticalvalueline').attr('x', xb(zto) + 25).attr('y', 25).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
          }
        }

        //student-t tab
        if (tab === 'Studentt') {
          if (z) {
            svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zfrom)).attr('y1', y(0)).attr('x2', xb(zfrom)).attr('y2', y(realHeight /*dfrom*/)).attr('stroke', 'blue').attr('stroke-width', 2);
            svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zto)).attr('y1', y(0)).attr('x2', xb(zto)).attr('y2', y(realHeight /*dto*/)).attr('stroke', 'blue').attr('stroke-width', 2);
          }
          if (t || zandt) {
            svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zfrom)).attr('y1', y(0)).attr('x2', xb(zfrom)).attr('y2', y(realHeight /*dtfrom*/)).attr('stroke', 'red').attr('stroke-width', 2);
            svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zto)).attr('y1', y(0)).attr('x2', xb(zto)).attr('y2', y(realHeight /*dtto*/)).attr('stroke', 'red').attr('stroke-width', 2);
          }
        }

        //redraw the curves over the area and lines for appearance sake
        if (tab === 'Normal') drawNormalPDF();
        if (tab === 'Studentt') drawTPDF();

        if (tab === 'Normal') {
          drawmuline();
          drawzlines()
        }
        if (tab === 'Studentt') {
          drawmuline();
          drawzlines();
        }

        //Areas - Now display some values
        if (showarea) {
          if (tab === 'Normal' || (tab === 'Studentt' && z)) {
            pfromlt = jStat.normal.cdf(zfrom, zmu, zsd); //prob from slider less than
            pfromgt = 1 - pfromlt;                       //prob from slider less than   
            ptolt   = jStat.normal.cdf(zto, zmu, zsd);   //prob to slider less than
            ptogt   = 1 - ptolt;                         //prob to slider greater than

            mid = Math.abs((1 - ptolt - pfromgt));
            
            //twotailtotal = pfromlt + ptogt  //sum of displayed probabilities

            pfromlt = pfromlt.toFixed(4).toString().replace('0.', '.');
            pfromgt = pfromgt.toFixed(4).toString().replace('0.', '.');
            ptolt   = ptolt.toFixed(4).toString().replace('0.', '.');
            ptogt   = ptogt.toFixed(4).toString().replace('0.', '.');
            mid     = mid.toFixed(4).toString().replace('0.', '.');
            
            twotailtotal = parseFloat(ptogt) * 2;
            twotailtotal = twotailtotal.toFixed(4).toString().replace('0.', '.');

            //add a background rectangle to get background colour for text

            //left box
            svgP.append('rect').attr('class', 'probability').attr('x',xb(zfrom) - 62 ).attr('y', rheight - 50).attr('width', 58).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            svgP.append('text').text(pfromlt).attr('class', 'probability').attr('x', xb(zfrom) - 58).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'blue');

            //middle box
            svgP.append('rect').attr('class', 'probability').attr('x', xb((zfrom+zto)/2) - 30 ).attr('y', rheight - 80).attr('width', 68).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            svgP.append('text').text(mid).attr('class',   'probability').attr('x', xb((zfrom+zto)/2) -25 ).attr('y', rheight - 60).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'black');

            //right box
            svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 50).attr('width', 58).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            svgP.append('text').text(ptogt).attr('class',   'probability').attr('x', xb(zto) + 10).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'blue');

            //above right box
            if (twotails) {
              svgP.append('text').text('two tails').attr('class',   'probability').attr('x', xb(zto) + 12).attr('y', rheight - 115).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'blue');
              svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 110).attr('width', 58).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
              svgP.append('text').text(twotailtotal).attr('class',   'probability').attr('x', xb(zto) + 10).attr('y', rheight - 90).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'blue');
            }
          }

          if (tab === 'Studentt' && (t || zandt)) {
            pfromlt = jStat.studentt.cdf(zfrom, df); //prob from slider less than
            pfromgt = 1 - pfromlt;                       //prob from slider less than   
            ptolt   = jStat.studentt.cdf(zto, df);   //prob to slider less than
            ptogt   = 1 - ptolt;                         //prob to slider greater than
            mid = Math.abs((1 - ptolt - pfromgt));
            
            //twotailtotal = pfromlt + ptogt //sum of displayed probabilities

            pfromlt = pfromlt.toFixed(4).toString().replace('0.', '.');
            pfromgt = pfromgt.toFixed(4).toString().replace('0.', '.');
            ptolt   = ptolt.toFixed(4).toString().replace('0.', '.');
            ptogt   = ptogt.toFixed(4).toString().replace('0.', '.');
            mid     = mid.toFixed(4).toString().replace('0.', '.');

            twotailtotal = parseFloat(ptogt) * 2;
            twotailtotal = twotailtotal.toFixed(4).toString().replace('0.', '.'); 

            //add a background rectangle to get background colour for text
            //left box
            svgP.append('rect').attr('class', 'probability').attr('x',xb(zfrom) - 62 ).attr('y', rheight - 50).attr('width', 58).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            svgP.append('text').text(pfromlt).attr('class', 'probability').attr('x', xb(zfrom) - 58).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'red');

            //middle box
            svgP.append('rect').attr('class', 'probability').attr('x', xb((zfrom+zto)/2) - 30 ).attr('y', rheight - 80).attr('width', 68).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            svgP.append('text').text(mid).attr('class',   'probability').attr('x', xb((zfrom+zto)/2) - 25).attr('y', rheight - 60).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'black');

            //right box
            svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 50).attr('width', 58).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
            svgP.append('text').text(ptogt).attr('class',   'probability').attr('x', xb(zto) + 10).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'red');

            //above right box
            if (twotails) {
              svgP.append('text').text('two tails').attr('class',   'probability').attr('x', xb(zto) + 12).attr('y', rheight - 115).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'red');
              svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 110).attr('width', 58).attr('height', 27).attr('fill', 'white').attr('stroke', 'none').attr('stroke-width', 1);
              svgP.append('text').text(twotailtotal).attr('class',   'probability').attr('x', xb(zto) + 15).attr('y', rheight - 90).attr('text-anchor', 'start').style("font", "1.7rem sans-serif").attr('fill', 'red');

            }

          }

        }

      }
    }

  }

  function removeCriticalTails() {
    svgP.selectAll('.criticalvalueline').remove();
    svgTopAxis.selectAll('.criticalvalueline').remove();

    svgP.selectAll('.criticalregionlefttail').remove();
    svgP.selectAll('.criticalregionrighttail').remove();
    svgP.selectAll('.probability').remove();
  }

  /*----------------------------------------------Slider panel-------------------------------------*/

  //from nudge backwards
  $fromnudgebackward.on('mousedown', function() {
    fromnudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        fromnudgebackward();
      }, delay );
    }, pause)  
  })

  $fromnudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function fromnudgebackward() {
    zfrom -= 0.001;
    if (zfrom < -5) zfrom = -5;
    if (twotails) zto = -zfrom;
    setzSliders();
    drawCriticalTails();
  }
  
  //from nudge forwards
  $fromnudgeforward.on('mousedown', function() {
    fromnudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        fromnudgeforward();
      }, delay );
    }, pause)
  })

  $fromnudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function fromnudgeforward() {
    zfrom += 0.001;
    if (zfrom > 5) zfrom = 5;
    if (twotails) zto = -zfrom;
    setzSliders();
    drawCriticalTails();
  }


  //to nudge backwards
  $tonudgebackward.on('mousedown', function() {
    tonudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        tonudgebackward();
      }, delay );
    }, pause)
  })

  $tonudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function tonudgebackward() {
    zto -= 0.001;
    if (zto < -5) zto = -5;
    if (twotails) zfrom = -zto;
    setzSliders();
    drawCriticalTails();
  }

  //to nudge forward
  $tonudgeforward.on('mousedown', function() {
    tonudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        tonudgeforward();
      }, delay );
    }, pause)
  })

  $tonudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function tonudgeforward() {
    zto += 0.001;
    if (zto > 5) zto = 5;
    if (twotails) zfrom = -zto;
    setzSliders();
    drawCriticalTails();
  }


  /*---------------------------------------mu lines   zlines  x-axis   units-----------------------------------------------*/

  $showmuline.on('change', function() {
    showmuline = $showmuline.prop('checked');
    drawmuline();
  })

  function drawmuline() {
    if (showmuline || tshowmuline) {
      svgP.append('line').attr('class', 'muline').attr('x1', xb(0)).attr('y1', y(0)).attr('x2', xb(0)).attr('y2', y(realHeight)).attr('stroke', 'black').attr('stroke-width', 2);
      //extend to top axis as well
      if (tab === 'Normal') svgTopAxis.append('line').attr('class', 'muline').attr('x1', xb(0)).attr('y1', 40).attr('x2', xb(0)).attr('y2', 80).attr('stroke', 'black').attr('stroke-width', 2);

    }
    else {
      d3.selectAll('.muline').remove();
      if (showzline) {
        //show dark grey mu line
        svgP.append('line').attr('class', 'zlines').attr('x1', xb(0)).attr('y1', y(0)).attr('x2', xb(0)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 2);
        if (tab === 'Normal') svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(0)).attr('y1', 40).attr('x2', xb(0)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 2);
      }
    }
  }

  function removemuline() {
    d3.selectAll('.muline').remove();
  }


  $showzline.on('change', function() {
    showzline = $showzline.prop('checked');
    drawzlines();
  })

  function drawzlines() {
    if (showzline || tshowtzline) {
      let z = 0;
      let s = 1;
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z - 5*s)).attr('y1', y(0)).attr('x2', xb(z - 5*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z - 4*s)).attr('y1', y(0)).attr('x2', xb(z - 4*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z - 3*s)).attr('y1', y(0)).attr('x2', xb(z - 3*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z - 2*s)).attr('y1', y(0)).attr('x2', xb(z - 2*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z - 1*s)).attr('y1', y(0)).attr('x2', xb(z - 1*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);

      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z)+1).attr('y1', y(0)).attr('x2', xb(z)+1).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 2);

      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z + 1*s)).attr('y1', y(0)).attr('x2', xb(z + 1*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z + 2*s)).attr('y1', y(0)).attr('x2', xb(z + 2*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z + 3*s)).attr('y1', y(0)).attr('x2', xb(z + 3*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z + 4*s)).attr('y1', y(0)).attr('x2', xb(z + 4*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      svgP.append('line').attr('class', 'zlines').attr('x1', xb(z + 5*s)).attr('y1', y(0)).attr('x2', xb(z + 5*s)).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 1);

      //extend to top axis as well
      if (tab === 'Normal') {
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z - 5*s)).attr('y1', 40).attr('x2', xb(z - 5*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z - 4*s)).attr('y1', 40).attr('x2', xb(z - 4*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z - 3*s)).attr('y1', 40).attr('x2', xb(z - 3*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z - 2*s)).attr('y1', 40).attr('x2', xb(z - 2*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z - 1*s)).attr('y1', 40).attr('x2', xb(z - 1*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);

        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z)+1).attr('y1', 40).attr('x2', xb(z)+1).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 2);

        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z + 1*s)).attr('y1', 40).attr('x2', xb(z + 1*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z + 2*s)).attr('y1', 40).attr('x2', xb(z + 2*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z + 3*s)).attr('y1', 40).attr('x2', xb(z + 3*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z + 4*s)).attr('y1', 40).attr('x2', xb(z + 4*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
        svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(z + 5*s)).attr('y1', 40).attr('x2', xb(z + 5*s)).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 1);
      }
    }
    else {
      d3.selectAll('.zlines').remove();
    }
  }

  function removezlines() {
    d3.selectAll('.zlines').remove();
  }

  $showxaxis.on('change', function() {
    showxaxis = $showxaxis.prop('checked');
    setTopAxis(); //turns it on or off
    drawCriticalTails();
  })

  $units.on('change', function() {
    units = $units.val();
    setTopAxis();
  })


  /*-----------------------------------------mu sigma --------------------------------------*/
  //changes to the mu, sigma checkboxes
  $mu.on('change', function() {
    if ( isNaN($mu.val()) ) {
      $mu.val(mu);
      return;
    };
    mu = parseFloat($mu.val()).toFixed(0);
    if (mu < 0) {
      mu = 0;
    }
    if (mu > 200) {
      mu = 200;
    }
    $mu.val(mu);
    updateMu();
  })

  //mu nudge backwards
  $munudgebackward.on('mousedown', function() {
    munudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        munudgebackward();
      }, delay );
    }, pause)
  })

  $munudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function munudgebackward() {
    mu -= 1;
    if (mu < 0) mu = 0;
    $mu.val(mu);
    updateMu();
  }

  //mu nudge forward
  $munudgeforward.on('mousedown', function() {
    munudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        munudgeforward();
      }, delay );
    }, pause)
  })

  $munudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function munudgeforward() {
    mu += 1;
    if (mu > 200) mu = 200;
    $mu.val(mu);
    updateMu();
  }

  function updateMu() {
    $muslider.update({
      from: mu
    })
    setTopAxis();  
    drawCriticalTails(); 
  }


  $sigma.on('change', function() {
    if ( isNaN($sigma.val()) ) {
      $sigma.val(sigma);
      return;
    }
    sigma = parseFloat($sigma.val()).toFixed(0);
    if (sigma < 1) {
      sigma = 1;
    }
    if (sigma > 50) {
      sigma = 50;
    }
    $sigma.val(sigma);
    updateSigma();
  })



  //sigma nudge backwards
  $sigmanudgebackward.on('mousedown', function() {
    sigmanudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        sigmanudgebackward();
      }, delay );
    }, pause)
  })

  $sigmanudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function sigmanudgebackward() {
    sigma -= 1;
    if (sigma < 1) sigma = 1;
    $sigma.val(sigma);
    updateSigma();
  }

  //sigma nudge forward
  $sigmanudgeforward.on('mousedown', function() {
    sigmanudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        sigmanudgeforward();
      }, delay );
    }, pause)
  })

  $sigmanudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function sigmanudgeforward() {
    sigma += 1;
    if (sigma > 50) sigma = 50;
    $sigma.val(sigma);
    updateSigma();
  } 

  function updateSigma() {
    $sigmaslider.update({
      from: sigma
    })
    setTopAxis(); 
    drawCriticalTails();  
  }

  /*-----------------------------Panel 2 t-----------------------------------------*/

  $z.on('change', function() {
    z = true;
    t = false;
    zandt = false;
    drawTPDF();
    drawCriticalTails();
  })

  $t.on('change', function() {
    z = false;
    t = true;
    zandt = false;
    drawTPDF();
    drawCriticalTails()
  })

  $zandt.on('change', function() {
    z = false;
    t = false;
    zandt = true;
    drawTPDF();
    drawCriticalTails()
  })


  /*-----------------------------df------------------------------------------------*/
  //changes to the dfcheckboxes
  $df.on('change', function() {
    if ( isNaN($df.val()) ) {
      $df.val(df);
      return;
    }
    df = parseFloat($df.val()).toFixed(0);
    if (df < 1) {
      df = 1;
    }
    if (df > 100) {
      df = 100
    }
    $df.val(df);
    updateDF();
  })

  //df nudge backwards
  $dfnudgebackward.on('mousedown', function() {
    dfnudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        dfnudgebackward();
      }, delay );
    }, pause)
  })

  $dfnudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })  

  function dfnudgebackward() {
    df -= 1;
    if (df < 1) df = 1;
    $df.val(df);
    updateDF();
  }

  //df nudge forward
  $dfnudgeforward.on('mousedown', function() {
    dfnudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        dfnudgeforward();
      }, delay );
    }, pause)
  })

  $dfnudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function dfnudgeforward() {
    df += 1;
    if (df > 100) df = 100;
    $df.val(df);
    updateDF();
  }
  
  function updateDF() {
    $dfslider.update({
      from: df
    })
    createT();
    drawTPDF();
    drawCriticalTails();
  }
  
  /*---------------------------------------------Panel 2 Mean and z or t lines----------------------------*/

  $tshowmuline.on('change', function() {
    tshowmuline = $tshowmuline.prop('checked');
    drawmuline();
  })

  $tshowtzline.on('change', function() {
    tshowtzline = $tshowtzline.prop('checked');
    drawzlines();
  })


  /*---------------------------------------------Tooltips on or off-------------------------------------- */

  function setTooltips() {
    Tipped.setDefaultSkin('esci');

    //heading section
    Tipped.create('#logo',          'Version: '+version,                              { skin: 'red', size: 'versionsize', behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
  
    Tipped.create('#tooltipsonoff', 'Tips on/off, default is off!',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.headingtip',    'https://thenewstatistics.com',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.hometip',       'Click to return to esci Home',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    //control section
    //panel 1 Tails
    Tipped.create('.tailstip',      'Select features to display',                     { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.notailstip',    'No display of tails',                            { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.onetailtip',    'Each tail can be adjusted separately',           { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.twotailstip',   'Display two equal-area tails',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.areastip',      'Display values for areas under the curve',       { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    //panel 2 Lines
    Tipped.create('.linestip',      'Click to display lines',                         { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.meanlinetip',   'Display the mean line',                          { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.zlinestip',     'Display <em>z</em> lines',                       { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    //panel 3 X variable
    Tipped.create('.xvartip',       '<em>X</em> axis can be displayed at top of screen',       { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.xaxistip',      'Click to display',                               { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.unitstip',      'Type a short label for the units of <em>X</em>', { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.muslidertip',   'Select the mean of <em>X</em>, within 0 to 200', { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.sigmaslidertip', 'Select the SD of <em>X</em>, within 1 to 50',   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    //panel 4 Curves
    Tipped.create('.curvestip',     'Select curve(s) to display',                     { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.normtip',       'Display Normal distribution curve',              { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.ztip',          'Display <em>t</em> distribution curve',          { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.normandztip',   'Display both <em>z</em> and <em>t</em> distribution curves',       { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.dofftip',       'Select <em>df</em> for <em>t</em>',              { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.dfslidertip',   'Select <em>df</em> within 1 to 100',             { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    //panel 5 Tails
    Tipped.create('.ttailstip',     'Select features to display',                     { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.tnotailstip',   'No display of tails',                            { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.tonetailtip',   'Each tail can be adjusted separately',           { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.ttwotailstip',  'Display two equal-area tails',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.tareastip',     'Display values for areas under the curve',       { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
  
    //panel 6 Lines
    Tipped.create('.tlinestip',     'Click to display lines',                         { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.tmeanlinetip',  'Display the mean line',                          { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
    Tipped.create('.tzlinestip',    'Display <em>z</em> or <em>t</em> lines',                           { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    //spare
    // Tipped.create('. tip', '', { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

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

