# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

This is what the homepage of the app looks like. It gives access to all the shorted links created by the user.

!["The homepage of the app with all the links added by the user."](https://github.com/Shamayal/tinyapp/blob/main/docs/urls-page.png)

This is the id page which allows users to navigate to the shortened link they created or edit and update the URL provided.

!["The id page that allows users to navigate to the link and edit the URL."](https://github.com/Shamayal/tinyapp/blob/main/docs/id-edit-page.png)

Users can easily register for a free account to start shortening links.

!["The registration page."](https://github.com/Shamayal/tinyapp/blob/main/docs/register-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Use your terminal to clone this repository with the command `git clone git@github.com:Shamayal/tinyapp.git` in your VM or anywhere you would like to save it.
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` or `npm start`command.
- Create a new account by navigating to http://localhost:8080/register.
- Click `Create a New URL` from the navigation bar to create a shortened URL for a given link.
