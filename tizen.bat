@echo off
goto :main

:readInfo
    set sdkInfoPath=%SCRIPT_PATH%\..\..\..\sdk.info
    set JDK_PATH=%SCRIPT_PATH%\..\..\..\jdk

    rem extracting the paths from sdk.info
    for /F "delims=" %%a in (!sdkInfoPath!) do (
        set paths=%%a
        for /f "tokens=1,2 delims==" %%b in ("!paths!") do (
            if %%b==TIZEN_SDK_DATA_PATH (
                set sdkDataPath=%%c
            )
            if %%b==JDK_PATH (
                set sdkInfoJDKPath=%%c
            )
            if %%b==TIZEN_SDK_INSTALLED_PATH (
                set sdkPath=%%c
            )
        )		
    )
    goto :eof

:createLogFile
    set hour=%time:~0,2%
    if "%hour:~0,1%" == " " set hour=0%hour:~1,1%

    set min=%time:~3,2%
    if "%min:~0,1%" == " " set min=0%min:~1,1%

    set secs=%time:~6,2%
    if "%secs:~0,1%" == " " set secs=0%secs:~1,1%

    set year=%date:~-4%
    set month=%date:~3,2%
    if "%month:~0,1%" == " " set month=0%month:~1,1%
    set day=%date:~0,2%
    if "%day:~0,1%" == " " set day=0%day:~1,1%

    set fileName=cli%year%%month%%day%%hour%%min%%secs%.txt
    set "logFilePath=%sdkDataPath%\cli\logs"
    if not exist %logFilePath% (
        mkdir "%logFilePath%"
    )
    set "logFile=%logFilePath%\%fileName%"
    set logFileCreated=true
    goto :eof

:updateLogFile
    if !logFileCreated!==false (
        call :createLogFile
    )
    call echo %1>>!logFile!
    goto :eof

:setExecPath
    set "logFileCreated=false"
    if exist "%sdkInfoJDKPath%" (
        set JDK_PATH=%sdkInfoJDKPath%
        call :updateLogFile "Using Sdk.info java at !JDK_PATH!"
    ) else (
        if not !sdkInfoJDKPath!==!emptyVar! (
            call :updateLogFile "Jdk specified in sdk.info:!sdkInfoJDKPath! does not exist."
        )
    )
    if not exist "!JDK_PATH!" (
        set javaExec=java
        call :updateLogFile "Using System java"
    ) else (
        set javaExec=!JDK_PATH!\bin\java
    )
    goto :eof

:main
    setlocal enableDelayedExpansion

    REM --- SCRIPT_PATH FIX SET TO ABSOLUTE PATH ---
    set SCRIPT_PATH=C:\tizen-studio\tools\ide\bin

    set CURRENT_WORKSPACE_PATH=%cd%
    set LIB_PATH=%SCRIPT_PATH%\..\lib-ncli
    set CONFIG_PATH=%SCRIPT_PATH%\..\conf-ncli
    set LOG_CONF_FILE=log4j-progress.xml
    set LOG_OPT=-Dlog4j.configurationFile=%LOG_CONF_FILE%

    set HAVE_ARGS=false
    set CLASSPATH=
    set ARGS=

    call:ARGS_SHIFT %*
    call:ARGS_CHECK %*
    call:_run_command %*
    goto :END_STEP

:ARGS_SHIFT
    if [%1]==[] goto AFTER_LOOP
    set ARGS=%ARGS% %1
    set HAVE_ARGS=true
    SHIFT
    goto ARGS_SHIFT

:AFTER_LOOP
    goto :END_STEP

:ARGS_CHECK
    if %HAVE_ARGS% == true goto ADD_ARGS
    goto REMOVE_ARGS
    goto :END_STEP

:ADD_ARGS
    set ARGS=%ARGS% --current-workspace-path "%CURRENT_WORKSPACE_PATH%"
    goto :END_STEP

:REMOVE_ARGS
    set ARGS=
    goto :END_STEP

:_run_command
    FOR /f "tokens=*" %%i IN ('dir %LIB_PATH% /B') DO ( call:CONCAT %LIB_PATH%\%%i )
    set MAIN=org.tizen.ncli.ide.shell.Main

:_setting_fallbacks
    call :readInfo
    call :setExecPath

    set SDK_UTILS_PATH=%SCRIPT_PATH%\..\..\..\library\sdk-utils-core.jar;
    set EXEC="%javaExec%" %LOG_OPT% -Djava.library.path=%LIB_PATH%\spawner -cp %CONFIG_PATH%;%CLASSPATH%;%SDK_UTILS_PATH% %MAIN% %ARGS%
    %EXEC%
    goto :END_STEP

:CONCAT
    set CLASSPATH=%CLASSPATH%%1;
    goto :END_STEP

:END_STEP
    exit /b %ERRORLEVEL%
