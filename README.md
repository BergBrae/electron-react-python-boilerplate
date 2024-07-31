# electron-react-python-boilerplate

This is a fork of https://github.com/electron-react-boilerplate/electron-react-boilerplate that includes a python backend and react-bootstrap. The backend must be compiled with `npm run build:backend` before the app can consume it in dev or packaged. The compiled backend is started from the main electron process. Currently only works on windows.

The current technique for starting/exiting the compiled python is rough and could use improvement.

`npm  run build:backend` assumes there is a python venv named `python-env` in /backend.
