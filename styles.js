import { StyleSheet } from 'react-native';

const createStyles = ( fontSize, isGreyscale ) => {

  let titleTextSize = 36;
  let buttonTextSize = 32;

  if (fontSize === "Small") {
    titleTextSize = 28;
    buttonTextSize = 24;
  } else if (fontSize === "Medium") {
    titleTextSize = 32;
    buttonTextSize = 28;
  } else if (fontSize === "Large") {
    titleTextSize = 36;
    buttonTextSize = 32;
  }

  let topBannerColor = 'pink';
  let buttonColor = 'red';
  let buttonColorToggled = 'blue';
  let bottomButtonColor = 'maroon';

  if (isGreyscale === true) {
    topBannerColor = 'lightgrey'
    buttonColor = 'darkgrey';
    buttonColorToggled = 'black';
    bottomButtonColor = 'grey';
  }

  return styles = StyleSheet.create({ 
      container: { // GENERAL CONTAINER
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      buttonText: { // BUTTON TEXT
        fontSize: buttonTextSize,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      topBanner: { // TOP BANNER CONTAINER
        width: '100%',
        height: '12.5%', // 1/8 of vertical screenspace
        backgroundColor: topBannerColor, 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '1%',
      },
      titleText: { // TOP BANNER TEXT
        fontSize: titleTextSize,
        fontWeight: 'bold',
        color: "black",
      },
      topRightBannerButton: { // COMMON USE: VOLUME BUTTON
        position: 'absolute',
        right: '3%',
      },
      topLeftBannerButton: { // COMMON USE: BACK BUTTON
        position: 'absolute',
        left: '3%',
      },
      buttonGrid: { // CONTAINER FOR THE GRID BUTTONS
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        flex: 1,
        justifyContent: 'flex-start',
      },
      gridButton4: { // 2x2 GRID BUTTONS
        width: '48%', // Nearly half of horizontal screenspace
        height: '48%', // Almost half of available vertical screenspace
        margin: '1%', // Spacing between grid buttons
        backgroundColor: buttonColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
      },
      gridButtonBig: { // 1x2 GRID BUTTON
        width: '98%', // Nearly full horizontal screenspace
        height: '48%', // Almost half of available vertical screenspace
        margin: '1%',
        backgroundColor: buttonColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
      },
      gridButtonBigToggled: { // 1x2 GRID BUTTON TOGGLED
        width: '98%', // Nearly full horizontal screenspace
        height: '48%', // Almost half of available vertical screenspace
        margin: '1%',
        backgroundColor: buttonColorToggled,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
      },
      bottomButton: { // COMMON USE: NAVIGATE, RETURN TO HOME
        width: '98%',
        height: '20%', // 1/5th of vertical screenspace
        backgroundColor: bottomButtonColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
      },
    })};

  export default createStyles;
