////////////////////////////////////////////////////////////////////////////////
/// Below you can see an example visual object
/// To create a new visual just implement this given interface below and you can
/// use your own visual within the visualizer
////////////////////////////////////////////////////////////////////////////////
/*
function ExampleVisual(_CanvasId)
{
    // -----------------------------------------------------------------------------
    // A visual has to implement this draw method
    // -----------------------------------------------------------------------------
    this.draw = function(_AudioContext, _InputSource)
    {
        // -----------------------------------------------------------------------------
        // Create and connect some AudioNodes here
        // See other visuals for reference
        // -----------------------------------------------------------------------------



        // -----------------------------------------------------------------------------
        // This function will be called every frame
        // -----------------------------------------------------------------------------
        (function update ()
        {
            // -----------------------------------------------------------------------------
            // Do some fancy visualisation stuff here
            // -----------------------------------------------------------------------------

            window.webkitRequestAnimationFrame(update);
        })();
    }
};
*/


function BarVisual(_CanvasId)
{
    "use strict";
    var Canvas          = document.getElementById(_CanvasId);
    var CanvasContext   = Canvas.getContext('2d');
    var CanvasWidth     = Canvas.width  = 1500;
    var CanvasHeight    = Canvas.height = 450;
    var HalfCanvasWidth = CanvasWidth / 2;
    var NumberOfRows    = 1;
    var RowHeight       = CanvasHeight / NumberOfRows;


    var CanvasShadow          = document.getElementById('EqualizerViewShadow');
    var CanvasShadowContext   = CanvasShadow.getContext('2d');
    CanvasShadow.width        = 1500;
    CanvasShadow.height       = 450;


    var LogoImage       = document.getElementById('Logo');

    var NumberOfBars    = 16;
    var BarWidth        = Math.round(HalfCanvasWidth / NumberOfBars);
    var BarSpace        = 5;

    var MaxNumberOfHorizontalBars = 25;
    var HorizontalBarSpace        = 4;
    var HorizontalBarHeight       = Math.round(RowHeight / MaxNumberOfHorizontalBars);

    var BaseBarColor    = { R: 255, G: 0, B: 75,  A: 1 };
    var ColorStep       = Math.round(150 / NumberOfBars);

    var MagnitudeMax    = 255; // 8 bit = 0 - 255 values
    var FFTSamples      = 2048;



    this.draw = function(_AudioContext, _InputSource)
    {
        // Create an analyser node
        var AnalyserNode = _AudioContext.createAnalyser();
        AnalyserNode.fftSize = FFTSamples;
        AnalyserNode.smoothingTimeConstant = 0.5;

        _InputSource.connect(AnalyserNode);



        var BarIndicesLeft  = new Array(NumberOfBars);
        var BarIndicesRight = new Array(NumberOfBars);

        for (var Index = 0; Index < NumberOfBars; Index++)
        {
            BarIndicesLeft[Index] = Index;
            BarIndicesRight[Index] = Index;
        }

        //shuffleArray(BarIndicesLeft);
        //shuffleArray(BarIndicesRight);



        function update ()
        {
            var FreqByteData = new Uint8Array(AnalyserNode.frequencyBinCount);
            AnalyserNode.getByteFrequencyData(FreqByteData);
            AnalyserNode.smoothingTimeConstant = 0.8;


            var Multiplier = AnalyserNode.frequencyBinCount / NumberOfBars;

            // Clear previous canvas content
            CanvasContext.clearRect(0, 0, CanvasWidth, CanvasHeight);


            for(var IndexOfRow = 1; IndexOfRow <= NumberOfRows; IndexOfRow++)
            {
                // A local color object for each frame
                var BarColor =
                {
                    R: BaseBarColor.R,
                    G: BaseBarColor.G,
                    B: BaseBarColor.B,
                    A: BaseBarColor.A
                };


                // Draw rectangle for each frequency bin.
                for (var IndexOfBar = 0; IndexOfBar < NumberOfBars; ++IndexOfBar) 
                {
                    var Magnitude = 0;
                    var Offset    = Math.floor(IndexOfBar * Multiplier);

                    // Get the sum of a block, or we miss narrow-bandwidth spikes
                    for (var IndexOfSum = 0; IndexOfSum < Multiplier; IndexOfSum++)
                    {
                        Magnitude += FreqByteData[Offset + IndexOfSum];
                    }
                    
                    // Caluculate and clamp the magnitude
                    Magnitude = Magnitude / Multiplier;

                    // Scale the magnitude values to the row height
                    Magnitude = RowHeight * Magnitude / MagnitudeMax;


                    BarColor.R -= ColorStep;
                    BarColor.G -= ColorStep;
                    //BarColor.B -= ColorStep;

                    CanvasContext.fillStyle = rgbaToString(BarColor);



                    CanvasContext.fillRect(HalfCanvasWidth - (BarIndicesLeft[IndexOfBar] + 1) * BarWidth, RowHeight * IndexOfRow, BarWidth - BarSpace, -Magnitude);
                    CanvasContext.fillRect(HalfCanvasWidth +  BarIndicesRight[IndexOfBar]     * BarWidth, RowHeight * IndexOfRow, BarWidth - BarSpace, -Magnitude);


                    var NumberOfHorizontalBars = Math.floor(Magnitude / HorizontalBarHeight);

                    // Create horizontal bar spacing
                    for (var IndexOfHorizontalBar = 1; IndexOfHorizontalBar <= NumberOfHorizontalBars; IndexOfHorizontalBar++) 
                    {
                        CanvasContext.clearRect(HalfCanvasWidth - (BarIndicesLeft[IndexOfBar] + 1) * BarWidth, RowHeight * IndexOfRow - HorizontalBarHeight * IndexOfHorizontalBar, BarWidth - BarSpace, HorizontalBarSpace);
                        CanvasContext.clearRect(HalfCanvasWidth +  BarIndicesRight[IndexOfBar]     * BarWidth, RowHeight * IndexOfRow - HorizontalBarHeight * IndexOfHorizontalBar, BarWidth - BarSpace, HorizontalBarSpace);
                    
                    }
                }

                // LogoImage.height = RowHeight;
                // LogoImage.width  = RowHeight;

                // var PositionX = (CanvasWidth / 2) - (LogoImage.width  / 2);
                // var PositionY = RowHeight * (IndexOfRow - 1);

                // CanvasContext.drawImage(LogoImage, PositionX, PositionY, RowHeight, RowHeight);


                // Draw Shadow
                CanvasShadowContext.clearRect(0, 0, CanvasWidth, CanvasHeight);
                CanvasShadowContext.drawImage(Canvas, 0, 0, CanvasWidth, CanvasHeight);
            }  
        }
        setInterval(update, 30);
    };
}

function CircleVisual(_CanvasId)
{
    "use strict";
    var Canvas          = document.getElementById(_CanvasId);
    var CanvasContext   = Canvas.getContext('2d');
    var CanvasWidth     = Canvas.width  = 1200;
    var CanvasHeight    = Canvas.height = 1000;

    //var LogoImage       = document.getElementById('Logo');

    var NumberOfRows    = 1;
    var RowHeight       = CanvasHeight / NumberOfRows;

    var NumberOfBars    = 10;
    var AngleStep       = (Math.PI / 2) / NumberOfBars;
    var BarSpace        = 0.005;

    var NumberOfNuances = 15;

    var BaseBarColor    = { R: 13, G: 255, B: 151,  A: 1 };
    var ColorStep       = 15;

    var MagnitudeMax    = 255; // 8 bit = 0 - 255 values
    var FFTSamples      = 2048;



    this.draw = function(_AudioContext, _InputSource)
    {
        // Create an analyser node
        var AnalyserNode = _AudioContext.createAnalyser();
        AnalyserNode.fftSize = FFTSamples;

        _InputSource.connect(AnalyserNode);



        function update ()
        {
            var FreqByteData = new Uint8Array(AnalyserNode.frequencyBinCount);
            AnalyserNode.getByteFrequencyData(FreqByteData);
            AnalyserNode.smoothingTimeConstant = 0.7;


            var Multiplier = AnalyserNode.frequencyBinCount / NumberOfBars;

            // Clear previous canvas content
            CanvasContext.clearRect(0, 0, CanvasWidth, CanvasHeight);


            for(var IndexOfRow = 1; IndexOfRow <= NumberOfRows; IndexOfRow++)
            {
                // A local color object for each frame
                var BarColor =
                {
                    R: BaseBarColor.R,
                    G: BaseBarColor.G,
                    B: BaseBarColor.B,
                    A: BaseBarColor.A
                };


               
                for (var IndexOfBar = 0; IndexOfBar < NumberOfBars; IndexOfBar++) 
                {
                    var Magnitude = 0;
                    var Offset    = Math.floor(IndexOfBar * Multiplier);

                    // Get the sum of a block, or we miss narrow-bandwidth spikes
                    for (var IndexOfSum = 0; IndexOfSum < Multiplier; IndexOfSum++)
                    {
                        Magnitude += FreqByteData[Offset + IndexOfSum];
                    }
                    
                    // Caluculate and clamp the magnitude
                    Magnitude = Magnitude / Multiplier;
                    //Magnitude = Math.min(Math.max(Magnitude, MagnitudeMin), MagnitudeMax);

                    // Scale the magnitude values to the canvaswidth
                    Magnitude = 0.6 * CanvasWidth * Magnitude / MagnitudeMax;


                    BarColor.R -= ColorStep;
                    BarColor.G -= ColorStep;
                    BarColor.B -= ColorStep;
                    BarColor.A = 1;


                    var CenterX     = CanvasWidth / 2;
                    var CenterY     = (RowHeight * IndexOfRow) / 2;
                    var Radius      = Magnitude + 50;

                    var StartAngle  = IndexOfBar       * AngleStep + BarSpace;
                    var EndAngle    = (IndexOfBar + 1) * AngleStep;

                    var RadiusStep  = Math.round(Radius / NumberOfNuances);
                    var NuanceStep  = BarColor.A / NumberOfNuances;

                    for (var IndexOfNuanceRight = 1; IndexOfNuanceRight <= NumberOfNuances; IndexOfNuanceRight++)
                    {
                        // lower-right
                        CanvasContext.beginPath();
                        CanvasContext.arc(CenterX, CenterY, RadiusStep * IndexOfNuanceRight, StartAngle, EndAngle, false);
                        CanvasContext.lineTo(CenterX, CenterY);
                        CanvasContext.closePath();

                        CanvasContext.fillStyle = rgbaToString(BarColor);
                        CanvasContext.fill();

                        // upper right
                        CanvasContext.beginPath();
                        CanvasContext.arc(CenterX, CenterY, RadiusStep * IndexOfNuanceRight, -StartAngle, -EndAngle, true);
                        CanvasContext.lineTo(CenterX, CenterY);
                        CanvasContext.closePath();

                        CanvasContext.fillStyle = rgbaToString(BarColor);
                        CanvasContext.fill();

                        BarColor.A -= NuanceStep;
                    }

                    

                    BarColor.A = 1;

                    StartAngle  += Math.PI;
                    EndAngle    += Math.PI;

                    for (var IndexOfNuanceLeft = 1; IndexOfNuanceLeft <= NumberOfNuances; IndexOfNuanceLeft++)
                    {
                        // upper left
                        CanvasContext.beginPath();
                        CanvasContext.arc(CenterX, CenterY, RadiusStep * IndexOfNuanceLeft, StartAngle, EndAngle, false);
                        CanvasContext.lineTo(CenterX, CenterY);
                        CanvasContext.closePath();

                        CanvasContext.fillStyle = rgbaToString(BarColor);
                        CanvasContext.fill();


                        // upper left
                        CanvasContext.beginPath();
                        CanvasContext.arc(CenterX, CenterY, RadiusStep * IndexOfNuanceLeft, -StartAngle, -EndAngle, true);
                        CanvasContext.lineTo(CenterX, CenterY);
                        CanvasContext.closePath();

                        CanvasContext.fillStyle = rgbaToString(BarColor);
                        CanvasContext.fill();

                        BarColor.A -= NuanceStep;
                    }                    
                }

                // LogoImage.height = RowHeight;
                // LogoImage.width  = RowHeight;

                // var PositionX = (CanvasWidth / 2) - (LogoImage.width  / 2);
                // var PositionY = RowHeight * (IndexOfRow - 1);

                // CanvasContext.drawImage(LogoImage, PositionX, PositionY, RowHeight, RowHeight);
            }
        }
        setInterval(update, 30);
    };
}

function VolumeMeter(_CanvasId)
{
    "use strict";
    var Canvas          = document.getElementById(_CanvasId);
    var CanvasContext   = Canvas.getContext('2d');
    var CanvasWidth     = Canvas.width  = 1024;
    var CanvasHeight    = Canvas.height = 256;
    var NumberOfRows    = 4;
    var RowHeight       = CanvasHeight / NumberOfRows;
    var ClearColor      = { R: 255, G: 255, B: 255,  A: 1 };

    var NumberOfBars    = 10;
    var BarWidth        = Math.round(CanvasWidth / NumberOfBars);
    var BarSpace        = 10;

    var MaxNumberOfHorizontalBars = 10;
    var HorizontalBarSpace        = 2;
    var HorizontalBarHeight       = Math.round(RowHeight / MaxNumberOfHorizontalBars);

    var MagnitudeMax    = 255; // 8 bit = 0 - 255 values
    var FFTSamples      = 2048;



    // -----------------------------------------------------------------------------
    // A visual has to implement this draw method
    // -----------------------------------------------------------------------------
    this.draw = function(_AudioContext, _InputSource)
    {
        // -----------------------------------------------------------------------------
        // Create and connect some AudioNodes here
        // See other visuals for reference
        // -----------------------------------------------------------------------------
        var AnalyserNode = _AudioContext.createAnalyser();
        AnalyserNode.fftSize = FFTSamples;

        _InputSource.connect(AnalyserNode);


        // -----------------------------------------------------------------------------
        // This function will be called every frame
        // -----------------------------------------------------------------------------
        function update ()
        {
            // -----------------------------------------------------------------------------
            // Do some fancy visualisation stuff here
            // -----------------------------------------------------------------------------
            var FreqByteData = new Uint8Array(AnalyserNode.frequencyBinCount);
            AnalyserNode.getByteFrequencyData(FreqByteData);
            
            var AverageVolume = getAverage(FreqByteData);
            AverageVolume = RowHeight * AverageVolume / MagnitudeMax;

            // Clear
            
            CanvasContext.fillStyle = rgbaToString(ClearColor);
            CanvasContext.clearRect(0, 0, CanvasWidth, CanvasHeight);

           

            for(var IndexOfRow = 1; IndexOfRow <= NumberOfRows; IndexOfRow++)
            {
                var Gradient = CanvasContext.createLinearGradient(0, RowHeight * IndexOfRow, 0, RowHeight * (IndexOfRow-1));
                Gradient.addColorStop(0,  '#25BA28');
                Gradient.addColorStop(0.4,  '#D8F000');
                Gradient.addColorStop(0.9, '#C72020');

                CanvasContext.fillStyle = Gradient;

                for (var IndexOfBar = 0; IndexOfBar < NumberOfBars; ++IndexOfBar) 
                {
                    CanvasContext.fillRect(IndexOfBar * BarWidth, RowHeight * IndexOfRow, BarWidth - BarSpace, -AverageVolume);              
                    


                    var NumberOfHorizontalBars = Math.floor(AverageVolume / HorizontalBarHeight);

                    for (var IndexOfHorizontalBar = 1; IndexOfHorizontalBar <= NumberOfHorizontalBars; IndexOfHorizontalBar++) 
                    {
                        CanvasContext.clearRect(IndexOfBar * BarWidth, RowHeight * IndexOfRow - HorizontalBarHeight * IndexOfHorizontalBar, BarWidth - BarSpace, HorizontalBarSpace);
                    }
                } 
            }
        }
        setInterval(update, 30);
    };

    function getAverage(_Array)
    {
        var Sum            = 0;
        var NumberofVAlues = _Array.length;

        for (var Index = 0; Index < NumberofVAlues; Index++)
        {
            Sum += _Array[Index];
        }

        return Sum / NumberofVAlues;
    }
}

function WaveVisual(_CanvasId)
{
    "use strict";
    var Canvas          = document.getElementById(_CanvasId);
    var CanvasContext   = Canvas.getContext('2d');
    var CanvasWidth     = Canvas.width  = 1024;
    var CanvasHeight    = Canvas.height = 256;
    var NumberOfRows    = 1;
    var RowHeight       = CanvasHeight / NumberOfRows;
    var HalfRowHeight   = RowHeight / 2;
    var LogoImage       = document.getElementById('Logo');

    var BarColor   = { R: 240, G: 215, B: 165,  A: 1 };


    var BarWidth        = 1;
    var BarSpace        = 0;
    var NumberOfBars    = CanvasWidth / BarWidth;

    var MagnitudeMax    = 255; // 8 bit = 0 - 255 values
    var FFTSamples      = 2048;



    // -----------------------------------------------------------------------------
    // A visual has to implement this draw method
    // -----------------------------------------------------------------------------
    this.draw = function(_AudioContext, _InputSource)
    {
        // -----------------------------------------------------------------------------
        // Create and connect some AudioNodes here
        // See other visuals for reference
        // -----------------------------------------------------------------------------
        var AnalyserNode = _AudioContext.createAnalyser();
        AnalyserNode.fftSize = FFTSamples;
        AnalyserNode.smoothingTimeConstant = 0.2;

        _InputSource.connect(AnalyserNode);


        // -----------------------------------------------------------------------------
        // This function will be called every frame
        // -----------------------------------------------------------------------------
        function update ()
        {
            // -----------------------------------------------------------------------------
            // Do some fancy visualisation stuff here
            // -----------------------------------------------------------------------------
            var FreqTimeData = new Uint8Array(AnalyserNode.frequencyBinCount);
            AnalyserNode.getByteTimeDomainData(FreqTimeData);

            var TimeBlockSize = Math.floor(FreqTimeData.length / NumberOfBars);

            // Clear
            CanvasContext.clearRect(0, 0, CanvasWidth, CanvasHeight);

           

            for(var IndexOfRow = 1; IndexOfRow <= NumberOfRows; IndexOfRow++)
            {
                for (var IndexOfBar = 0; IndexOfBar < NumberOfBars; IndexOfBar++)
                {
                    // var MagicNumber = Math.random();

                    // var RandomColor = 
                    // {
                    //     R: Math.round(BarColor.R * MagicNumber),
                    //     G: Math.round(BarColor.G * MagicNumber),
                    //     B: Math.round(BarColor.B * MagicNumber),
                    //     A: BarColor.A
                    // };

                    var RandomColor = 
                    {
                        R: BarColor.R,
                        G: BarColor.G,
                        B: BarColor.B,
                        A: BarColor.A
                    };

                    var Magnitude = FreqTimeData[IndexOfBar * TimeBlockSize];
                    Magnitude = HalfRowHeight * Magnitude / MagnitudeMax;

                    CanvasContext.fillStyle = rgbaToString(RandomColor);
                    CanvasContext.fillRect(IndexOfBar * BarWidth, RowHeight * IndexOfRow - HalfRowHeight - Magnitude, BarWidth - BarSpace, -2);

                    CanvasContext.fillStyle = rgbaToString(RandomColor);
                    CanvasContext.fillRect(IndexOfBar * BarWidth, RowHeight * IndexOfRow - HalfRowHeight + Magnitude, BarWidth - BarSpace, 2);
                }

                LogoImage.height = RowHeight;
                LogoImage.width  = RowHeight;

                var PositionX = (CanvasWidth / 2) - (LogoImage.width  / 2);
                var PositionY = RowHeight * (IndexOfRow - 1);

                CanvasContext.drawImage(LogoImage, PositionX, PositionY, RowHeight, RowHeight);
            }
        }
        setInterval(update, 30);
    };
}

function GrowingCirclesVisual(_CanvasId)
{
    "use strict";
    var Canvas          = document.getElementById(_CanvasId);
    var CanvasContext   = Canvas.getContext('2d');
    var CanvasWidth     = Canvas.width  = 1204;
    var CanvasHeight    = Canvas.height = 450;
    var NumberOfRows    = 1;
    var RowHeight       = CanvasHeight / NumberOfRows;

    var InitialRadius   = 50;
    var NumberOfCircles = 0;
    var Circles         = new Array();

    var MagnitudeMax    = 255; // 8 bit = 0 - 255 values
    var FFTSamples      = 2048;


    // -----------------------------------------------------------------------------
    // A visual has to implement this draw method
    // -----------------------------------------------------------------------------
    this.draw = function(_AudioContext, _InputSource)
    {
        // -----------------------------------------------------------------------------
        // Create and connect some AudioNodes here
        // See other visuals for reference
        // -----------------------------------------------------------------------------
        var AnalyserNode = _AudioContext.createAnalyser();
        AnalyserNode.fftSize = FFTSamples;

        _InputSource.connect(AnalyserNode);


        // -----------------------------------------------------------------------------
        // This function will be called every frame
        // -----------------------------------------------------------------------------
        function update ()
        {
            // -----------------------------------------------------------------------------
            // Do some fancy visualisation stuff here
            // -----------------------------------------------------------------------------
            var FreqByteData = new Uint8Array(AnalyserNode.frequencyBinCount);
            AnalyserNode.getByteFrequencyData(FreqByteData);
            
            var AverageVolume = getAverage(FreqByteData);
            AverageVolume = RowHeight * AverageVolume / MagnitudeMax;

            // Clear
            CanvasContext.clearRect(0, 0, CanvasWidth, CanvasHeight);


            var CenterX     = CanvasWidth  / 2;
            var CenterY     = CanvasHeight / 2;
           
            Circles.splice(0, 0, AverageVolume);

            for (var Index = 0; Index < Circles.length; Index++)
            {
                CanvasContext.beginPath();
                CanvasContext.arc(CenterX, CenterY, Circles[Index], 0, 2 * Math.PI, false);
                CanvasContext.closePath();

                CanvasContext.strokeStyle = '#FFFFFF'
                CanvasContext.lineWidth = 0.5;
                CanvasContext.stroke();

                Circles[Index] += 10;

                // Remove to big circles
                if (Circles[Index] >= CanvasWidth)
                {
                    Circles.pop();
                }
            }
        }
        setInterval(update, 10);
    };

    function getAverage(_Array)
    {
        var Sum            = 0;
        var NumberofVAlues = _Array.length;

        for (var Index = 0; Index < NumberofVAlues; Index++)
        {
            Sum += _Array[Index];
        }

        return Sum / NumberofVAlues;
    }
}



////////////////////////////////////////////////////////////////////////////////
/// Simple helper function to generate a string out of a rgba object
////////////////////////////////////////////////////////////////////////////////
function rgbaToString(_RgbaObject)
{
    "use strict";
    return "rgba(" + _RgbaObject.R + "," + _RgbaObject.G + "," + _RgbaObject.B + "," + _RgbaObject.A +")";
}

////////////////////////////////////////////////////////////////////////////////
/// Simple helper function to shuffle an array
////////////////////////////////////////////////////////////////////////////////
function shuffleArray(_Array)
{
    "use strict";
    for (var Index = _Array.length - 1; Index >= 1; Index--)
    {
        var RandomIndex = createRandomNumber(0, Index);

        // Swap
        var Tmp             = _Array[Index];
        _Array[Index]       = _Array[RandomIndex];
        _Array[RandomIndex] = Tmp;
    }
}

////////////////////////////////////////////////////////////////////////////////
/// Simple helper function to crate a random number between _Low and _High boundaries
////////////////////////////////////////////////////////////////////////////////
function createRandomNumber(_Low, _High)
{
    "use strict";
    _High++;
    return Math.floor((Math.random() * (_High - _Low) + _Low));
}
