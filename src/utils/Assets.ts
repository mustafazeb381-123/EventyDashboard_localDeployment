/* eslint-disable global-require */
import loginRIghtImage from '../assets/images/login_right_image.png';
import loginLeftImage from '../assets/images/login_left_image.png';
import eventyLoginLogo from '../assets/images/eventy_login_logo.png';
import sidebarlogo from '../assets/images/sidebarlogo.png'
import sidebarexpandedlogo from '../assets/images/sidebarExpandedlogo.png'
import leftarrow from '../assets/icons/arrow-left.png'

class AppAssets {
  readonly images = {
    loginRIghtImage: loginRIghtImage,
    loginLeftImage: loginLeftImage,
    eventyLoginLogo: eventyLoginLogo,
    sideBarLogo: sidebarlogo,
    sidebarExpandedLogo : sidebarexpandedlogo
    
    // splash1: require('../assets/images/splash1.png'),
    
  } as const;

  readonly icons = {

    leftArrow : leftarrow

  } as const;

  readonly temp = {
    // home: require('../assets/temp/home.png'),
    
  } as const;

  readonly svg = {} as const;
}

const Assets = new AppAssets();

export default Assets;
