
<p align="center">
  <img src="https://github.com/robinfire110/music-gig-app/blob/dev/client/src/img/logo-circle-white.png?raw=true"/>
</p>

# Harmonize Calculator - [harmnize.com](harmnize.com)
Harmonize Calculator allows the user to calculate expenses for music gigs based on pay, travel, practice hours etc. Outside of the basic calculation, the apps has several other features...
* Automatic calculation of travel distance and time using Google Maps API.
* Database of up-to-date average gas prices using the [AAA Daily Average Site](https://gasprices.aaa.com/state-gas-price-averages/).
* Ability to export calculations as a functional Excel spreadsheet.
* Signing in with Google SSO allowing you to save calculations, manage previous results, export multiple results into one spreadsheet and set calculator default values.

The application is a cut down version of [Harmonize](https://github.com/robinfire110/music-gig-app), isolating the calculator feature and expanding on it. The original Harmonize was developed by Andy Bonola, Craig Smith and Andy Villasmil as a Senior Capstone project. The work to spin it off into this project was done by Andy Villasmil (robinfire110).

## How to Use
1. Start by inputting your Pay per gig and Hours per gig to get a basic hourly wage.
2. Add more information about your gig such as travel, additional hours, tax or any other expenses.
3. Save your results to your account or export them to a spreasheet by clicking the Save or Export buttons.

## Tips
* You can turn individual fields on/off to see how they affect your final result.
* Have multiple gigs or services? Use the Number of Gigs option to multiply your values. Use the Options button to change which fields get multiplied depending on your needs.
* Don't know the exact distance of the gig? Click the Use Location button to automatically calculate your travel mileage and hours using zip codes.
* Don't know your exact gas price per mile? Click the Use Average button to use average gas prices and vehicle MPG values.

## Issues
If you have any issues or feature requests, please submit it on the [issues page](https://github.com/robinfire110/harmonize-calculator/issues).

## Privacy Policy
If you make an account using Google, Harmonize Calculator will store your email for authentication purposes. No other data from your Google account is stored (such as name, location or password). All other user data (saved calculations and default settings) will be stored in our database and will not be shared with any third party. General, non-user specific aggregate data may be looked over for statistical purposes (i.e. total number of registered users or saved calculations) to monitor the usage of the application.

If you wish to delete your account and all associated data, you can do so at any time in the Account page. If you lose access to your Google account and wish for your data to be deleted, please let a the developer know (by contacting them or submitting an issue) and they will assist you.

# Versions
## Version 1.0.0
* Spin-Off from original Harmonize. Removed all non-calculator related features.
* Added Google SSO, removed email and password login.
* Added Trip Number (instead of Trip Type).
* Added Calculator Defaults.
* Added search to Saved Calculations on Calculator screen.
* Updated footer and added About Modal.