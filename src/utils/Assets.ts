/* eslint-disable global-require */
import loginRIghtImage from '../assets/images/login_right_image.png';
import loginLeftImage from '../assets/images/login_left_image.png';
import eventyLoginLogo from '../assets/images/eventy_login_logo.png';
import sidebarlogo from '../assets/images/sidebarlogo.png'
import sidebarexpandedlogo from '../assets/images/sidebarExpandedlogo.png'
import leftarrow from '../assets/icons/arrow-left.png'
import plus from '../assets/icons/plus.png'
import plusblue from '../assets/icons/plus_blue.png'
import star from '../assets/icons/stars_expressbadge.png'
import setting from '../assets/icons/setting.png'
import settingback from '../assets/images/setting_back.png'
import expresstabback from '../assets/images/expresstab_back.png'
import advancedot from '../assets/icons/advance_dot.png'
import expressdot from '../assets/icons/express_dot.png'
class AppAssets {
  readonly images = {
    loginRIghtImage: loginRIghtImage,
    loginLeftImage: loginLeftImage,
    eventyLoginLogo: eventyLoginLogo,
    sideBarLogo: sidebarlogo,
    sidebarExpandedLogo: sidebarexpandedlogo,
    settingBack: settingback,
    expressTabBack: expresstabback
    
    // splash1: require('../assets/images/splash1.png'),
    
  } as const;

  readonly icons = {

    leftArrow: leftarrow,
    plus: plus,
    plusBlue: plusblue,
    star: star,
    setting: setting,
    expressDot: expressdot,
    advanceDot: advancedot

  } as const;

  readonly temp = {
    // home: require('../assets/temp/home.png'),
    
  } as const;

  readonly svg = {} as const;
}

const Assets = new AppAssets();

export default Assets;
