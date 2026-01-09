@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script, v3.3.2
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set MVNW_VERBOSE=false
if not "%MVNW_VERBOSE%"=="" set MVNW_VERBOSE=%MVNW_VERBOSE%

set WRAPPER_DIR=%~dp0.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_PROPERTIES=%WRAPPER_DIR%\maven-wrapper.properties

if not exist "%WRAPPER_PROPERTIES%" (
  echo [mvnw] Missing "%WRAPPER_PROPERTIES%".
  exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("%WRAPPER_PROPERTIES%") do (
  if "%%A"=="wrapperUrl" set WRAPPER_URL=%%B
)

if not exist "%WRAPPER_JAR%" (
  echo [mvnw] Downloading Maven Wrapper jar...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$p='%WRAPPER_JAR%'; $u='%WRAPPER_URL%';" ^
    "New-Item -ItemType Directory -Force -Path (Split-Path $p) | Out-Null;" ^
    "Invoke-WebRequest -UseBasicParsing -Uri $u -OutFile $p"
  if errorlevel 1 (
    echo [mvnw] Failed to download Maven Wrapper jar from %WRAPPER_URL%
    exit /b 1
  )
)

set MAVEN_WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if "%JAVA_HOME%"=="" (
  set JAVA_EXE=java
) else (
  set JAVA_EXE=%JAVA_HOME%\bin\java.exe
)

"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" -Dmaven.multiModuleProjectDirectory="%~dp0." %MAVEN_WRAPPER_LAUNCHER% %*
endlocal

