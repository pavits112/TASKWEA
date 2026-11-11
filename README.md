# TASKWEA
# TASKWEA

AskWeather is a small personal dashboard for weather, tasks, and quick searches.

## Features

- Responsive dashboard layout
- Light and dark themes
- Weather lookup through a Vercel serverless API
- City autocomplete with state and country suggestions
- Recent city shortcuts saved locally
- Refresh button and keyboard navigation for suggestions
- Animated gradient background and live clock
- Browser location support and share-to-clipboard weather
- Quick integrations for GitHub, YouTube, Spotify, Reddit, and Calendar
- Keyboard shortcuts: `/` search, `W` weather, `T` tasks
- Time-based button gradients that change through the day
- Built-in 25-minute focus timer
- Five-day weather forecast
- Autosaving local scratchpad notes
- Live GitHub profile statistics
- Daily local check-in streak
- Command palette with Ctrl/Cmd + K
- Developer integrations for Stack Overflow, MDN, npm, CodePen, Roadmap.sh, and Figma
- Quick profile links for GitHub and LinkedIn
- Celsius and Fahrenheit toggle
- Weather details for temperature, feels-like, humidity, and wind
- Todo list saved in local storage
- Quick links and keyboard-friendly search shortcuts
- Reduced-motion and accessible form support

## Weather setup

Weather uses Open-Meteo's free geocoding and forecast APIs, so no API key or environment variable is required. The API endpoint is `/api/weather?city=Delhi`.

## Run locally

This is a static project, so it can be opened directly in a browser or served with any static server:

```bash
npx serve .
```

## Search shortcuts

- `-d query` opens DuckDuckGo
- `-y query` opens YouTube
- `-w query` opens Wikipedia
- `-r query` searches Reddit
- `-h query` searches Wallhaven

## Deployment

The project can be deployed directly to Vercel as a static site with no build command.