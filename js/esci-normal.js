/*
Program       esci-normal.js
Author        Gordon Moore
Date          14 July 2020
Description   The JavaScript code for esci-normal
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
  let tooltipson = false;

  //#endregion

  setTooltips();

  initialise();

  function initialise() {

  }

  function resize() {

  }

  

  /*---------------------------------------------Tooltips on or off-------------------------------------- */

  function setTooltips() {
    Tipped.setDefaultSkin('esci');

    //heading section
    Tipped.create('#logo', 'Version: '+version, { skin: 'red', size: 'xlarge' });
    Tipped.create('#tooltipsonoff', 'Allow tooltips on or off, default is off!', { skin: 'esci', size: 'xlarge' });

    Tipped.create('#mainheading', 'From The New Statistics: ', { skin: 'esci', size: 'xlarge' });
    Tipped.create('#subheading', 'https://thenewstatistics.com', { skin: 'esci', size: 'xlarge' });



    
    //footer
    Tipped.create('#footerlink', 'Return to the New Statistics website. ', { skin: 'esci', size: 'xlarge' });

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