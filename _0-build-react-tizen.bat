@echo off

REM Check if node_modules folder exists, if not run npm install in new window
if not exist "node_modules" (
    echo node_modules folder not found, running npm install ...
    start /wait cmd /c "npm install"
    if errorlevel 1 (
        echo npm install failed.
        echo Press any key to exit...
        pause
        exit /b 1
    )
) else (
    echo node_modules folder found, skipping npm install.
)

REM Delete the .buildResult folder if it exists
if exist ".buildResult" (
    echo Deleting .buildResult folder ...
    rmdir /s /q ".buildResult"
)

REM npm run build tizenxpro-react
echo Running npm run build in tizenxpro-react ...
pushd tizenxpro-react
start /wait cmd /c "npm run build"
if errorlevel 1 (
    echo npm run build failed.
    echo Press any key to exit...
    pause
    popd
    exit /b 1
)
popd

REM Run tizen build-web with exclusions in new window, close after done
echo Starting tizen build-web ...
start /wait cmd /c "tizen build-web -e ".*" -e "*.bat" -e "gulpfile.babel.js" -e "tizenxpro-react/*" -e "README.md" -e "node_modules/*" -e "package*.json" -e "yarn.lock""
if errorlevel 1 (
    echo Error during tizen build-web.
    echo Press any key to exit...
    pause
    exit /b 1
)

echo Build-web finished.

REM Copy contents of www (files and folders) into .buildResult
echo Copying contents from www to .buildResult ...
xcopy /s /e /y "tizenxpro-react\www\*" ".buildResult\"
echo Copy done.

REM Run tizen package command in new window, close after done
echo Creating package with tizen package ...
start /wait cmd /c "tizen package -t wgt -o . -- .buildResult"
if errorlevel 1 (
    echo Error during tizen package.
    echo Press any key to exit...
    pause
    exit /b 1
)

echo Done!
pause