(function() {
    /* Javascript program to compute the Sum of Sines. 
    Written by Amarnath S, aka Avijnata, Dec 2018
     amarnaths.codeproject@gmail.com
    */

    // Ten amplitudes and ten phases
    var amplitudeArray = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
    var phaseArray =     [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    var numberOfXvalues = 401;
    var sineSumValues = [];
    var numberOfHarmonics = 10;
    var currentHarmonic; // 1 based index
    var amplitude;
    var phase;
    var canvas01, canvas02, canvas03;
    var context01, context02, context03;

    // For the Audio part
    var webaudio;

    /*
    IDs on the HTML page
    opHarmonic - the selection box for Harmonic Number 
    raAmpl - the range element for Amplitude
    opAmpl - the output element for Amplitude
    raPhase - the range element for Phase
    opPhase - the output element for Phase
    bnSound - button to play sound
    bnReset - button to reset Amplitude and Phase values
    tblHarmonic - table listing the amplitudes and phases of the different harmonics
    canvas01 - canvas for the single sine graph
    canvas02 - canvas for the sum of sines
    canvas03 - canvas to display the 3D spectral profile
    */

    window.onload = init;

    function init(){
        for(var i = 0; i < numberOfXvalues + 1; i++) {
            sineSumValues.push(0.0);
        }
        
        canvas01 = document.getElementById('canvas01'); 
        context01 = canvas01.getContext('2d'); 

        canvas02 = document.getElementById('canvas02'); 
        context02 = canvas02.getContext('2d'); 

        canvas03 = document.getElementById('canvas03'); 
        context03 = canvas03.getContext('2d');

        // Initialize the amplitudes on the screen
        initializeAmplitudesAndPhases();
        
        opHarmonic.addEventListener('change', opHarmonicChange, false);
        raAmpl.addEventListener('input', raAmplitudeChange, false);
        raPhase.addEventListener('input', raPhaseChange, false);
        bnSound.addEventListener('click', bnSoundClick, false);
        bnReset.addEventListener('click', bnResetClick, false);

        currentHarmonic = 1;
        computeSineSumValues();
        updateCanvasSingle();
        updateCanvasSum();
        updateCanvas3D();

        webaudio = new (window.AudioContext || window.webkitAudioContext)();

        // Handler for the table row select
        $("#tblHarmonic tr").click(function(){
            $(this).addClass('selected').siblings().removeClass('selected');    
            var value = $(this).find('th:first').html();
            currentHarmonic = parseInt(value);
            //console.log('Table Harmonic is ' + currentHarmonic);
            var harmonic = document.getElementById("opHarmonic");
            harmonic.value = currentHarmonic;
            changeAmplPhaseUiElements();
            updateCanvasSingle();
        });

        document.getElementById("tr1").className = "selected";
        bnResetClick();
    }

    // Initialize all ten amplitudes and phases 
    function initializeAmplitudesAndPhases() {
        // Initialize the amplitudes on the screen
        var element = document.getElementById("ta1");     element.textContent = amplitudeArray[0];
        element = document.getElementById("ta2");         element.textContent = amplitudeArray[1];
        element = document.getElementById("ta3");         element.textContent = amplitudeArray[2];
        element = document.getElementById("ta4");         element.textContent = amplitudeArray[3];
        element = document.getElementById("ta5");         element.textContent = amplitudeArray[4];
        element = document.getElementById("ta6");         element.textContent = amplitudeArray[5];
        element = document.getElementById("ta7");         element.textContent = amplitudeArray[6];
        element = document.getElementById("ta8");         element.textContent = amplitudeArray[7];
        element = document.getElementById("ta9");         element.textContent = amplitudeArray[8];
        element = document.getElementById("ta10");        element.textContent = amplitudeArray[9];

        // Initialize the phases on the screen
        element = document.getElementById("tp1");         element.textContent = phaseArray[0];
        element = document.getElementById("tp2");         element.textContent = phaseArray[1];
        element = document.getElementById("tp3");         element.textContent = phaseArray[2];
        element = document.getElementById("tp4");         element.textContent = phaseArray[3];
        element = document.getElementById("tp5");         element.textContent = phaseArray[4];
        element = document.getElementById("tp6");         element.textContent = phaseArray[5];
        element = document.getElementById("tp7");         element.textContent = phaseArray[6];
        element = document.getElementById("tp8");         element.textContent = phaseArray[7];
        element = document.getElementById("tp9");         element.textContent = phaseArray[8];
        element = document.getElementById("tp10");        element.textContent = phaseArray[9];
    }

    function changeAmplPhaseUiElements(){
        // Select the amplitude and phase corresponding to currentHarmonic
        amplitude = amplitudeArray[currentHarmonic - 1]; // 0 based array
        phase = phaseArray[currentHarmonic - 1]; // 0 based array
        var rAmpl = document.getElementById("raAmpl");
        rAmpl.value = amplitude;
        var oAmpl = document.getElementById("opAmpl");
        oAmpl.textContent = amplitude.toFixed(2);
        var rPhase = document.getElementById("raPhase");
        rPhase.value = phase;
        var oPhase = document.getElementById("opPhase");
        oPhase.textContent = phase.toFixed(2);
    }

    // Handler for Harmonic select UI element
    function opHarmonicChange(){
        var harmonic = document.getElementById("opHarmonic").value;
        currentHarmonic = parseInt(harmonic);
        var tableRowId;

        // Deselect all rows, to remove the highlight
        for( var i = 0; i < 10; ++i) {
            var i1 = i + 1;
            tableRowId = "tr" + i1;
            document.getElementById(tableRowId).className = '';    
        }
        // Select the one row needed to highlight the needed row
        tableRowId = "tr" + currentHarmonic;
        document.getElementById(tableRowId).className = "selected";

        changeAmplPhaseUiElements();
        updateCanvasSingle();
    }

    function computeValuesAndGraphs() {
        computeSineSumValues();
        updateCanvasSingle();
        updateCanvasSum();
        updateCanvas3D();
    }

    // Handler for Amplitude range UI element
    function raAmplitudeChange() {
        var amplValue = document.getElementById('raAmpl').value;
        var ampl = parseFloat(amplValue);
        var ampl2 = ampl.toFixed(2);
        document.getElementById('opAmpl').textContent = ampl2;
        var cellId = 'ta' + currentHarmonic;
        document.getElementById(cellId).textContent = ampl;
        amplitudeArray[currentHarmonic - 1] = ampl;
        computeValuesAndGraphs();
    }

    // Handler for Phase range UI element
    function raPhaseChange() {
        var phaseValue = document.getElementById('raPhase').value;
        var phas = parseFloat(phaseValue);
        var phas2 = phas.toFixed(2);
        document.getElementById('opPhase').textContent = phas2;
        var cellId = 'tp' + currentHarmonic;
        document.getElementById(cellId).textContent = phas;
        phaseArray[currentHarmonic - 1] = phas;
        //console.log(phaseArray);
        computeValuesAndGraphs();
    }

    // Handler for Play Sound button
    function bnSoundClick(){
        playTone(100);
    }

    // Handler for Reset button
    function bnResetClick() {
        amplitudeArray = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
        phaseArray =     [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
        initializeAmplitudesAndPhases();
        currentHarmonic = 1;
        var harmonic = document.getElementById("opHarmonic");
        harmonic.value = currentHarmonic;
        opHarmonicChange();
        computeValuesAndGraphs();
    }

    // Function to compute the sum of sines
    function computeSineSumValues(){
        for( var i = 0; i < numberOfXvalues + 1; i++) {
            var sineSum = 0.0;
            var tVal = i / 200;
            for (var j = 0; j < numberOfHarmonics; ++j){
                var val1 = 2 * Math.PI * (j + 1) * tVal + phaseArray[j];
                var val2 = amplitudeArray[j] * Math.sin(val1);
                sineSum += val2;
            }
            sineSumValues[i] = sineSum;
        }
    }

    // Thanks to CodeProject member M.R. van Mourik for suggesting this method. 
    // This has a plucked-string like envelope also included in it.
    // Uses the Web Audio API.
    //
    // Thanks also to CodeProject member ccdsystems for pointing out an issue
    // with respect to the audio playing. When the "Play Sound" button was clicked 
    // more than six times, the application used to freeze. This was because the 
    // audio context was created more than six times, for which Chrome used to 
    // complain. For remedying this, we create the audio context in the init function 
    // at the top.  
    function playTone(freq)
    {
        var sinbins = new Float32Array(phaseArray.length + 1);
        var cosbins = new Float32Array(phaseArray.length + 1);
    
        for (var i = 0; i < phaseArray.length; i++)
        {
            sinbins[i + 1] = amplitudeArray[i] * Math.cos(phaseArray[i]);
            cosbins[i + 1] = amplitudeArray[i] * Math.sin(phaseArray[i]);
        }
    
        var wave = webaudio.createPeriodicWave(cosbins, sinbins);
        var oscillator = webaudio.createOscillator();
        var envelope = webaudio.createGain();
        envelope.connect(webaudio.destination);
        envelope.gain.value = 0;
    
        oscillator.frequency.value = freq;
        oscillator.setPeriodicWave(wave);
        oscillator.start(webaudio.currentTime + 0.01);
        oscillator.connect(envelope);
    
        envelope.gain.linearRampToValueAtTime(1.0, webaudio.currentTime + 0.15);
        envelope.gain.exponentialRampToValueAtTime(0.01, webaudio.currentTime + 2.0);
        envelope.gain.linearRampToValueAtTime(0.0, webaudio.currentTime + 3.0);
    
        oscillator.stop(webaudio.currentTime + 4.0);
    }

    // Returns the max from the elements of the values array.
    function getMax(values) {
        var maxValue = -100000.0;

        for (i=0; i < values.length; i++) {
            if (maxValue < values[i])
                maxValue = values[i];
        }
        return maxValue;
    }

    // Returns the min from the elements of the values array.
    function getMin(values) {
        var minValue = 100000.0;

        for (i=0; i < values.length; i++) {
            if (minValue > values[i])
                minValue = values[i];
        }
        return minValue;
    }

    // Draws the bounding box around the curve, and also draws the grid and minimal text legends
    function drawGraphBox(context, cWidth, cHeight, xMarginLeft, xMarginRight, 
       yMarginTop, yMarginBottom) {
        context.save();

        // Fill Box
        context.fillStyle = "#fffacd";
        context.fillRect(xMarginLeft, yMarginTop, cWidth - xMarginLeft - xMarginRight, 
              cHeight - yMarginTop - yMarginBottom);

        context.strokeStyle = "#b9b9b9";
        
        // Draw Box
        context.beginPath();
        context.moveTo(xMarginLeft, yMarginTop); // Point 1
        context.lineTo(cWidth - xMarginRight, yMarginTop); // Point 2
        context.lineTo(cWidth - xMarginRight, cHeight - yMarginBottom); // Point 3
        context.lineTo(xMarginLeft, cHeight - yMarginBottom); // Point 4
        context.lineTo(xMarginLeft, yMarginTop); // Point 1

        // Draw the grid
        var numberOfDivisions = 20;
        var xStep = (cWidth - xMarginLeft - xMarginRight) / numberOfDivisions;
        var yStep = (cHeight - yMarginTop - yMarginBottom) / numberOfDivisions;

        for( var i = 0; i < numberOfDivisions; ++i) {
            if( (i === 5) || (i === 10) || (i == 15)) { 
                // We will draw these lines later
                continue;
            } 
            context.moveTo(xMarginLeft + i * xStep, cHeight - yMarginBottom);
            context.lineTo(xMarginLeft + i * xStep, yMarginTop);
            context.moveTo(xMarginLeft, cHeight - yMarginBottom - i * yStep);
            context.lineTo(cWidth - xMarginRight, cHeight - yMarginBottom - i * yStep);
        }
        context.stroke(); 

        context.beginPath();
        context.strokeStyle = "#0000cf";

        // Draw quarter grid lines, in a darker blue colour
        numberOfDivisions = 4;
        xStep = (cWidth - xMarginLeft - xMarginRight) / numberOfDivisions;
        yStep = (cHeight - yMarginTop - yMarginBottom) / numberOfDivisions;
        for ( var i = 0; i < numberOfDivisions; ++i){
            context.moveTo(xMarginLeft + i * xStep, cHeight - yMarginBottom);
            context.lineTo(xMarginLeft + i * xStep, yMarginTop);
            context.moveTo(xMarginLeft, cHeight - yMarginBottom - i * yStep);
            context.lineTo(cWidth - xMarginRight, cHeight - yMarginBottom - i * yStep);
        }

        // Draw outer box
        context.moveTo(xMarginLeft, yMarginTop); // Point 1
        context.lineTo(cWidth - xMarginRight, yMarginTop); // Point 2
        context.lineTo(cWidth - xMarginRight, cHeight - yMarginBottom); // Point 3
        context.lineTo(xMarginLeft, cHeight - yMarginBottom); // Point 4
        context.lineTo(xMarginLeft, yMarginTop); // Point 1
        context.stroke();

        // Draw Text
        var xTextMargin1 = xMarginLeft - 16;
        var xTextMargin2 = (xMarginLeft + cWidth - xMarginRight) / 2 - 5;
        var xTextMargin3 = cWidth - xMarginRight - 8;
        var yTextMargin1 = (yMarginTop + cHeight - yMarginBottom) / 2 + 5;
        var yTextMargin2 = cHeight - yMarginBottom + 20;
        context.beginPath();
        context.font = "12pt Arial";
        context.fillStyle = "#a52a2a";
        context.textAlign = "left";
        context.fillText("0", xTextMargin1, yTextMargin1);
        context.fillText("0", xTextMargin1 + 13, yTextMargin2);
        context.fillText("1", xTextMargin2, yTextMargin2);
        context.fillText("2", xTextMargin3, yTextMargin2);
        context.stroke();

        context.restore();
    }

    // Draws the curve corresponding to a single sine wave 
    function updateCanvasSingle(rowNo){
        var cWidth = canvas01.width;
        var cHeight = canvas01.height;
        var xMarginLeft = 55;
        var xMarginRight = 5;
        var yMarginTop = 25;
        var yMarginBottom = 35;
        var xMax = numberOfXvalues/200;
        var xMin = 0;
        var xDiff = xMax - xMin;
        var x, y, y1;

        context01.clearRect(0, 0, cWidth, cHeight );
        drawGraphBox(context01, cWidth, cHeight, xMarginLeft, xMarginRight, yMarginTop, yMarginBottom);

        var xVals = [];
        xVals.length = 0;
        var sineVals = [];
        sineVals.length = 0;
        for(var i = 0; i < numberOfXvalues + 1; ++i) {
            x = i / 200;
            xVals.push(x);
            y1 = 2.0 * Math.PI * currentHarmonic * x + phaseArray[currentHarmonic-1]; // radians
            y = amplitudeArray[currentHarmonic-1] * Math.sin(y1);
            sineVals.push(y);
        }

        var yMax = 10.01;
        var yMin = -10.01;
        var yDiff = yMax - yMin;
        if (Math.abs(yDiff) < 0.001) {
            yDiff = 1.0;
        }
        
        var xStep = (cWidth - xMarginLeft - xMarginRight)/numberOfXvalues;
        var yLim1 = cHeight - yMarginBottom;
        var yLim2 = yMarginTop;
        var yLimDiff = yLim2 - yLim1;
        var yFactor = yLimDiff / yDiff;
        var xPoint0, yPoint0, xPoint1, yPoint1;
        
        context01.save();
        context01.beginPath();
        xPoint0 = xMarginLeft;
        yPoint0 = (sineVals[0] - yMin) * yFactor + yLim1;
        context01.moveTo(xPoint0, yPoint0);

        for( var i = 1; i < sineSumValues.length; ++i) {
            xPoint1 = xMarginLeft + i * xStep;
            yPoint1 = (sineVals[i] - yMin) * yFactor + yLim1; 
            context01.lineTo(xPoint1, yPoint1);
        }
        context01.lineWidth = 2;
        context01.stroke();

        // Draw Text
        var xTextMargin1 = xMarginLeft - 2;
        var yTextMargin1 = yMarginTop + 10;
        var yTextMargin2 = cHeight - yMarginBottom;// + 20;
        context01.beginPath();
        context01.font = "12pt Arial";
        context01.fillStyle = "#a52a2a";
        context01.textAlign = "right";
        context01.fillText("10", xTextMargin1, yTextMargin1);
        context01.fillText("-10", xTextMargin1, yTextMargin2);
        context01.fillText("Harmonic Number " + currentHarmonic, 230, 20);
        context01.stroke();
        context01.restore();
    }

    // Draws the curve corresponding to the sum of sines
    function updateCanvasSum(){
        var cWidth = canvas02.width;
        var cHeight = canvas02.height;
        var xMarginLeft = 55;
        var xMarginRight = 5;
        var yMarginTop = 25;
        var yMarginBottom = 35;
        var xMax = numberOfXvalues/200;
        var xMin = 0;
        var xDiff = xMax - xMin;
        var x, y, y1;

        context02.clearRect(0, 0, cWidth, cHeight );
        drawGraphBox(context02, cWidth, cHeight, xMarginLeft, xMarginRight, yMarginTop, yMarginBottom);

        var yMax = getMax(sineSumValues);
        var yMin = getMin(sineSumValues);

        var yMaxAbs = Math.abs(yMax);
        var yMinAbs = Math.abs(yMin);
        var yVal = yMinAbs;
        if (yMaxAbs > yMinAbs) {
            yVal = yMaxAbs;
        }

        yMax = yVal;
        yMin = -yVal;

        var yDiff = yMax - yMin;
        if(Math.abs(yDiff) < 0.001) {
            yDiff = 1.0;
        }
        
        var xStep = (cWidth- xMarginLeft - xMarginRight)/numberOfXvalues;
        var yLim1 = cHeight - yMarginBottom;
        var yLim2 = yMarginTop;
        var yLimDiff = yLim2 - yLim1;
        var yFactor = yLimDiff / yDiff;
        var xPoint0, yPoint0, xPoint1, yPoint1;
        
        context02.save();
        context02.beginPath();
        xPoint0 = xMarginLeft;
        yPoint0 = (sineSumValues[0] - yMin) * yFactor + yLim1;
        context02.moveTo(xPoint0, yPoint0);
        
        for( var i = 1; i < sineSumValues.length; ++i) {
            xPoint1 = xMarginLeft + i * xStep;
            yPoint1 = (sineSumValues[i] - yMin) * yFactor + yLim1; 
            context02.lineTo(xPoint1, yPoint1);
        }
        context02.lineWidth = 2;
        context02.stroke();

        // Draw Text
        var xTextMargin1 = xMarginLeft - 2;
        var yTextMargin1 = yMarginTop + 10;
        var yTextMargin2 = cHeight - yMarginBottom;// + 20;
        context02.beginPath();
        context02.font = "12pt Arial";
        context02.fillStyle = "#a52a2a";
        context02.textAlign = "right";
        var yMaxStr = yMax.toFixed(2);
        var yMinStr = yMin.toFixed(2);
        context02.fillText(yMaxStr, xTextMargin1, yTextMargin1);
        context02.fillText(yMinStr, xTextMargin1, yTextMargin2);
        context02.fillText("Combined Signal", 225, 20);
        context02.stroke();

        context02.restore();
    }

    // MyPoint2D object, a simple object to hold a 2D point
    function MyPoint2D(xVal, yVal){
        this.x = xVal;
        this.y = yVal;
    }

    function fillTriangle(context, point1, point2, point3) {
        context.moveTo(point1.x, point1.y);
        context.lineTo(point2.x, point2.y);
        context.lineTo(point3.x, point3.y);
        context.closePath();
        context.fill();
    }

    function drawLine(context, point1, point2, step1x, step1y, step2x, step2y, i) {
        var inter1 = new MyPoint2D(0.0, 0.0);
        var inter2 = new MyPoint2D(0.0, 0.0);
        inter1.x = point1.x + step1x * i;
        inter1.y = point1.y + step1y * i;
        inter2.x = point2.x + step2x * i;
        inter2.y = point2.y + step2y * i;
        context.moveTo(inter1.x, inter1.y);
        context.lineTo(inter2.x, inter2.y);
    }

    function moveToLineTo(context, point1, point2) {
        context.moveTo(point1.x, point1.y);
        context.lineTo(point2.x, point2.y);
    }

    function updateCanvas3D(){
        context03.save();
        var cWidth = canvas03.width;
        var cHeight = canvas03.height;
        context03.clearRect(0, 0, cWidth, cHeight );

        var point1 = new MyPoint2D(0.4 * cWidth, 0.9 * cHeight);
        var point2 = new MyPoint2D(0.9 * cWidth, 0.75 * cHeight);
        var point4 = new MyPoint2D(0.15 * cWidth, 0.70 * cHeight);
        var pointM1 = new MyPoint2D( (point2.x + point4.x)/2, (point2.y + point4.y)/2 );
        var point3 = new MyPoint2D(2 * pointM1.x - point1.x, 2 * pointM1.y - point1.y);
        var point5 = new MyPoint2D(point1.x, point1.y - 100);
        var point6 = new MyPoint2D(point2.x, point2.y - 100);
        var point7 = new MyPoint2D(point3.x, point3.y - 100);
        var point8 = new MyPoint2D(point4.x, point4.y - 100);

        // Draw the horizontal and vertical surfaces of the cuboid        
        context03.beginPath();
        context03.fillStyle = "#fffacd";
        context03.strokeStyle = "#fffacd";
        fillTriangle(context03, point1, point3, point4);
        fillTriangle(context03, point1, point2, point3);
        fillTriangle(context03, point7, point2, point6);
        fillTriangle(context03, point7, point3, point2);
        fillTriangle(context03, point4, point3, point8);
        fillTriangle(context03, point8, point3, point7);
        context03.stroke();

        // Grid on horizontal and vertical surfaces of the cuboid
        context03.beginPath();
        context03.strokeStyle = "#b9b9b9";
        context03.lineWidth = 1;
        var numberOfDivisions10 = 10;
        var numberOfDivisions11 = 11;
        var numberOfDivisions = 11;
        var x21Diff = point2.x - point1.x;
        var y21Diff = point2.y - point1.y;
        var x34Diff = point3.x - point4.x;
        var y34Diff = point3.y - point4.y;        
        var pointInter1 = new MyPoint2D(0, 0); 
        var pointInter2 = new MyPoint2D(0, 0);
        var x21Step = x21Diff / numberOfDivisions11;
        var y21Step = y21Diff / numberOfDivisions11;
        var x34Step = x34Diff / numberOfDivisions11;
        var y34Step = y34Diff / numberOfDivisions11;

        var x41Diff = point4.x - point1.x;
        var y41Diff = point4.y - point1.y;
        var x32Diff = point3.x - point2.x;
        var y32Diff = point3.y - point2.y;
        var x41Step = x41Diff / numberOfDivisions10;
        var y41Step = y41Diff / numberOfDivisions10;
        var x32Step = x32Diff / numberOfDivisions10;
        var y32Step = y32Diff / numberOfDivisions10;

        var x84Diff = point8.x - point4.x;
        var y84Diff = point8.y - point4.y;
        var x73Diff = point7.x - point3.x;
        var y73Diff = point7.y - point3.y;
        var x84Step = x84Diff / numberOfDivisions10;
        var y84Step = y84Diff / numberOfDivisions10;
        var x73Step = x73Diff / numberOfDivisions10;
        var y73Step = y73Diff / numberOfDivisions10;

        var x34Diff = point3.x - point4.x;
        var y34Diff = point3.y - point4.y;
        var x78Diff = point7.x - point8.x;
        var y78Diff = point7.y - point8.y;
        var x34Step = x34Diff / numberOfDivisions11;
        var y34Step = y34Diff / numberOfDivisions11;
        var x78Step = x78Diff / numberOfDivisions11;
        var y78Step = y78Diff / numberOfDivisions11;

        var x23Diff = point3.x - point2.x;
        var y23Diff = point3.y - point2.y;
        var x67Diff = point7.x - point6.x;
        var y67Diff = point7.y - point6.y;
        var x23Step = x23Diff / numberOfDivisions10;
        var y23Step = y23Diff / numberOfDivisions10;
        var x67Step = x67Diff / numberOfDivisions10;
        var y67Step = y67Diff / numberOfDivisions10;

        var x26Diff = point6.x - point2.x;
        var y26Diff = point6.y - point2.y;
        var x37Diff = point7.x - point3.x;
        var y37Diff = point7.y - point3.y;
        var x26Step = x26Diff / numberOfDivisions10;
        var y26Step = y26Diff / numberOfDivisions10;
        var x37Step = x37Diff / numberOfDivisions10;
        var y37Step = y37Diff / numberOfDivisions10;

        for(var i = 0; i < numberOfDivisions11; ++i) {
            drawLine(context03, point1, point4, x21Step, y21Step, x34Step, y34Step, i);
            drawLine(context03, point4, point8, x34Step, y34Step, x78Step, y78Step, i);
        }

        for( var i = 1; i < numberOfDivisions10; ++i) {
            drawLine(context03, point1, point2, x41Step, y41Step, x32Step, y32Step, i);
            drawLine(context03, point4, point3, x84Step, y84Step, x73Step, y73Step, i);
            drawLine(context03, point2, point6, x23Step, y23Step, x67Step, y67Step, i);
            drawLine(context03, point2, point3, x26Step, y26Step, x37Step, y37Step, i);
        }
        context03.stroke();

        // Draw the back side vertical and inclined lines
        context03.beginPath();
        context03.strokeStyle = "#0000cf";
        context03.lineWidth = 2;
        moveToLineTo(context03, point2, point6);
        moveToLineTo(context03, point3, point7);
        moveToLineTo(context03, point4, point8);
        moveToLineTo(context03, point2, point3);
        moveToLineTo(context03, point3, point4);
        moveToLineTo(context03, point6, point7);
        moveToLineTo(context03, point7, point8);
        context03.stroke();

        // Now, the actual lines in the 3D graph        
        context03.beginPath();
        var harmonicDist = new MyPoint2D(0.0, 0.0);
        var phaseDist = new MyPoint2D(0.0, 0.0);
        var amplitudeDist = new MyPoint2D(0.0, 0.0);
        harmonicDist.x = point2.x - point1.x;
        harmonicDist.y = point2.y - point1.y;
        phaseDist.x = point4.x - point1.x;
        phaseDist.y = point4.y - point1.y;
        amplitudeDist.x = point5.x - point1.x;
        amplitudeDist.y = point5.y - point1.y;

        var harmonicStep = new MyPoint2D(0.0, 0.0);
        var phaseStep = new MyPoint2D(0.0, 0.0);
        var amplitudeStep = new MyPoint2D(0.0, 0.0);
        harmonicStep.x = harmonicDist.x / (numberOfDivisions11);
        harmonicStep.y = harmonicDist.y / (numberOfDivisions11);
        phaseStep.x = phaseDist.x / 6.29;  // This is 2 * PI
        phaseStep.y = phaseDist.y / 6.29;
        amplitudeStep.x = amplitudeDist.x / 10.0;
        amplitudeStep.y = amplitudeDist.y / 10.0;

        var harmonicPoint = new MyPoint2D(0.0, 0.0);
        var spectralPoint1 = new MyPoint2D(0.0, 0.0);
        var spectralPoint2 = new MyPoint2D(0.0, 0.0);

        context03.strokeStyle = "#cf00cf";
        context03.lineWidth = 3;
        for( var i = 1; i < numberOfHarmonics + 1; ++i ){
            harmonicPoint.x = point1.x + harmonicStep.x * i;
            harmonicPoint.y = point1.y + harmonicStep.y * i;
            spectralPoint1.x = harmonicPoint.x + phaseStep.x * phaseArray[i - 1];
            spectralPoint1.y = harmonicPoint.y + phaseStep.y * phaseArray[i - 1];
            spectralPoint2.x = spectralPoint1.x + amplitudeStep.x * amplitudeArray[i - 1];
            spectralPoint2.y = spectralPoint1.y + amplitudeStep.y * amplitudeArray[i - 1];
            context03.moveTo(spectralPoint1.x, spectralPoint1.y);
            context03.lineTo(spectralPoint2.x, spectralPoint2.y);
            context03.arc(spectralPoint2.x, spectralPoint2.y, 2, 0, 2 * Math.PI, false);
        }
        context03.stroke();

        // Top and bottom plane surfaces
        context03.beginPath();
        context03.strokeStyle = "#0000cf";
        context03.lineWidth = 2;
        moveToLineTo(context03, point1, point2);
        moveToLineTo(context03, point4, point1);
        moveToLineTo(context03, point5, point6);
        moveToLineTo(context03, point8, point5);
        moveToLineTo(context03, point1, point5);
        context03.stroke();
        
        // Draw Text
        var xTextMargin1 = 90;
        var yTextMargin1 = 25;
        context03.beginPath();
        context03.font = "12pt Arial";
        context03.fillStyle = "#a52a2a";
        context03.textAlign = "left";
        context03.fillText("Spectral Profile", xTextMargin1, yTextMargin1);
        context03.stroke();
        
        context03.restore();

        drawHarmonicText(context03);
        drawHarmonicValuesText(context03);
        drawPhaseText(context03);
        drawPhaseValuesText(context03);
        drawAmplitudeText(context03);
        drawAmplitudeValuesText(context03);
    }

    function drawHarmonicText(context) {
        context03.save();
        context03.beginPath();
        context03.translate(235, 225);
        context03.rotate(-Math.PI / 14);
        context03.font = "12pt Arial";
        context03.fillStyle = "#a52a2a";
        context03.textAlign = "center";
        context03.fillText("Harmonic", 0, 0);
        context03.stroke();
        context03.restore();
    }

    function drawHarmonicValuesText(context) {
        context03.save();
        context03.beginPath();
        context03.font = "12pt Arial";
        context03.fillStyle = "#a52a2a";
        context03.textAlign = "center";
        context03.fillText("2", 160, 224);
        context03.fillText("4", 186, 217);
        context03.fillText("6", 216, 211);
        context03.fillText("8", 245, 204);
        context03.fillText("10", 273, 198);        
        context03.stroke();
        context03.restore();
    }

    function drawPhaseText(context) {
        context03.save();
        context03.beginPath();
        context03.font = "12pt Arial";
        context03.fillStyle = "#a52a2a";
        context03.translate(60, 220);
        context03.rotate(Math.PI / 6);
        context03.textAlign = "center";
        context03.fillText("Phase", 0, 0);
        context03.stroke();
        context03.restore();
    }

    function drawPhaseValuesText(context){
        context03.save();
        context03.beginPath();
        context03.font = "10pt Arial";
        context03.fillStyle = "#a52a2a";
        context03.textAlign = "center";
        context03.fillText("1.26", 95, 216);
        //context03.fillText("2.52", 81, 206);
        context03.fillText("3.78", 65, 196);
        //context03.fillText("5.04", 48, 186);
        context03.fillText("6.29", 33, 175);
        context03.stroke();
        context03.restore();
    }

    function drawAmplitudeText(context) {
        context03.save();
        context03.beginPath();
        context03.font = "12pt Arial";
        context03.fillStyle = "#a52a2a";
        context03.translate(20, 120);
        context03.rotate(-Math.PI / 2);
        context03.textAlign = "center";
        context03.fillText("Amplitude", 0, 0);
        context03.stroke();
        context03.restore();
    }

    function drawAmplitudeValuesText(context) {
        context03.save();
        context03.beginPath();
        context03.font = "12pt Arial";
        context03.fillStyle = "#a52a2a";
        context03.textAlign = "center";
        context03.fillText("2", 42, 155);
        context03.fillText("4", 42, 135);
        context03.fillText("6", 42, 115);
        context03.fillText("8", 42, 95);
        context03.fillText("10", 37, 75);
        context03.stroke();
        context03.restore();
    }
}());