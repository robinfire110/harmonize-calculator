
<p align="center">
  <img src="https://github.com/robinfire110/music-gig-app/blob/dev/client/src/img/logo-circle-white.png?raw=true"/>
</p>

# Harmonize Calculator
Website that allows user to calculate expenses for music gigs based on pay, travel, practice hours etc. The application is a cut down version of [Harmonize](https://github.com/robinfire110/music-gig-app), isolating the calculator feature and expanding on it.

The original Harmonize was developed by Andy Bonola, Craig Smith and Andy Villasmil for CSC 490.

## Developer Installation Setup
### Prerequisites
#### NodeJS
Can be downloaded [here](https://nodejs.org/en/download/). I set this up using the LTS version 20.11.1. 

#### Visual Studio Code 
Any IDE works theoretically though, that's just what I used

#### Local MySQL Server Setup 
If you want to run a local database instead of connecting to the remote one, here is how to do that.

You can download a local install of the server using [this link](https://dev.mysql.com/downloads/installer/). Here is a [quick video tutorial](https://www.youtube.com/watch?v=u96rVINbAUI) on how to set it up. It's slightly outdated, but it's mostly the same. You don't have to download MySQL Workbench if you don't want to. It's useful for viewing the database, but not required. For the local development database, set the password to ```password```. That is the password the code expects, so be sure to set it. Very insecure, but it doesn't matter for the local versions with fake data. 

Once you have the server installed, be sure to run ```CREATE DATABASE dev_db``` in the MySQL terminal in order to create the local database. If you're on Windows, you can use MySQL Workbench to run the command or open the MySQL Command Line Client that was installed with the server to run it. If you're on Linux, I think you can just run it straight through the terminal, but you may have to check to be sure.


## Initial Setup
1. In your IDE terminal, change your working directory to the "server" folder. In there run ```npm install```. That will install all the backend server packages.
2. Change your directory to the "client" folder and run the same command to install the front end packages.
3. Run the backend by changing your directory to the "server" folder and running ```npm run dev```. This will start the backend using nodemon. You can use ```npm run start``` to start node without nodemon.
4. Run the frontend by changing your directory to the "client" folder and running ```npm run start```. This will start the frontend, and open a new tab in your web browser showing the website's landing page.

## Database setup
You can use both a remote or local database to run the application. To use the local database, ensure you have a MySQL server set up on your computer as listed above. To use remote, ensure you have a .env file in the root directory with your database information. 

Lastly, to switch between the two, simply change the ```sequelize``` variable in ```/server/config/database.js``` to either ```local_database``` or ```remote_database```.

## Development Packages
I've found that there are several common packages that may make our lives a bit easier in the long run. It's a bit more learning we have to do up front, but I think it'll be worth it. Here's some information about the main ones (in alphabetical order).

* **[Axios](https://axios-http.com/)** - Used for HTTP requests.
* **Bcrypt** - For password hashing and checking.
* **[Cheerio](https://cheerio.js.org/)** - Used for webscraping. Specifically used to scrape the [AAA Daily Average Gas Price](https://gasprices.aaa.com/state-gas-price-averages/) to get gas prices.
* **[Express](https://expressjs.com/)** - This was already mentioned, but Express is very useful for settings up routes. The documentation is [here](https://expressjs.com/en/4x/api.html).
* **[ExcelJS](https://github.com/exceljs/exceljs)** - Used for exporting data to spreadsheets.

* **[Sequelize](https://sequelize.org/)** - A ORM (Object-Relational Mapping) that allows us to create and update the database using objects instead of SQL statements. There are several benefits to this. One, it makes our code for uniform (all JavaScript, no direct SQL statements). Two, it's more secure since the package takes care of vulnerabilities such as SQL Injection. And three, it can simplify some more complex queries and (hopefully) minimize errors that would arise from writing straight SQL. You can find the documentation [here](https://sequelize.org/docs/v7/models/defining-models/).

* **[Moment](https://momentjs.com/)** - Easier to use date and time manipulation and control objects. Use instead of built in JavaScript Date object. The documentation is [here](https://momentjs.com/docs/).

* **[React Bootstrap](https://react-bootstrap.netlify.app/) & [Bootstrap](https://getbootstrap.com/)** - For styling and formatting. Very useful.
* **[Joi](https://joi.dev/)** - Used for server-side data validation.
* **[JWT](https://jwt.io/)** - Session tokens for login and authentication.
* **[Nodemailer](https://nodemailer.com/)** - Used to send emails for various actions.

This is not a comprehensive list, there are several other minor ones that serve smaller roles. You can find the full list the package.json file.


## Resources

* **[API Documentation](https://documenter.getpostman.com/view/20451093/2sA2xcausW)** - This is the documentation for our internal API. It's made through Postman (which you don't have to use, that's just what I did). It has a list of all the requests you can make. We'll add more if needed and fix any errors as they appear.
* **Postman (or similar app)** - Postman allows you to test HTTP requests to make sure everything is functioning properly. For use with a localhost, you will have the download the app, which you can find [here](https://www.postman.com/downloads/).