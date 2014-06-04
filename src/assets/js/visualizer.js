var ZB = ZB || {};


ZB.AudioVisualizer = function(_audioContext, _visuals, _inputType, _audioFilePath)
{
    'use strict';
    // -----------------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------------
    var INPUT_MICROPHONE = 'microphone';
    var INPUT_AUDIOFILE  = 'audiofile';


    // -----------------------------------------------------------------------------
    // Attribute declaration
    // -----------------------------------------------------------------------------
    var m_audioContext  = null;
    var m_visuals       = null;
    var m_inputType     = '';
    var m_audioFilePath = '';
    var m_inputSource   = null;


    // -----------------------------------------------------------------------------
    // Attribute initialisation
    // -----------------------------------------------------------------------------
    {
        if (typeof(_audioContext)  === 'undefined') throw "Function parameter _audioContext is not defined!"; else m_audioContext  = _audioContext;
        if (typeof(_visuals)       === 'undefined') throw "Function parameter _visuals is not defined!";      else m_visuals       = _visuals;
        if (typeof(_inputType)     === 'undefined') throw "Function parameter _inputType is not defined!";    else m_inputType     = _inputType;

        if (typeof(_audioFilePath) === 'undefined' && _inputType === INPUT_AUDIOFILE) 
        {
            throw "Function parameter _audioFilePath is not defined!";
        }
        else
        {
             m_audioFilePath = _audioFilePath;
        }
    }


    function getSourceMicrophone()
    {
        if (navigator.webkitGetUserMedia) 
        {
            navigator.webkitGetUserMedia({audio: true}, successCallback, errorCallback);
        } 
        else 
        {
            alert('getUserMedia not supported');
        }

        function successCallback(_Stream) 
        {
            m_inputSource = m_audioContext.createMediaStreamSource(_Stream);
            internStart();
        }

        function errorCallback(_E)
        {
            // Log error
            console.log('Error: ' + _E);
        }
    };

    function getSourceAudioFile()
    {
        var Request = new XMLHttpRequest();

        Request.open("GET", m_audioFilePath, true);
        Request.responseType = "arraybuffer";

        Request.onload = function ()
        {
            m_audioContext.decodeAudioData(Request.response, function(Buffer)
            {
                m_inputSource = m_audioContext.createBufferSource();
                m_inputSource.buffer = Buffer;
                m_inputSource.start(0);

                internStart();
            });
        };

        Request.send();
    };

    function internStart()
    {
        m_inputSource.connect(m_audioContext.destination);

        // -----------------------------------------------------------------------------
        // Call draw method of all given visuals
        // -----------------------------------------------------------------------------
        for (var indexOfVisual = 0; indexOfVisual < m_visuals.length; indexOfVisual++)
        {
            m_visuals[indexOfVisual].draw(m_audioContext, m_inputSource);
        }
    };

    function start()
    {
        if (m_inputType === "microphone")
        {
            getSourceMicrophone();
        }
        else if (m_inputType === "audiofile")
        {
            getSourceAudioFile();
        }
    };


    // -----------------------------------------------------------------------------
    // Definition of the classes public part
    // -----------------------------------------------------------------------------
    return {
        start : start,
    };
}