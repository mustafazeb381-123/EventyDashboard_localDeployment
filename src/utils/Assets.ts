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
import whitebackstar from '../assets/images/white_back_star.png'
import whitebacksetting from '../assets/images/setting_back_white.png'
import eventemptycard from '../assets/images/event_empty_card.png'
import templateone from '../assets/images/template_one.png'
import templatetwo from '../assets/images/template_two.png'
import templatethree from '../assets/images/template_three.png'
import templatefour from '../assets/images/template_four.png'
import templatefive from '../assets/images/template_five.png'
import templatesix from '../assets/images/template_six.png'
import templateseven from '../assets/images/template_seven.png'
import uploadbackground from '../assets/images/upload_background.jpg'
import uploadbackground2 from '../assets/images/upload_background2.jpg'
import scclogo from '../assets/images/scc_logo.png'
import location from '../assets/icons/location.png'
import clock from '../assets/icons/clock.png'
import upload from '../assets/icons/upload.png'
import background4 from '../assets/images/background4.jpg'
import background5 from '../assets/images/background5.png'
import uploadbackground3 from '../assets/images/upload_background3.jpg'
import b1_front from '../assets/images/b1-front.png'
import b1_back from '../assets/images/b1-back.png'
import b2_front from '../assets/images/b2-front.png'
import b2_back from '../assets/images/b2-back.png'
import b3_front from '../assets/images/b3-front.png'
import b3_back from '../assets/images/b3-back.png'
import b4_front from '../assets/images/b4-front.png'
import b4_back from '../assets/images/b4-back.png'
import b5_front from '../assets/images/b5-front.png'
import b5_back from '../assets/images/b5-back.png'
import b6_front from '../assets/images/b6-front.png'
import b6_back from '../assets/images/b6-back.png'
import b7_front from '../assets/images/b7-front.png'
import b7_back from '../assets/images/b7-back.png'
import b8_front from '../assets/images/b8-front.png'
import b8_back from '../assets/images/b8-back.png'


class AppAssets {
  readonly images = {
    loginRIghtImage: loginRIghtImage,
    loginLeftImage: loginLeftImage,
    eventyLoginLogo: eventyLoginLogo,
    sideBarLogo: sidebarlogo,
    sidebarExpandedLogo: sidebarexpandedlogo,
    settingBack: settingback,
    expressTabBack: expresstabback,
    whiteBackStar: whitebackstar,
    whiteBackSetting: whitebacksetting,
    eventEmptyCard: eventemptycard,
    templateOne: templateone,
    templateTwo: templatetwo,
    templateThree: templatethree,
    templateFour: templatefour,
    templateFive: templatefive,
    templateSix: templatesix,
    templateSeven: templateseven,
    uploadBackground: uploadbackground,
    sccLogo: scclogo,
    uploadBackground2: uploadbackground2,
    uploadBackground3: uploadbackground3,
    background4: background4,
    background5: background5,
    b1_front: b1_front,
    b1_back: b1_back,
    b2_front: b2_front,
    b2_back: b2_back,
    b3_front: b3_front,
    b3_back: b3_back,
    b4_front: b4_front,
    b4_back: b4_back,
    b5_front: b5_front,
    b5_back: b5_back,
    b6_front: b6_front,
    b6_back: b6_back,
    b7_front: b7_front,
    b7_back: b7_back,
    b8_front: b8_front,
    b8_back: b8_back,
    // splash1: require('../assets/images/splash1.png'),
  } as const;

  readonly icons = {

    leftArrow: leftarrow,
    plus: plus,
    plusBlue: plusblue,
    star: star,
    setting: setting,
    expressDot: expressdot,
    advanceDot: advancedot,
    location: location,
    clock: clock,
    upload: upload

  } as const;

  readonly temp = {
    // home: require('../assets/temp/home.png'),
  } as const;

  readonly svg = {} as const;
}

const Assets = new AppAssets();

export default Assets;
