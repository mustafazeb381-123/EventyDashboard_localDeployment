// src/utils/Assets.ts
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
import temp1 from '../assets/images/temp1.png';
import temp2 from '../assets/images/temp2.png';
import loginbg from '../assets/images/loginbg.jpeg';


// Badge variations
import b1_front from '../assets/images/b1-front.png';
import b1_back from '../assets/images/b1-back.png';
import b2_front from '../assets/images/b2-front.png';
import b2_back from '../assets/images/b2-back.png';
import b3_front from '../assets/images/b3-front.png';
import b3_back from '../assets/images/b3-back.png';
import b4_front from '../assets/images/b4-front.png';
import b4_back from '../assets/images/b4-back.png';
import b5_front from '../assets/images/b5-front.png';
import b5_back from '../assets/images/b5-back.png';
import b6_front from '../assets/images/b6-front.png';
import b6_back from '../assets/images/b6-back.png';
import b7_front from '../assets/images/b7-front.png';
import b7_back from '../assets/images/b7-back.png';
import b8_front from '../assets/images/b8-front.png';
import b8_back from '../assets/images/b8-back.png';
import user_img from '../assets/images/userImg.png';
import square_user_img from '../assets/images/squareUserImg.png';
import qr_img from '../assets/images/qrImg.png';

import card_header from '../assets/images/cardHeader.svg';
import card_header2 from '../assets/images/cardHeader2.svg';
import card_footer from '../assets/images/cardFooter.svg';
import card_footer2 from '../assets/images/cardFooter2.svg';

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
import label from '../assets/icons/label.png';
import rejectionEmailOne from '../assets/icons/rejection_email_one.png';
import rejectionEmailTwo from '../assets/icons/rejection_email_two.png';
import approvedRegistration from '../assets/icons/approved_registration.png'
import invitationRegistration from '../assets/icons/invitation_registration.png'
import pendingUsers from '../assets/icons/pending_users.png'
import todayRegistration from '../assets/icons/today_registration.png'
import totalRegistration from '../assets/icons/total_registration.png'
import totalTicket from '../assets/icons/total_ticket.png';
import totalSold from '../assets/icons/total_sold.png';
import reports from '../assets/icons/reports.png';
import tickMark from '../assets/icons/tickmark.png';
import copyIcon from '../assets/icons/copy.png';

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
  b1_front,
  b1_back,
  b2_front,
  b2_back,
  b3_front,
  b3_back,
  b4_front,
  b4_back,
  b5_front,
  b5_back,
  b6_front,
  b6_back,
  b7_front,
  b7_back,
  b8_front,
  b8_back,
  temp1,
  temp2,
  user_img,
  square_user_img,
  qr_img,
  card_header,
  card_footer,
  card_header2,
  card_footer2,
  loginbg
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
  reminderEmailOne,
  reminderEmailTwo,
  label,
  rejectionEmailOne,
  rejectionEmailTwo,
  approvedRegistration,
  invitationRegistration,
  pendingUsers,
  todayRegistration,
  totalRegistration,
  totalTicket,
  totalSold,
  reports,
  tickMark,
  copyIcon,
} as const;

// Optional temp object
export const temp = {} as const;

// Type-safe keys
export type ImageKeys = keyof typeof images;
export type IconKeys = keyof typeof icons;

// Default export
const Assets = { images, icons, temp };
export default Assets;
