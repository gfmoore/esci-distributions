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

*/
//#endregion 

let version = '0.1.7';

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  let tab = 'Normal';                                       //what tab?

  //#region for variable definitions (just allows code folding)
  let tooltipson = false;                                   //toggle the tooltips on or off

  const pdfdisplay = document.querySelector('#pdfdisplay'); //display of pdf area


  let realHeight = 100;                                     //the real world height for the pdf display area
  let margin = {top: 0, right: 10, bottom: 0, left: 70};    //margins for pdf display area


  let width;
  let height;                                               //the true width of the pdf display area in pixels
  let heightP;   
  
  let rwidth;                                               //the width returned by resize
  let rheight;                                              //the height returned by resize

  let xt, xb, y;                                            //scale functions

  let svgTopAxis;                                           //svg reference to the top axis
  let svgBottomAxis;                                        //svg reference to the bottom axis
  let svgP;                                                 //the svg reference to pdfdisplay

  let mu, sigma;                                            //the population mean, standard deviation and degrees of freedom
  let zmu, zsd;                                             //parameters of normal distribution

  let df;                                                   //degrees of freedom

  let normalpdf = [];                                       //the array holding the normal distribution
  let tpdf = [];                                            //the array holding the student t distribution
  let functionHeight;                                       //get max height of pdf function
  let tfunctionHeight;
  let dfrom, dto;                                           //frequency density (height) on pdf
  let dtfrom, dtto;                                         //frequency density for t
  let $zslider;                                             //reference to slider
  let zfrom, zto;                                           //the current from to values on the slider
  let oldzfrom, oldzto;                                     //remember old (previous) values to determine whcih slider changed

  //cache jquery properties (faster)
  $mu    = $('#muval');
  $sigma = $('#sigmaval');

  $df    = $('#dfval');

  let pfromlt;
  let pfromgt;
  let ptolt;
  let ptogt;
  let mid;
  let twotailtotal;

  const $showarea  = $('#showarea');
  let showarea     = false;
  const $notails   = $('#notails');
  let notails      = true;
  const $onetail   = $('#onetail');
  let onetail      = false;
  const $twotails  = $('#twotails');
  let twotails     = false;

  const $showmuline = $('#showmuline');
  let showmuline    = false;
  const $showzline  = $('#showzline');
  let showzline     = false;

  const $showxaxis  = $('#showxaxis');
  let showxaxis     = false;

  const $units      = $('#units');
  let units         = 'IQ Points';
  $units.val(units);

  const $z      = $('#z');
  let   z       = true;
  const $t      = $('#t');
  let   t       = false;
  const $zandt  = $('#zandt');
  let   zandt   = false;

  //student t tails
  const $tshowarea  = $('#tshowarea');
  const $tnotails   = $('#tnotails');
  const $tonetail   = $('#tonetail');
  const $ttwotails  = $('#ttwotails');
  //vars already defined and reused


  $tshowmuline      = $('#tshowmuline');
  tshowmuline       = false;
  $tshowtzline     = $('#tshowtzline');
  tshowtzline      = false;

  const $leftnudgebackward  = $('#leftnudgebackward')
  const $leftnudgeforward   = $('#leftnudgeforward');
  const $rightnudgebackward = $('#rightnudgebackward')
  const $rightnudgeforward  = $('#rightnudgeforward');

  const $munudgebackward    = $('#munudgebackward'); 
  const $munudgeforward     = $('#munudgeforward'); 
  const $sigmanudgebackward = $('#sigmanudgebackward'); 
  const $sigmanudgeforward  = $('#sigmanudgeforward'); 

  const $dfnudgebackward    = $('#dfnudgebackward'); 
  const $dfnudgeforward     = $('#dfnudgeforward'); 

  //api for getting width, height of element - only gets element, not entire DOM
  // https://www.digitalocean.com/community/tutorials/js-resize-observer
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      rwidth = entry.contentRect.width;
      rHeight = entry.contentRect.height;
    });
  });

  //#endregion


  //#region TESTING
  // $notails.prop('checked', false);
  // notails = false;
  // $onetail.prop('checked', false);
  // onetail = false;
  // $twotails.prop('checked', true);
  // twotails = true;

  // $showarea.prop('checked', true);
  // showarea = true;
  //#endregion


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
    
    //initialvalues - pick these up from textboxes/sliders or dropdowns
    mu     = 100;
    sigma  = 15;

    zmu    = 0;
    zsd    = 1;
    df     = 10;

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

    $('#dfslider').ionRangeSlider({
      skin: 'big',
      type: 'single',
      min: 1,
      max: 50,
      from: df,
      step: 1,
      grid: true,
      grid_num: 10,
      //on slider handles change
      onChange: function (data) {
        df = data.from;
        $df.val(df);
        createT();
        drawTPDF();
        drawCriticalValueLines();
      }
    })

    $('#zslider').ionRangeSlider({
      skin: 'big',
      type: 'double',
      min: -5.000,
      max: 5.000,
      from: -5.000,
      to: 5.000,
      step: 0.005,
      grid: true,
      grid_num: 10,
      prettify: prettify,
      //on slider handles change
      onChange: function (data) {
        zfrom = data.from;
        zto   = data.to;

        if (notails || onetail) {
        }
        if (twotails) {
          if (zfrom !== oldzfrom) {   //"from" slider changed
            zto = -zfrom;
          }
          else if (zto !== oldzto) {  //"to" slider changed 
            zfrom = -zto;
          } 
        }
        drawCriticalValueLines();
        //setSliders(); //it just doesn't work here. slider is too slow to respond I think
      },

      onFinish: function (data) {
        setSliders();
      }
    })

    function setSliders() {
      oldzfrom = zfrom;
      oldzto   = zto;
      $zslider.update( {
        from: zfrom,
        to:   zto
      })
    }
  
    function prettify(num) {
      return num.toFixed(3);
    }

    //get reference to sliders
    $muslider    = $("#muslider").data("ionRangeSlider");
    $sigmaslider = $("#sigmaslider").data("ionRangeSlider");
    $dfslider    = $("#dfslider").data("ionRangeSlider");
    $zslider     = $("#zslider").data("ionRangeSlider");


    $mu.val(mu);
    $sigma.val(sigma);

    $df.val(df);

    zfrom = -5.000;
    zto = 5.000;

    //create some old values so I can see which slider has changed
    oldzfrom = -5.000;
    oldzto   = 5.000;
  }

  function resize() {
    //have to watch out as the width and height do not always seem presice to pixels
    //browsers apparently do not expose true element width, height.
    //also have to think about box model. outerwidth(true) gets full width, not sure resizeObserver does.

    resizeObserver.observe(pdfdisplay);  //note doesn't get true outer width, height

    width   = rwidth - margin.left - margin.right;  
    heightP = rheight - margin.top - margin.bottom;

    clear();
  }

  //change tabs
  $("#smarttab").on("showTab", function(e, anchorObject, tabIndex) {
    if (tabIndex === 0) tab = 'Normal';
    if (tabIndex === 1) tab = 'Studentt';

    removemuline();
    removezlines();
    removeCriticalTails();

    if (tab === 'Normal') {   

      removeTPDF();

      setupDisplay();

      drawNormalPDF();

      if (showmuline) drawmuline();
      if (showzline) drawzlines();

    }
    if (tab === 'Studentt') {   //Student t

      removeNormalPDF();

      setupDisplay();

      drawTPDF();

      if (tshowmuline) drawmuline();
      if (tshowtzline) drawzlines();
    }
  });
  
  function clear() {
    setupDisplay();

    removeNormalPDF();
    removeTPDF();

    createNormal();
    createT();

    removeCriticalTails();

    if (tab === 'Normal') drawNormalPDF();
    if (tab === 'Studentt') drawTPDF();
    
    drawCriticalValueLines();

  }

  function setupDisplay() {
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
      svgTopAxis.append('g').attr('class', 'topaxis').style("font", "1.8rem sans-serif").attr( 'transform', 'translate(0, 40)' ).call(xAxisA);

      //add some text labels
      svgTopAxis.append('text').text('X').style('font-weight', 'italic').attr('class', 'topaxistext').attr('x', width/2 - 20).attr('y', 20).attr('text-anchor', 'start').attr('fill', 'black');
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

  function createNormal() {
    normalpdf = [];

    for (let x = -5.000; x <= 5.000; x += 0.005) {
      normalpdf.push({ x: x, y: jStat.normal.pdf(x, zmu, zsd) })
    }

    //scale it to fit in with drawing area
    //functionHeight = d3.max(normalpdf, function(d) { return d.y});
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

  function showNormalPDF() {
    d3.selectAll('.normalpdf').show();
  }

  function hideNormalPDF() {
    d3.selectAll('.normalpdf').hide();
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
    //return y * realHeight / tfunctionHeight * 0.9 + 0.2;
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
      svgP.append('line').attr('class', 'tpdf').attr('x1', 30).attr('y1', 30).attr('x2', 60).attr('y2', 30).attr('stroke', 'blue' ).attr('stroke-width', 3);
      svgP.append('text').text('Normal').attr('class', 'tpdf').attr('x',70 ).attr('y', 33 ).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
    }
    if (t || zandt) {
      svgP.append('line').attr('class', 'tpdf').attr('x1', 30).attr('y1', 60).attr('x2', 60).attr('y2', 60).attr('stroke', 'red' ).attr('stroke-width', 3);
      svgP.append('text').text('t').attr('class', 'tpdf').attr('x',70 ).attr('y', 63 ).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").style('font-style', 'italic').attr('fill', 'black');
    }
  }

  function removeTPDF() {
    d3.selectAll('.tpdf').remove();
  }

  function showTPDF() {
    d3.selectAll('.tpdf').show();
  }

  function hideTPDF() {
    d3.selectAll('.tpdf').hide();
  }

  /*-------------------------------------tails control---------------------------------------*/

  $showarea.on('change', function() {
    showarea = $showarea.prop('checked');
    drawCriticalValueLines();
  })

  $("input[name='tails']").change(function() {
    notails  = $notails.prop('checked');
    onetail  = $onetail.prop('checked');
    twotails = $twotails.prop('checked'); 
    if (twotails) {
      zfrom = -zto; //had to choose one side
      zoldfrom = zfrom
      zoldto = zto;
      $zslider.update( { from: zfrom, to: zto })
    }
    drawCriticalValueLines();   
  })

  $tshowarea.on('change', function() {
    showarea = $tshowarea.prop('checked');
    drawCriticalValueLines();
  })

  $("input[name='ttails']").change(function() {
    notails  = $tnotails.prop('checked');
    onetail  = $tonetail.prop('checked');
    twotails = $ttwotails.prop('checked'); 
    if (twotails) {
      zfrom = -zto; //had to choose one side
      zoldfrom = zfrom
      zoldto = zto;
      $zslider.update( { from: zfrom, to: zto })
    }
    drawCriticalValueLines();   
  })


  /*-----------------------------------draw the critical value areas and values-------------------------*/
  function drawCriticalValueLines() {

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
          //and in X axis
          svgTopAxis.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zfrom)).attr('y1', 40).attr('x2', xb(zfrom)).attr('y2', 80).attr('stroke', 'black').attr('stroke-width', 2);

          svgP.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zto)).attr('y1', y(0)).attr('x2', xb(zto)).attr('y2', y(realHeight /*dto*/)).attr('stroke', 'black').attr('stroke-width', 2);
          //and in X axis
          svgTopAxis.append('line').attr('class', 'criticalvalueline').attr('x1', xb(zto)).attr('y1', 40).attr('x2', xb(zto)).attr('y2', 80).attr('stroke', 'black').attr('stroke-width', 2);

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
            twotailtotal = pfromlt + ptogt;

            pfromlt = pfromlt.toFixed(4).toString().replace('0.', '.');
            pfromgt = pfromgt.toFixed(4).toString().replace('0.', '.');
            ptolt   = ptolt.toFixed(4).toString().replace('0.', '.');
            ptogt   = ptogt.toFixed(4).toString().replace('0.', '.');
            mid     = mid.toFixed(4).toString().replace('0.', '.');
            twotailtotal = twotailtotal.toFixed(4).toString().replace('0.', '.');

            //add a background rectangle to get background colour for text
            svgP.append('rect').attr('class', 'probability').attr('x',xb(zfrom) - 75 ).attr('y', rheight - 50).attr('width', 70).attr('height', 27).attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 1);
            svgP.append('text').text(pfromlt).attr('class', 'probability').attr('x', xb(zfrom) - 70).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');

            svgP.append('rect').attr('class', 'probability').attr('x', width/2 - 6 ).attr('y', rheight - 80).attr('width', 70).attr('height', 27).attr('fill', 'lemonchiffon').attr('stroke', 'black').attr('stroke-width', 1);
            svgP.append('text').text(mid).attr('class',   'probability').attr('x', width/2 - 0).attr('y', rheight - 60).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');

            svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 50).attr('width', 70).attr('height', 27).attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 1);
            svgP.append('text').text(ptogt).attr('class',   'probability').attr('x', xb(zto) + 15).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');

            if (twotails) {
              svgP.append('text').text('two tails').attr('class',   'probability').attr('x', xb(zto) + 7).attr('y', rheight - 120).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
              svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 110).attr('width', 70).attr('height', 27).attr('fill', 'honeydew').attr('stroke', 'black').attr('stroke-width', 1);
              svgP.append('text').text(twotailtotal).attr('class',   'probability').attr('x', xb(zto) + 15).attr('y', rheight - 90).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
            }
          }

          if (tab === 'Studentt' && (t || zandt)) {
            pfromlt = jStat.studentt.cdf(zfrom, df); //prob from slider less than
            pfromgt = 1 - pfromlt;                       //prob from slider less than   
            ptolt   = jStat.studentt.cdf(zto, df);   //prob to slider less than
            ptogt   = 1 - ptolt;                         //prob to slider greater than
            mid = Math.abs((1 - ptolt - pfromgt));
            twotailtotal = pfromlt+ ptogt;


            pfromlt = pfromlt.toFixed(4).toString().replace('0.', '.');
            pfromgt = pfromgt.toFixed(4).toString().replace('0.', '.');
            ptolt   = ptolt.toFixed(4).toString().replace('0.', '.');
            ptogt   = ptogt.toFixed(4).toString().replace('0.', '.');
            mid     = mid.toFixed(4).toString().replace('0.', '.');
            twotailtotal = twotailtotal.toFixed(4).toString().replace('0.', '.'); 

            //add a background rectangle to get background colour for text
            svgP.append('rect').attr('class', 'probability').attr('x',xb(zfrom) - 75 ).attr('y', rheight - 50).attr('width', 70).attr('height', 27).attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 1);
            svgP.append('text').text(pfromlt).attr('class', 'probability').attr('x', xb(zfrom) - 70).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');

            svgP.append('rect').attr('class', 'probability').attr('x', width/2 - 6 ).attr('y', rheight - 100).attr('width', 70).attr('height', 27).attr('fill', 'lemonchiffon').attr('stroke', 'black').attr('stroke-width', 1);
            svgP.append('text').text(mid).attr('class',   'probability').attr('x', width/2 - 0).attr('y', rheight - 80).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');

            svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 50).attr('width', 70).attr('height', 27).attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 1);
            svgP.append('text').text(ptogt).attr('class',   'probability').attr('x', xb(zto) + 15).attr('y', rheight - 30).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');

            if (twotails) {
              svgP.append('text').text('two tails').attr('class',   'probability').attr('x', xb(zto) + 7).attr('y', rheight - 120).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
              svgP.append('rect').attr('class', 'probability').attr('x',xb(zto) + 5 ).attr('y', rheight - 110).attr('width', 70).attr('height', 27).attr('fill', 'honeydew').attr('stroke', 'black').attr('stroke-width', 1);
              svgP.append('text').text(twotailtotal).attr('class',   'probability').attr('x', xb(zto) + 15).attr('y', rheight - 90).attr('text-anchor', 'start').style("font", "1.8rem sans-serif").attr('fill', 'black');
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

  //not used on resize
  function resetCriticalTails() {
    $zslider.update( {
      from: -5,
      to: 5
    })
  }


  /*---------------------------------------lines-----------------------------------------------*/

  $showmuline.on('change', function() {
    showmuline = $showmuline.prop('checked');
    drawmuline();
  })

  $showzline.on('change', function() {
    showzline = $showzline.prop('checked');
    drawzlines();
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
        svgP.append('line').attr('class', 'zlines').attr('x1', xb(0)+1).attr('y1', y(0)).attr('x2', xb(0)+1).attr('y2', y(realHeight)).attr('stroke', 'darkgrey').attr('stroke-width', 2);
        if (tab === 'Normal') svgTopAxis.append('line').attr('class', 'zlines').attr('x1', xb(0)+1).attr('y1', 40).attr('x2', xb(0)+1).attr('y2', 80).attr('stroke', 'darkgrey').attr('stroke-width', 2);
      }
    }

  }

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

  function removemuline() {
    d3.selectAll('.muline').remove();
  }

  function removezlines() {
    d3.selectAll('.zlines').remove();
  }

  /*----------------------------------------------pdf slider-------------------------------------*/

  $showxaxis.on('change', function() {
    showxaxis = $showxaxis.prop('checked');
    setTopAxis(); //turns it on or off
  })

  $units.on('change', function() {
    units = $units.val();
    setTopAxis();
  })

  $leftnudgebackward.on('click', function(e) {
    if (zfrom > -5) zfrom -= 0.005;
    if (twotails) zto = -zfrom;
    zsliderUpdate();
  })

  $leftnudgeforward.on('click', function(e) {
    if (zfrom < 5) zfrom += 0.005;
    if (twotails) zto = -zfrom;
    zsliderUpdate();
  })

  $rightnudgebackward.on('click', function(e) {
    if (zto > -5) zto -= 0.005;
    if (twotails) zfrom = -zto;
    zsliderUpdate();
  })

  $rightnudgeforward.on('click', function(e) {
    if (zto < 5) zto += 0.005;
    if (twotails) zfrom = -zto;
    zsliderUpdate();
  })

  function zsliderUpdate() {
    zoldfrom = zfrom;
    zoldto = zto;
    $zslider.update( { from: zfrom, to: zto })
    drawCriticalValueLines();
  }

  /*-----------------------------------------mu sigma --------------------------------------*/
  //changes to the mu, sigma checkboxes
  $mu.on('change', function() {
    mu = parseFloat($mu.val());
    updateMu();
  })

  $munudgebackward.on('click', function() {
    mu -= 1;
    $mu.val(mu);
    updateMu();
  })

  $munudgeforward.on('click', function() {
    mu += 1;
    $mu.val(mu);
    updateMu();
  })

  function updateMu() {
    $muslider.update({
      from: mu
    })
    setTopAxis();   
  }

  $sigma.on('change', function() {
    sigma = parseFloat($sigma.val());
    updateSigma();
  })

  $sigmanudgebackward.on('click', function() {
    if (sigma > 1) sigma -= 1;
    $sigma.val(sigma);
    updateSigma();
  })

  $sigmanudgeforward.on('click', function() {
    sigma += 1;
    $sigma.val(sigma);
    updateSigma();
  })

  function updateSigma() {
    $sigmaslider.update({
      from: sigma
    })
    setTopAxis();   
  }

  /*-----------------------------Panel 2 t-----------------------------------------*/

  $z.on('change', function() {
    z = true;
    t = false;
    zandt = false;
    drawTPDF();
    drawCriticalValueLines();
  })

  $t.on('change', function() {
    z = false;
    t = true;
    zandt = false;
    drawTPDF();
    drawCriticalValueLines()
  })

  $zandt.on('change', function() {
    z = false;
    t = false;
    zandt = true;
    drawTPDF();
    drawCriticalValueLines()
  })


  /*-----------------------------df------------------------------------------------*/
  //changes to the dfcheckboxes
  $df.on('change', function() {
    df = parseFloat($df.val());
    updateDF();
  })

  $dfnudgebackward.on('click', function() {
    df -= 1;
    $df.val(df);
    updateDF();
  })

  $dfnudgeforward.on('click', function() {
    df += 1;
    $df.val(df);
    updateDF();
  })

  function updateDF() {
    $dfslider.update({
      from: df
    })
 
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

