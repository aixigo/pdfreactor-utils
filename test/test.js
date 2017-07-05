/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * https://opensource.org/licenses/MIT
 */
const expect = require( 'chai' ).expect;
const { JSDOM } = require( 'jsdom' );
const { renderOffscreen, renderPdf, renderToc } = require( '..' );


describe( 'renderToc', () => {

   let dom;
   beforeEach( () => {
      dom = new JSDOM( `<!DOCTYPE html>
         <div id="toc"></div>
         <h1>1 Headline</h1>
         <h2>1.1 Headline</h2>
         <h3>1.1.1 Headline</h3>
         <h2 id="i-have-an-id">1.2 Headline</h2>
         <h1>2 Headline</h1>      
      ` );
      global.document = dom.window.document;
   } );

   function triggerLoadedEvent() {
      global.document.dispatchEvent( new dom.window.Event( 'DOMContentLoaded' ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'renders a toc of h1 and h2 headings', () => {
      renderToc( '#toc' );
      triggerLoadedEvent();
      const entries = Array.from( document.body.querySelectorAll( 'li > a' ) )
         .map( entry => entry.textContent );
      expect( entries ).to.deep.equal( [ '1 Headline', '1.1 Headline', '1.2 Headline', '2 Headline' ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'generates ids for headings without id', () => {
      renderToc( '#toc' );
      triggerLoadedEvent();
      const ids = Array.from( document.body.querySelectorAll( 'h1, h2' ) )
         .map( heading => heading.id );
      expect( ids ).to.deep.equal( [ '1-Headline0', '1-1-Headline1', 'i-have-an-id', '2-Headline3' ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'links the toc entries to their respective headline', () => {
      renderToc( '#toc' );
      triggerLoadedEvent();
      const links = Array.from( document.body.querySelectorAll( 'li > a' ) )
         .map( entry => entry.href.split( '#' ).pop() );
      expect( links ).to.deep.equal( [ '1-Headline0', '1-1-Headline1', 'i-have-an-id', '2-Headline3' ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'sets a class on the li depending on the heading level', () => {
      renderToc( '#toc' );
      triggerLoadedEvent();
      const classes = Array.from( document.body.querySelectorAll( 'li' ) )
         .map( entry => entry.className );
      expect( classes ).to.deep.equal( [ 'level-h1', 'level-h2', 'level-h2', 'level-h1' ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'takes a custom heading selector as second argument', () => {
      renderToc( '#toc', 'h1, h3' );
      triggerLoadedEvent();
      const entries = Array.from( document.body.querySelectorAll( 'li > a' ) )
         .map( entry => entry.textContent );
      expect( entries ).to.deep.equal( [ '1 Headline', '1.1.1 Headline', '2 Headline' ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'if an entry has the attribute "data-toc-ignore"', () => {
      
      beforeEach( () => {
         dom = new JSDOM( `<!DOCTYPE html>
            <div id="toc"></div>
            <h1>1 Headline</h1>
            <h2 data-toc-ignore>1.1 Headline</h2>
            <h3>1.1.1 Headline</h3>
            <h2 id="i-have-an-id">1.2 Headline</h2>
            <h1>2 Headline</h1>      
         ` );
         global.document = dom.window.document;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'this entry is omitted from the table of contents', () => {
         renderToc( '#toc' );
         triggerLoadedEvent();
         const entries = Array.from( document.body.querySelectorAll( 'li > a' ) )
            .map( entry => entry.textContent );
         expect( entries ).to.deep.equal( [ '1 Headline', '1.2 Headline', '2 Headline' ] );
      } );
      
   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'renderPdf', () => {
   
   let images
   beforeEach( () => {
      const dom = new JSDOM( `<!DOCTYPE html>
         <div id="pdf-container"></div> 
      ` );
      global.document = dom.window.document;

      // simulating proprietary PDFreactor features
      dom.window.HTMLImageElement.prototype.roPageCount = 3;

      renderPdf( '#pdf-container', 'pdf-file.pdf' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'renders all pages of the PDF as images', () => {
      const imageData = Array.from( document.body.querySelectorAll( 'img' ) )
         .map( image => ({
            src: image.src,
            classes: image.className,
            sourcePageStyle: image.style.RoSourcePage
         }) );
      expect( imageData ).to.deep.equal( [
         { src: 'pdf-file.pdf', classes: 'embedded-pdf embedded-pdf-page-1', sourcePageStyle: '1' },
         { src: 'pdf-file.pdf', classes: 'embedded-pdf embedded-pdf-page-2', sourcePageStyle: '2' },
         { src: 'pdf-file.pdf', classes: 'embedded-pdf embedded-pdf-page-3', sourcePageStyle: '3' }
      ] );
   } );
   
} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'renderOffscreen', () => {
   
   let svgElement;
   beforeEach( () => {
      const dom = new JSDOM( `<!DOCTYPE html>
         <svg></svg> 
      ` );
      global.document = dom.window.document;
      svgElement = document.querySelector( 'svg' );
      svgElement.getBoundingClientRect = () => ({
         bottom: 0,
         height: 100,
         left: 0,
         right: 0,
         top: 0,
         width: 200
      });
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'calls the given callback while the element is detached', () => {
      expect( svgElement.parentNode ).to.equal( document.body );
      renderOffscreen( 'svg', () => {
         expect( svgElement.parentNode ).to.equal( null );
      } );
      expect( svgElement.parentNode ).to.equal( document.body );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'passes the svgElement wrapped as d3 selection as first argument to the callback', () => {
      renderOffscreen( 'svg', svg => {
         expect( svg.node() ).to.equal( svgElement );
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'passes the bounding client rect as second argument to the callback', () => {
      renderOffscreen( 'svg', ( svg, rect ) => {
         expect( rect.width ).to.equal( 200 );
         expect( rect.height ).to.equal( 100 );
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'passes a function to temporarily attach the svg as second argument to the callback', () => {
      let renderedValue;
      renderOffscreen( 'svg', ( svg, rect, rendered ) => {
         expect( svgElement.parentNode ).to.equal( null );
         renderedValue = rendered( () => {
            expect( svgElement.parentNode ).to.equal( document.body );
            return 42;
         } );
         expect( svgElement.parentNode ).to.equal( null );
      } );
      expect( renderedValue ).to.equal( 42 );
   } );
   
} );
