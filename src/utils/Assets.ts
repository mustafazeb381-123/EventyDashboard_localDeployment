// src/utils/Assets.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* eslint-disable global-require */

// Images
import loginRightImage from '../assets/images/login_right_image.png';
import loginLeftImage from '../assets/images/login_left_image.png';
import eventyLoginLogo from '../assets/images/eventy_login_logo.png';
import sideBarLogo from '../assets/images/sidebarlogo.png';
import sidebarExpandedLogo from '../assets/images/sidebarExpandedlogo.png';
import settingBack from '../assets/images/setting_back.png';
import expressTabBack from '../assets/images/expresstab_back.png';
import whiteBackStar from '../assets/images/white_back_star.png';
import whiteBackSetting from '../assets/images/setting_back_white.png';
import eventEmptyCard from '../assets/images/event_empty_card.png';
import templateOne from '../assets/images/template_one.png';
import templateTwo from '../assets/images/template_two.png';
import templateThree from '../assets/images/template_three.png';
import templateFour from '../assets/images/template_four.png';
import templateFive from '../assets/images/template_five.png';
import templateSix from '../assets/images/template_six.png';
import templateSeven from '../assets/images/template_seven.png';
import uploadBackground from '../assets/images/upload_background.jpg';
import uploadBackground2 from '../assets/images/upload_background2.jpg';
import uploadBackground3 from '../assets/images/upload_background3.jpg';
import background4 from '../assets/images/background4.jpg';
import background5 from '../assets/images/background5.png';
import badge1 from '../assets/images/badge1.png';
import sccLogo from '../assets/images/scc_logo.png';


// Icons
import leftArrow from '../assets/icons/arrow-left.png';
import plus from '../assets/icons/plus.png';
import plusBlue from '../assets/icons/plus_blue.png';
import star from '../assets/icons/stars_expressbadge.png';
import setting from '../assets/icons/setting.png';
import expressDot from '../assets/icons/express_dot.png';
import advanceDot from '../assets/icons/advance_dot.png';
import location from '../assets/icons/location.png';
import clock from '../assets/icons/clock.png';
import upload from '../assets/icons/upload.png';
import locationBlue from '../assets/icons/location_blue.png';
import infoCircle from '../assets/icons/info_circle.png';
import registrationDone from '../assets/icons/registrationDone.png';
import thanksEmailOne from '../assets/icons/thanks_email_one.png';
import thanksEmailTwo from '../assets/icons/thank_email_two.png';
import confirmationEmailOne from '../assets/icons/confirmation_email_one.png';
import reminderEmailOne from '../assets/icons/reminder_email_one.png';
import reminderEmailTwo from '../assets/icons/reminder_email_two.png';
import label from '../assets/icons/label.png'
import rejectionEmailOne from '../assets/icons/rejection_email_one.png'
import rejectionEmailTwo from '../assets/icons/rejection_email_two.png'

// Images object
export const images = {
  loginRightImage,
  loginLeftImage,
  eventyLoginLogo,
  sideBarLogo,
  sidebarExpandedLogo,
  settingBack,
  expressTabBack,
  whiteBackStar,
  whiteBackSetting,
  eventEmptyCard,
  templateOne,
  templateTwo,
  templateThree,
  templateFour,
  templateFive,
  templateSix,
  templateSeven,
  uploadBackground,
  uploadBackground2,
  uploadBackground3,
  background4,
  background5,
  badge1,
  sccLogo,

} as const;

// Icons object
export const icons = {
  leftArrow,
  plus,
  plusBlue,
  star,
  setting,
  expressDot,
  advanceDot,
  location,
  clock,
  upload,
  locationBlue,
  infoCircle,
  registrationDone,
  thanksEmailOne,
  thanksEmailTwo,
  confirmationEmailOne,
  label,
  reminderEmailOne,
  reminderEmailTwo,
  rejectionEmailOne,
  rejectionEmailTwo
} as const;

// Optional temp object
export const temp = {} as const;

// Type-safe keys
export type ImageKeys = keyof typeof images;
export type IconKeys = keyof typeof icons;

// Default export
const Assets = { images, icons, temp };
export default Assets;
