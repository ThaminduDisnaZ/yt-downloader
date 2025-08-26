## Project Name

TubeSiphon

## Project Description

TubeSiphon is a web application built with Next.js, designed to help users download YouTube videos and audio, as well as provide AI-driven thumbnail recommendations.

**Key Features:**

- **YouTube Video and Audio Download:** Users can input a YouTube video URL and download the video in various formats and qualities, or extract the audio as an MP3.
- **AI Thumbnail Recommendations:** Leveraging AI, the application can suggest potential thumbnails for a video, helping content creators choose visually appealing options.

## Setup Guide

This guide will walk you through setting up and running the TubeSiphon project locally.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (LTS version recommended)
- npm or yarn (npm is included with Node.js)
- Git

### Installation

#### Obtain a RapidAPI Key

This project requires a RapidAPI key to utilize the video download functionality.

1. Go to the [RapidAPI website](https://rapidapi.com/).
2. Sign up for a free account if you don't have one.
3. Search for and subscribe to the **'Auto Download All In One (Big)'** API. You can find it [here](https://rapidapi.com/nguyenmanhict-MuTUtGWD7K/api/auto-download-all-in-one-big).
4. Obtain your API key from your RapidAPI dashboard. You will need this in the environment configuration step.

#### Environment Configuration

Create a file named `.env` in the root directory of the project and add the following line, replacing `YOUR_RAPIDAPI_KEY` with the API key you obtained from RapidAPI:



1. **Clone the repository:**



To get started, take a look at src/app/page.tsx.
